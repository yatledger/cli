const routes = [
  {
    path: '/', // TODO: active-link not for all
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'sign', component: () => import('pages/SignUp.vue') },
      { path: 'restore', component: () => import('pages/RestorePage.vue') },
      { path: 'msg', component: () => import('pages/SendMsg.vue') },
      { path: 'send', component: () => import('pages/SendTx.vue') },
      { path: 'read', component: () => import('pages/ReadMsg.vue') },
      { path: 'qr', component: () => import('src/pages/ScanQr.vue') },
      { path: 'help', component: () => import('src/pages/landing/HelpPage.vue') },
      { path: 'global', component: () => import('src/pages/TxGlobal.vue') },
      { path: 'myqr', component: () => import('src/pages/user/UserQR.vue') },
      { path: 'friends', component: () => import('src/pages/user/UserFriends.vue') },
      { path: 'tx', component: () => import('src/pages/user/UserTx.vue') },
      { path: 'profile', component: () => import('src/pages/user/UserProfile.vue') },
      { path: 'ask', component: () => import('src/pages/landing/AskPage.vue') },
      { path: 'faucet', component: () => import('src/pages/landing/FaucetPage.vue') },
      { path: 'spend', component: () => import('src/pages/landing/SpendPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
