<script setup>
import { userStore } from 'stores/user'
import { Notify, copyToClipboard } from 'quasar'
import { base58 } from '@scure/base'
const user = userStore()
const sk = base58.encode(user.sk.slice(0, 32))
const copy = (txt) => {
  copyToClipboard(txt)
    .then(() => {
      Notify.create('ok')
    })
    .catch(() => {
      // fail
    })
}
</script>

<template>
  <q-page>
    <p>
      Seed:<br />
      <q-card class="text-h4" @click="copy(user.seed)"
        ><q-card-section>{{ user.seed }}</q-card-section></q-card
      >
    </p>
    <p>
      Address:<br />
      <q-card class="text-h4" @click="copy(user.pk)"
        ><q-card-section>{{ user.pk }}</q-card-section></q-card
      >
    </p>
    <p>
      Private:<br />
      <q-card class="text-h4" @click="copy(sk)"
        ><q-card-section>{{ sk }}</q-card-section></q-card
      >
    </p>
  </q-page>
</template>
