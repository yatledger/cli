import sodium from 'libsodium-wrappers'
import * as bip39 from 'bip39'
import { base58 } from '@scure/base'
// Polyfill Buffer for browser compatibility
import { Buffer } from 'buffer'
globalThis.Buffer = Buffer // Ensure Buffer is available globally for bip39

// Инициализация libsodium
let sodiumReady = false
;(async () => {
  await sodium.ready
  sodiumReady = true
})()

// Генерация 24-словной мнемонической фразы
export async function generateMnemonic() {
  if (!sodiumReady) await sodium.ready

  // Устанавливаем 256 бит энтропии для 24 слов
  const entropy = sodium.randombytes_buf(32) // 256 бит = 32 байта
  return bip39.entropyToMnemonic(entropy)
}

// Генерация ключей Ed25519 из seed-фразы
export async function generateKeysFromSeed(mnemonic) {
  if (!sodiumReady) await sodium.ready

  // Проверяем валидность мнемонической фразы
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase')
  }

  // Преобразуем мнемоническую фразу в seed (64 байта)
  const seed = await bip39.mnemonicToSeed(mnemonic)

  // Используем первые 32 байта seed для генерации приватного ключа Ed25519
  const { publicKey, privateKey } = sodium.crypto_sign_seed_keypair(seed.slice(0, 32))

  return {
    privateKey, // Buffer (64 байта, включает публичный ключ)
    publicKey // Buffer (32 байта)
  }
}

// Подпись сообщения
export async function signMessage(message, privateKey) {
  if (!sodiumReady) await sodium.ready
  // Предполагаем, что privateKey и message — Buffer
  return sodium.to_hex(sodium.crypto_sign_detached(message, privateKey))
}

// Проверка подписи
export async function verifySignature(publicKey, message, signature) {
  if (!sodiumReady) await sodium.ready
  try {
    return sodium.crypto_sign_verify_detached(signature, message, publicKey)
  } catch (e) {
    console.error(e)
    return false
  }
}

// Шифрование сообщения
export async function encryptMessage(message, recipientPublicKey, privateKey) {
  if (!sodiumReady) await sodium.ready
  // Конвертируем ключи Ed25519 в X25519
  const privateKeyX25519 = sodium.crypto_sign_ed25519_sk_to_curve25519(privateKey)
  const recipientPublicKeyX25519 = sodium.crypto_sign_ed25519_pk_to_curve25519(
    base58.decode(recipientPublicKey)
  )

  // Генерируем nonce (24 байта)
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES)

  // Шифруем сообщение
  const ciphertext = sodium.crypto_box_easy(
    message,
    nonce,
    recipientPublicKeyX25519,
    privateKeyX25519
  )

  // Конкатенируем nonce + ciphertext и кодируем в HEX
  const combined = Buffer.concat([nonce, ciphertext])
  return combined.toString('hex')
}

// Расшифровка сообщения
export async function decryptMessage(combinedHex, senderPublicKey, recipientPrivateKey) {
  if (!sodiumReady) await sodium.ready
  // Декодируем HEX в байты
  const combined = Buffer.from(combinedHex, 'hex')

  // Разделяем на nonce (24 байта) и ciphertext
  const nonce = combined.slice(0, sodium.crypto_box_NONCEBYTES)
  const ciphertext = combined.slice(sodium.crypto_box_NONCEBYTES)

  // Конвертируем ключи Ed25519 в X25519
  const senderPublicKeyX25519 = sodium.crypto_sign_ed25519_pk_to_curve25519(
    base58.decode(senderPublicKey)
  )
  const recipientPrivateKeyX25519 = sodium.crypto_sign_ed25519_sk_to_curve25519(recipientPrivateKey)

  // Расшифровываем сообщение
  return Buffer.from(
    sodium.crypto_box_open_easy(ciphertext, nonce, senderPublicKeyX25519, recipientPrivateKeyX25519)
  ).toString()
}

// Шифрование seed-фразы с пин-кодом
export async function encryptSeedWithPin(mnemonic, pin) {
  if (!sodiumReady) await sodium.ready

  // Преобразуем пин-код в ключ с помощью crypto_pwhash
  const key = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES, // 32 байта
    pin,
    sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES), // Случайная соль
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_DEFAULT
  )

  // Генерируем nonce
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)

  // Шифруем мнемоническую фразу
  const ciphertext = sodium.crypto_secretbox_easy(mnemonic, nonce, key)

  // Возвращаем соль, nonce и зашифрованную фразу
  return {
    salt: Buffer.from(key).toString('hex'),
    nonce: Buffer.from(nonce).toString('hex'),
    ciphertext: Buffer.from(ciphertext).toString('hex')
  }
}

// Расшифровка seed-фразы с пин-кодом
export async function decryptSeedWithPin(encryptedData, pin) {
  if (!sodiumReady) await sodium.ready

  const { salt, nonce, ciphertext } = encryptedData

  // Преобразуем пин-код в ключ с той же солью
  const key = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    pin,
    Buffer.from(salt, 'hex'),
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_DEFAULT
  )

  // Расшифровываем
  const plaintext = sodium.crypto_secretbox_open_easy(
    Buffer.from(ciphertext, 'hex'),
    Buffer.from(nonce, 'hex'),
    key
  )

  return Buffer.from(plaintext).toString()
}
