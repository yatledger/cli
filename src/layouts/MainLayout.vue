<script setup>
import signin from 'components/SignIn.vue'
import { ref, computed, watch } from 'vue'
import { userStore } from 'stores/user'
import db from 'boot/db'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const dark = ref($q.dark.isActive)
const darkToggle = () => {
  $q.dark.toggle()
}

const leftDrawerOpen = ref(false)
const enter = ref(false)

const user = userStore()
const router = useRouter()

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const exit = () => {
  user.reset()
}

const clear = async () => {
  await db.delete('settings', 'seed')
  user.reset()
  user.crypt = false
  window.location.reload(true)
}
const noLogin = computed(() => user.crypt && user.sk.length === 0)

watch(noLogin, () => {
  if (noLogin.value) {
    router.push('/login')
  } else {
    router.push('/')
  }
})
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>{{ $t('title') }}</q-toolbar-title>

        <q-btn
          icon="login"
          v-if="user.crypt && user.sk.length === 0"
          @click="enter = true"
          color="secondary"
        ></q-btn>
        <q-btn
          icon="logout"
          class="q-ml-sm"
          v-if="user.sk.length > 0"
          @click="exit"
          color="secondary"
        ></q-btn>
        <!--TODO: mode in db-->
        <q-toggle v-model="dark" color="black" @click="darkToggle" />
        <!--TODO: locale in db-->
        <q-select class="q-ml-sm" v-model="$i18n.locale" :options="$i18n.availableLocales" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>{{ $t('menu.title') }}:</q-item-label>
        <q-item clickable tag="a" to="/">
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('menu.home') }}</q-item-label>
            <q-item-label caption>{{ $t('menu.homeDesc') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item v-if="!user.crypt" clickable tag="a" to="/sign">
          <q-item-section avatar><q-icon name="perm_identity" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('menu.sign') }}</q-item-label>
            <q-item-label caption>{{ $t('menu.signDesc') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="user.crypt" clickable tag="a" to="/send">
          <q-item-section avatar><q-icon name="send" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('menu.send') }}</q-item-label>
            <q-item-label caption>{{ $t('menu.sendDesc') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="user.crypt" clickable tag="a" to="/msg">
          <q-item-section avatar><q-icon name="edit" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('menu.msg') }}</q-item-label>
            <q-item-label caption>{{ $t('menu.msgDesc') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="user.crypt" clickable tag="a" to="/read">
          <q-item-section avatar><q-icon name="chat" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('menu.recive') }}</q-item-label>
            <q-item-label caption>{{ $t('menu.reciveDesc') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="user.crypt" @click="clear" clickable tag="span">
          <q-item-section avatar><q-icon name="delete" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('menu.clear') }}</q-item-label>
            <q-item-label caption>{{ $t('menu.clearDesc') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/help" clickable tag="span">
          <q-item-section avatar><q-icon name="help" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('menu.help') }}</q-item-label>
            <q-item-label caption>{{ $t('menu.helpDesc') }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-dialog v-model="enter" persistent>
      <signin />
    </q-dialog>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer elevated v-if="user.sk.length > 0">
      <q-toolbar class="flex flex-center q-pa-sm">
        <!--q-btn round size="lg" icon="account_box" to="/friends"></q-btn-->
        <q-btn round size="lg" icon="sync_alt" to="/tx"></q-btn>
        <q-btn round size="lg" icon="qr_code_scanner" to="/qr"></q-btn>
        <q-btn round size="lg" icon="language" to="/global"></q-btn>
        <q-btn round size="lg" icon="manage_accounts" to="/profile"></q-btn>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>
