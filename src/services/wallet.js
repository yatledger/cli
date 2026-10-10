import sodium from 'libsodium-wrappers'
import { pbkdf2 } from '@noble/hashes/pbkdf2'
import { sha512 } from '@noble/hashes/sha512'
import db from 'boot/db'

export const SEED_FORMAT_VERSION = 1

const PBKDF2_ITERATIONS = 210000
const SALT_BYTES = 16

let ready = false
async function ensureSodium() {
  if (!ready) {
    await sodium.ready
    ready = true
  }
}

function deriveKey(pin, salt) {
  return pbkdf2(sha512, sodium.from_string(pin), salt, {
    c: PBKDF2_ITERATIONS,
    dkLen: sodium.crypto_secretbox_KEYBYTES
  })
}

export async function encryptSeed(mnemonic, pin) {
  await ensureSodium()
  const salt = sodium.randombytes_buf(SALT_BYTES)
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
  const key = deriveKey(pin, salt)
  const ciphertext = sodium.crypto_secretbox_easy(sodium.from_string(mnemonic), nonce, key)
  return {
    v: SEED_FORMAT_VERSION,
    salt: sodium.to_hex(salt),
    nonce: sodium.to_hex(nonce),
    ciphertext: sodium.to_hex(ciphertext)
  }
}

export async function decryptSeed(encrypted, pin) {
  await ensureSodium()
  if (!encrypted || encrypted.v !== SEED_FORMAT_VERSION) {
    throw new Error('Unsupported seed format')
  }
  const salt = sodium.from_hex(encrypted.salt)
  const nonce = sodium.from_hex(encrypted.nonce)
  const ciphertext = sodium.from_hex(encrypted.ciphertext)
  const key = deriveKey(pin, salt)
  const plaintext = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key)
  if (!plaintext) {
    throw new Error('Invalid password')
  }
  return sodium.to_string(plaintext)
}

export async function saveSeed(mnemonic, pin) {
  const encrypted = await encryptSeed(mnemonic, pin)
  await db.set('settings', 'seed', encrypted)
  return encrypted
}

export async function loadSeed(pin) {
  const encrypted = await db.get('settings', 'seed')
  if (!encrypted) return null
  return decryptSeed(encrypted, pin)
}
