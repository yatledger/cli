<script setup>
import { ref, computed } from 'vue'
import { userStore } from 'stores/user'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Notify } from 'quasar'

const { t } = useI18n()
const user = userStore()
const router = useRouter()

const pwd = ref('')
const isPwd = ref(true)

const signin = async () => {
  try {
    await user.signIn(pwd.value)
    router.push('/')
  } catch {
    Notify.create({ type: 'negative', message: t('enter.wrong') })
  }
}
const disabled = computed(() => pwd.value.length < 8)
</script>

<template>
  <q-card>
    <q-card-section>
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
      />
    </q-card-actions>
  </q-card>
</template>
