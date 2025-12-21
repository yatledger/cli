<script setup>
import slideshow from 'components/SlideShow.vue'
import { computed } from 'vue'
import { userStore } from 'stores/user'
import VueQrcode from '@chenfengyuan/vue-qrcode'
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
const user = userStore()
const userLink = computed(() => 'yat.io/address/' + user.pk)
const pk = computed(() => user.pk)
const { result } = useQuery(
  gql`
    query GetBalance($addr: String!) {
      balance(addr: $addr)
    }
  `,
  {
    addr: pk
  },
  {
    fetchPolicy: 'cache-and-network', // https://apollo.vuejs.org/guide-composable/query.html#fetch-policy
    enabled: pk
  }
)
const balance = computed(() => result.value?.balance ?? '')
</script>

<template>
  <slideshow />
  <q-page class="flex flex-center">
    <div class="collumn text-center">
      <div v-if="user.sk.length > 0" style="width: 75vw">
        <h1 class="h-balance">{{ balance / 1000000 }} F</h1>
        <figure class="qrcode">
          <vue-qrcode
            :value="userLink"
            :options="{
              width: 250,
              color: {
                dark: '#3e007a',
                light: '#ffffff'
              }
            }"
          >
          </vue-qrcode>
          <img class="qrcode__image" src="/icons/icon-qr.png" />
        </figure>
        <div class="row flex-center q-gutter-sm" style="width: 100%">
          <q-btn round color="primary" href="https://t.me/yatbot" icon="cruelty_free" size="l" />
          <q-btn round color="primary" to="/send" icon="send" size="l" />
        </div>
      </div>
      <div v-else>
        <img :alt="$t('title')" src="/logo.svg" class="logo" />
      </div>
    </div>
  </q-page>
</template>
<style scoped lang="scss">
h1 {
  font-family: 'Roboto Slab', serif;
  font-size: 100px;
  font-weight: normal;
  padding: 0;
  margin: 0;
  margin-bottom: 1vh;
}

.qrcode {
  display: inline-block;
  font-size: 0;
  margin-bottom: 0;
  position: relative;
}

.qrcode__image {
  height: 48px;
  left: 50%;
  top: 50%;
  overflow: hidden;
  position: absolute;
  transform: translate(-50%, -50%);
  width: 48px;
}

@import url('https://fonts.googleapis.com/css2?family=Sofia+Sans&display=swap');

.logo {
  opacity: 0.75;
}

@media (orientation: landscape) {
  .logo {
    height: 50vh;
  }
}

@media (orientation: portrait) {
  .logo {
    width: 75vw;
  }
}

.h-balance {
  color: #ffffff;
}

.container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
