import { defineStore } from 'pinia'
import { ref } from 'vue'
import db from 'boot/db'
import { base58 } from '@scure/base'
import { box } from 'tweetnacl'
import { generateKeysFromSeed } from 'boot/crypt'
import { loadSeed } from 'src/services/wallet'

export const userStore = defineStore('user', () => {
  const sk = ref(new Uint8Array())
  const pk = ref('')
  const seed = ref('')
  const mk = ref('')
  const crypt = ref(false)
  const ready = ref(false)

  ;(async () => {
    const stored = await db.get('settings', 'seed')
    crypt.value = !!stored
    ready.value = true
  })()

  const applyKeys = (mnemonic, keys) => {
    sk.value = keys.privateKey
    pk.value = base58.encode(keys.publicKey)
    seed.value = mnemonic
    mk.value = base58.encode(box.keyPair.fromSecretKey(keys.privateKey.slice(32, 64)).publicKey)
  }

  const setMnemonic = async (mnemonic) => {
    const keys = await generateKeysFromSeed(mnemonic)
    applyKeys(mnemonic, keys)
    return keys
  }

  const signIn = async (pin) => {
    const mnemonic = await loadSeed(pin)
    if (!mnemonic) throw new Error('No seed stored')
    const keys = await generateKeysFromSeed(mnemonic)
    applyKeys(mnemonic, keys)
    return keys
  }

  const reset = () => {
    sk.value = new Uint8Array()
    pk.value = ''
    seed.value = ''
    mk.value = ''
  }

  return { sk, pk, seed, mk, crypt, ready, setMnemonic, signIn, reset }
})
