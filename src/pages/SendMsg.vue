<script setup>
import { ref } from 'vue'
import { userStore } from 'stores/user'
import { encryptMessage } from 'boot/crypt'

const user = userStore()
const msg = ref('')
const addr = ref('')
const enc = ref('')

const send = async () => {
  enc.value = await encryptMessage(msg.value, addr.value, user.sk)
}
</script>

<template>
  <q-page>
    <q-input label="Address" v-model="addr" placeholder="Recipient's address"></q-input>
    <q-input type="textarea" v-model="msg" label="Message" no-resize hint="Your text"></q-input>
    <div class="q-mt-md q-mb-lg">
      <q-btn color="primary" size="xl" @click="send" label="Sign" />
    </div>
    <p>{{ enc }}</p>
  </q-page>
</template>
