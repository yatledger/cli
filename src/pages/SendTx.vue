<script setup>
import { ref } from 'vue'
import { userStore } from 'stores/user'
import { signMessage, encryptMessage } from 'boot/crypt'
import { sign } from 'tweetnacl'
import ky from 'ky'
import { Notify } from 'quasar'
import { sha512 } from '@noble/hashes/sha512'

const user = userStore()

const amount = ref()
const addr = ref('')
const msg = ref('')
const toCrypt = ref(false)
// parseFloat(amount.value).toFixed(1)

function orderedSum(t) {
  // Sort dictionary by keys and create a new object
  const s = Object.fromEntries(Object.entries(t).sort())

  // Initialize result string
  let m = ''

  // Iterate over values
  for (const value of Object.values(s)) {
    // If value is an array, join it into a string; otherwise, convert to string
    m += Array.isArray(value) ? value.join('') : String(value)
  }

  return m
}

function uint8ArrayToHex(uint8Array) {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const signTx = async () => {
  const uniq = crypto.randomUUID()
  const a = amount.value * 1000000
  const pool = await ky.get(process.env.REST_API + 'pool').json()
  const p = pool.nodes
  console.log(p)
  if (toCrypt.value && msg.value) {
    msg.value = await encryptMessage(msg.value, addr.value, user.sk)
    msg.value = '!SEC' + msg.value
  }
  let tx = {
    parents: p,
    credit: user.pk,
    debit: addr.value,
    amount: a,
    uniq: uniq,
    msg: msg.value
  }
  /*
  const ordered = Object.keys(tx)
    .sort()
    .reduce((obj, key) => {
      obj[key] = tx[key]
      return obj
    }, {})
  console.log(ordered)

  let m = ''
  for (const [, value] of Object.entries(ordered)) {
    m = m.concat(value)
  }
  console.log(m)
  */

  let m = orderedSum(tx)
  console.log(m)
  m = sha512(m)
  console.log(m)

  const enc1 = await signMessage(m, user.sk)
  console.log(enc1)
  const enc = sign(m, user.sk)
  uint8ArrayToHex(enc)
  console.log(enc)
  let mes = {
    content: tx,
    sign: enc1
  }
  console.log(mes)

  try {
    const r = await ky.post(process.env.REST_API + 'send', { json: mes }).json()
    Notify.create(r.detail[0].msg)
    console.log(r)
  } catch (e) {
    console.error(e)
    const err = await e.response.json()
    Notify.create(err.detail[0].msg)
  }
}
</script>

<template>
  <q-page>
    <q-input label="Address" v-model="addr" placeholder="Recipient's address"></q-input>
    <q-input type="number" step="0.000001" v-model="amount" placeholder="Amount"></q-input>
    <q-input type="textarea" v-model="msg" label="Message" no-resize hint="Your text"></q-input>
    <q-checkbox v-model="toCrypt" label="Encrypt?"></q-checkbox>
    <div class="q-mt-md q-mb-lg">
      <q-btn color="primary" size="xl" @click="signTx" label="Send" />
    </div>
  </q-page>
</template>
