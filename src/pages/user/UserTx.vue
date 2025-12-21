<script setup>
import { ref } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { userStore } from 'stores/user'
import { decryptMessage } from 'boot/crypt'

const user = userStore()
const showMsg = ref(false)
const msg = ref('')

const { result } = useQuery(
  gql`
    query MyQuery($addr: String) {
      tx(addr: $addr) {
        amount
        credit
        debit
        msg
        time
      }
    }
  `,
  {
    addr: user.pk
  },
  {
    pollInterval: 10000,
    fetchPolicy: 'cache-and-network'
  }
)

const decrypt = async (m, a) => {
  showMsg.value = true
  msg.value = await decryptMessage(m.slice(4), a, user.sk)
}
</script>

<template>
  <q-page v-if="result">
    <div v-for="tx in result.tx" :key="tx.time">
      <p>
        Amount: {{ tx.amount }}<br />
        Credit: {{ tx.credit }}<br />
        Debit: {{ tx.debit }}<br />
        Msg: {{ tx.msg }}
        <q-btn
          v-if="tx.debit === user.pk && tx.msg.startsWith('!SEC')"
          outline
          round
          color="primary"
          size="xs"
          @click="decrypt(tx.msg, tx.credit)"
          icon="key"
        />
        <br />
        Time: {{ tx.time }}
      </p>
    </div>
  </q-page>
  <q-dialog v-model="showMsg" persistent>
    <q-card>
      <q-card-section>
        {{ msg }}
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
