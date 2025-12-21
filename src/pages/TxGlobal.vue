<script setup>
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { computed } from 'vue'

const { result, loading, error, refetch } = useQuery(
  gql`
    query GetGlobalTx($msg: Boolean, $amount: Int, $skip: Int, $limit: Int) {
      tx(msg: $msg, amount: $amount, skip: $skip, limit: $limit) {
        amount
        credit
        debit
        msg
        time
        hash
      }
    }
  `,
  {
    msg: true,
    amount: 0,
    skip: 0,
    limit: 100
  },
  {
    pollInterval: 10000,
    fetchPolicy: 'cache-and-network'
  }
)

const txs = computed(() => result.value?.tx ?? [])

const monthAbbreviations = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const columns = [
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount'
  },
  {
    name: 'credit',
    label: 'Credit',
    field: 'credit',
    format: (val) => val?.slice(0, 5) + '…' || ''
  },
  {
    name: 'debit',
    label: 'Debit',
    field: 'debit',
    format: (val) => val?.slice(0, 5) + '…' || ''
  },
  {
    name: 'msg',
    label: 'Msg',
    field: 'msg',
    format: (val) => (val?.length > 5 ? val.slice(0, 5) + '…' : val || '')
  },
  {
    name: 'time',
    label: 'Time',
    field: 'time',
    format: (val) => {
      const date = new Date(Number(val) / 1000)
      const month = monthAbbreviations[date.getMonth()]
      const pad = (num) => String(num).padStart(2, '0')
      return `${pad(date.getDate())} ${month} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }
  }
]

const pagination = {
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 25
  // rowsNumber: xx if getting data from a server
}
</script>

<template>
  <q-btn color="primary" style="margin: 10px 0 0 10px" size="l" @click="refetch()" label="Update" />
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <q-page v-if="result">
    <q-table
      flat
      bordered
      :rows="txs"
      :columns="columns"
      :pagination="pagination"
      row-key="time"
      style="max-width: 100%; width: 100%"
    >
      <template v-slot:body-cell-time="props">
        <q-td :props="props">
          <router-link :to="`/transaction/${props.row.hash}`">
            {{ columns.find((col) => col.name === 'time').format(props.row.time) }}
          </router-link>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>
