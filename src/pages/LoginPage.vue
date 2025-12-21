<script setup>
import signin from 'components/SignIn.vue'
import slideshow from 'components/SlideShow.vue'
import { ref } from 'vue'
import { userStore } from 'stores/user'
const user = userStore()
const enter = ref(true)
</script>

<template>
  <slideshow />
  <q-dialog style="opacity: 0.75" v-if="user.crypt && user.sk.length === 0" v-model="enter">
    <signin />
  </q-dialog>
</template>
