<script setup>
import { ref, computed } from 'vue'
import { userStore } from 'stores/user'
import { base58 } from '@scure/base'
import { passwordStrength } from 'check-password-strength'
import { useI18n } from 'vue-i18n'
import { Notify, copyToClipboard } from 'quasar'
import { generateMnemonic, generateKeysFromSeed } from 'boot/crypt'
import { saveSeed } from 'src/services/wallet'

const { t } = useI18n()
const user = userStore()

const pwdOptions = [
  {
    id: 0,
    value: t('sign.pwd0'),
    minDiversity: 0,
    minLength: 0
  },
  {
    id: 1,
    value: t('sign.pwd1'),
    minDiversity: 1,
    minLength: 7
  },
  {
    id: 2,
    value: t('sign.pwd2'),
    minDiversity: 2,
    minLength: 7
  },
  {
    id: 3,
    value: t('sign.pwd3'),
    minDiversity: 3,
    minLength: 7
  },
  {
    id: 4,
    value: t('sign.pwd4'),
    minDiversity: 4,
    minLength: 8
  }
]

const pwd = ref('')
const pwdRef = ref(null)
const pk = ref('')
const isPwd = ref(true)
const mn = ref('')
let keys = null

;(async () => {
  mn.value = await generateMnemonic()
  keys = await generateKeysFromSeed(mn.value)
  pk.value = base58.encode(keys.publicKey)
})()

const signup = async () => {
  pwdRef.value.validate()
  if (pwdRef.value.hasError) {
    return
  }
  try {
    await saveSeed(mn.value, pwd.value)
    user.sk = keys.privateKey
    user.pk = pk.value
    user.seed = mn.value
    user.crypt = true
    window.location.reload(true)
  } catch {
    Notify.create({ type: 'negative', message: t('failed') })
  }
}

const hint = computed(() => (pwd.value ? passwordStrength(pwd.value, pwdOptions).value : false))

const disabled = computed(() => pwd.value.length < 8)

const copy = (txt) => {
  copyToClipboard(txt)
    .then(() => {
      Notify.create(t('sign.copy'))
    })
    .catch(() => {
      // fail
    })
}
</script>

<template>
  <q-page class="flex flex-center">
    <div class="collumn q-pa-sm text-center" v-if="!user.seed">
      <p class="text-justify text-body1">{{ $t('sign.t1') }}</p>
      <p>
        <q-card class="text-h4" @click="copy(mn)"
          ><q-card-section>{{ mn }}</q-card-section></q-card
        >
      </p>
      <p class="text-justify text-body1">{{ $t('sign.t2') }}:</p>
      <p>
        <q-card class="inline-block q-pa-xs text-caption">{{ pk }}</q-card>
      </p>
      <p class="text-left text-body1">{{ $t('sign.t3') }}</p>
      <q-input
        ref="pwdRef"
        v-model="pwd"
        filled
        counter
        :type="isPwd ? 'password' : 'text'"
        :placeholder="$t('characters')"
        :hint="hint ? hint : $t('sign.protect')"
        :label="$t('password')"
        lazy-rules
        :rules="[
          (val) => !!val || $t('sign.pwdMust'),
          (val) => val.length > 6 || $t('sign.pwdMore')
        ]"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
      <div class="q-mt-md">
        <q-btn
          push
          :disable="disabled"
          color="primary"
          size="xl"
          @click="signup"
          :label="$t('next')"
        />
      </div>
      <p class="text-subtitle1 q-mt-sm">
        <router-link to="/restore">{{ $t('sign.know') }}</router-link>
      </p>
    </div>
  </q-page>
</template>
