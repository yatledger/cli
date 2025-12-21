<template>
  <figure class="qrcode">
    <vue-qrcode
      :value="url"
      :options="{
        width: 250,
        color: {
          dark: '#3e007a',
          light: '#ffffff'
        }
      }"
    ></vue-qrcode>
    <img class="qrcode__image" src="/icons/icon-qr.png" />
  </figure>
</template>

<script setup>
import VueQrcode from '@chenfengyuan/vue-qrcode'
import { userStore } from 'stores/user'

const user = userStore()
console.log(user.pk)
const url = user.pk
</script>

<style scoped>
.qrcode {
  display: inline-block;
  font-size: 0;
  margin-bottom: 0;
  position: relative;
}

.qrcode__image {
  height: 48px;
  left: 50%;
  overflow: hidden;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
}
</style>
