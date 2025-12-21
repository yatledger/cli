<script setup>
import { ref, computed } from 'vue'
import { userStore } from 'stores/user'
import { useRouter } from 'vue-router'
import { sign, secretbox, box } from 'tweetnacl'
import { pbkdf2 } from '@noble/hashes/pbkdf2'
import { sha512 } from '@noble/hashes/sha512'
import { base58 } from '@scure/base'
import * as bip39 from '@scure/bip39'
import Cookies from 'js-cookie'

const user = userStore()
const router = useRouter()

const pwd = ref('')
const isPwd = ref(true)

const signin = async () => {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  const pwd8 = Uint8Array.from(encoder.encode(pwd.value))
  const salt = Uint8Array.from([])
  // FIXME: pwd2 & pwd8 are similar
  /*
  не ясно почему pbkdf2 не принимает pwd2 в тестах
  const pwd2: Uint8Array = encoder.encode(pwd.value)
  console.log(pwd8, typeof pwd8, pwd8.buffer)
  console.log(pwd2, typeof pwd2, pwd2.buffer)
  */
  const k = pbkdf2(sha512, pwd8, salt, { c: 2048, dkLen: 32 })
  const mn = decoder.decode(secretbox.open(base58.decode(user.crypt), new Uint8Array(24), k))
  console.log(mn)
  // const seed = pbkdf2(sha512, Uint8Array.from(encoder.encode(mn)), salt, { c: 2048, dkLen: 32 })
  let seed = bip39.mnemonicToSeedSync(mn).slice(0, 32)
  const keys = sign.keyPair.fromSeed(seed)
  user.sk = keys.secretKey
  user.pk = base58.encode(keys.publicKey)
  user.seed = mn
  const mkeys = box.keyPair.fromSecretKey(user.sk.slice(32, 64))
  user.mk = base58.encode(mkeys.publicKey)
  // console.log(base58.encode(seed))
  Cookies.set('mn', mn, { expires: 0.01 })
  router.push('/')
}
const disabled = computed(() => pwd.value.length < 8)
</script>

<template>
  <q-card>
    <q-card-section>
      <!--TODO: enter key-->
      <q-input
        ref="in"
        v-model="pwd"
        dense
        filled
        counter
        autofocus
        @keyup.enter="signin"
        :type="isPwd ? 'password' : 'text'"
        :placeholder="$t('enter.remember')"
        :hint="$t('enter.hint')"
        :label="$t('password')"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
    </q-card-section>

    <q-card-actions align="right" class="text-primary">
      <q-btn flat :label="$t('cancel')" v-close-popup />
      <q-btn
        ref="ok"
        flat
        :disable="disabled"
        color="primary"
        @click="signin"
        :label="$t('ok')"
        v-close-popup
      />
    </q-card-actions>
  </q-card>
</template>
