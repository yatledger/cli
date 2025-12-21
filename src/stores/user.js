import { defineStore } from 'pinia'
import { ref } from 'vue'
import db from 'boot/db'
import Cookies from 'js-cookie'
import { base58 } from '@scure/base'
import { generateKeysFromSeed } from 'boot/crypt'

// TODO: !!STATE!!
export const userStore = defineStore('user', () => {
  const crypt = ref('')
  const sk = ref(new Uint8Array())
  const pk = ref('')
  const seed = ref('')
  ;(async () => {
    const r = await db.get('settings', 'seed')
    if (r !== undefined || typeof r !== 'undefined') {
      crypt.value = r
    }
    const mn = Cookies.get('mn')
    if (mn) {
      const keys = await generateKeysFromSeed(mn)
      sk.value = keys.privateKey
      pk.value = base58.encode(keys.publicKey)
      seed.value = mn
    }
    // console.log(pk.value, sk.value, crypt.value)
  })()
  return { sk, pk, seed, crypt }
})
