<script setup>
import { ref } from 'vue'
import { userStore } from 'stores/user'
import { decryptMessage } from 'boot/crypt'

const user = userStore()
const msg = ref('')
const addr = ref('')
const dec = ref('')

const read = async () => {
  dec.value = await decryptMessage(msg.value, addr.value, user.sk)
}
</script>

<template>
  <q-page>
    <q-input label="Address" v-model="addr" placeholder="Senders's address"></q-input>
    <q-input type="textarea" v-model="msg" label="Message" no-resize hint="Text"></q-input>
    <div class="q-mt-md q-mb-lg">
      <q-btn color="primary" size="xl" @click="read" label="Read" />
    </div>
    <p>{{ dec }}</p>
  </q-page>
</template>
