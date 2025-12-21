<script setup>
import { QrcodeStream } from 'vue-qrcode-reader'
import { ref } from 'vue'
const error = ref('')
const result = ref('')
const onDetect = (res) => {
  result.value = res
  /*const url = new URL(result)
  console.log(url.pathname)
  this.$router.push(url.pathname)*/
}

const onError = (err) => {
  if (err.name === 'NotAllowedError') {
    error.value = 'Разрешите доступ к камере'
  } else if (err.name === 'NotFoundError') {
    error.value = 'К устройству не подключена камера'
  } else if (err.name === 'NotSupportedError') {
    error.value = 'Используйте HTTPS'
  } else if (err.name === 'NotReadableError') {
    error.value = 'Используется в другом приложении'
  } else if (err.name === 'OverconstrainedError') {
    error.value = 'Камера не поддерживается'
  } else if (err.name === 'StreamApiNotSupportedError') {
    error.value = 'Используйте новейший браузер'
  } else if (err.name === 'InsecureContextError') {
    error.value = 'Незащищённый канал'
  } else {
    error.value = `Ошибка камеры (${err.name})`
  }
}
</script>

<template>
  <div justify="center" align="center" style="width: 100%">
    <p class="text-red">{{ error }}</p>
    {{ result }}
    <qrcode-stream :formats="['qr_code']" class="qr_scan" @detect="onDetect" @error="onError" />
  </div>
</template>

<style></style>
