---
name: coder
description: Use when modifying or extending the yat/cli web wallet — adding or changing pages, components, stores, boot files, wallet crypto, GraphQL/REST calls, i18n, or e2e tests. Covers the project's non-negotiable rules, path aliases, crypto constraints, IndexedDB layout, Quasar/Vite gotchas, and the verify workflow (lint + Playwright e2e).
---

# Skill: coder (yat/cli)

Практическое руководство для внесения правок и добавления функционала в веб-кошелёк `yat/cli`.
Дополняй этот файл новыми найденными тонкостями проекта.

## 0. Незыблемые правила (проверяй до начала работы)

1. **Не менять логику фундаментально.** Правки минимальны и строго в рамках задачи. Никаких
   изменений «заодно».
2. **Крупные правки — только с разрешения пользователя.** Если сомневаешься в масштабе — спроси.
3. **Только JavaScript.** `.js` / `.vue`. **TypeScript не добавлять** без отдельного указания.
4. **Не писать unit-тесты.**
5. **Не писать комментарии в коде.** Ни строковых, ни блочных.
6. **Новый функционал покрывать e2e-тестами** и сохранять их в `e2e/`.
7. **Стиль:** отступ 2 пробела, **без точек с запятой**, single quotes, без `var`.
8. Перед завершением — `npm run lint` (должно быть 0 ошибок) и `npm run test:e2e`.

## 1. Что это за кодовая база

Браузерный PWA-кошелёк Ять. Не ядро сети — только клиент. Vue 3 + Quasar 2 (Vite), Pinia,
vue-router, vue-i18n. Данные через Apollo (GraphQL) + `ky` (REST), локально IndexedDB (`idb`).
Крипто: libsodium + tweetnacl + bip39/@scure + @noble/hashes.

Ключевые точки входа:

- `src/App.vue` → `src/layouts/MainLayout.vue` → `src/pages/*` через `src/router/routes.js`.
- Boot-файлы регистрируются в `quasar.config.js` → `boot: ['env', 'i18n', 'apollo']`.
- Состояние — `src/stores/user.js` (Pinia). Крипто сида — `src/services/wallet.js`.

## 2. Алиасы путей (важно)

Работают: `src/...`, `boot/...`, `stores/...`, `components/...`, `pages/...`, `layouts/...`.
**`services/` алиасом НЕ является** — импортируй как `src/services/wallet`
(в проекте так же импортируют роуты: `import('src/pages/ScanQr.vue')`).

```js
import { userStore } from 'stores/user'
import { loadSeed } from 'src/services/wallet'
```

## 3. Криптография — не ломать

- Мнемоника 24 слова (BIP39) → seed → Ed25519 через `crypto_sign_seed_keypair` (`src/boot/crypt.js`).
- **Вся работа с сид-фразой — только через `src/services/wallet.js`.** Не размазывать по страницам.
- Формат хранения в IndexedDB: `{ v: 1, salt, nonce, ciphertext }` (hex-строки).
- KDF: `pbkdf2(sha512, ...)` из `@noble/hashes`, соль 16 байт, 210000 итераций.
  **В этой сборке libsodium нет `crypto_pwhash`** — не использовать его.
- `secretbox` с **случайным nonce** на каждое шифрование. Никогда не переиспользовать nonce.
- **Никогда** не класть сид/приватные ключи в cookie, localStorage или на сервер.
- Публичный API сервиса: `encryptSeed`, `decryptSeed`, `saveSeed`, `loadSeed`.

## 4. Технические подводные камни (проверено на практике)

- **`libsodium-wrappers` зафиксирован на `0.7.15`.** В `0.7.16` сломан ESM-билд (импортирует
  отсутствующий `./libsodium.mjs`) → сборка падает. Не обновлять без проверки.
- **Vite dep-optimization → 504 `Outdated Optimize Dep`** на первом заходе в dev после
  изменения зависимостей. Лечится перезагрузкой страницы/перезапуском dev-сервера.
  В e2e это не проблема, т.к. тесты гоняются по production-сборке.
- **`quasar serve` недоступен** (app extension не установлен). Для локальной раздачи
  `dist/spa` использовать `scripts/serve-dist.mjs` (history-fallback).
- **Namespace Imports:** `@apollo/client` дробится на подэкспорты, импортируй точные пути
  (`@apollo/client/core`, `@apollo/client/link/http/index.js`).
- **Env переменные обязательны:** `GQL_API`, `REST_API` (REST — со слэшем в конце). Их валидирует
  `src/boot/env.js`; при отсутствии в dev бросается ошибка. Шаблон — `.env.example`.
- **IndexedDB** создаётся в `src/boot/db.js`: БД `yat`, сторы `settings` и `contacts`.
- Стор `user` (`stores/user.js`) предоставляет: `sk`, `pk`, `seed`, `mk`, `crypt`, `ready`,
  `setMnemonic(mnemonic)`, `signIn(pin)`, `reset()`. Ключи после перезагрузки не восстанавливаются
  автоматически — нужен вход по паролю.

## 5. UI / Quasar / i18n

- Стиль локализации: все видимые строки — через `$t('...')`, добавлять ключи **в обе локали**
  (`src/i18n/en.js` и `src/i18n/ru.js`).
- Уведомления: `Notify.create({ type: 'negative', message: t('...') })`.
  В тестах негативное уведомление ловится селектором `.q-notification.bg-negative`
  (класса `.q-notification--negative` не существует).
- Страницы в `src/pages/**`; вложенные группы — в подпапках (`user/`, `landing/`).
- Маршруты добавлять в `src/router/routes.js` внутри `children` layout `MainLayout`.

## 6. Рабочий процесс изменения

1. Понять задачу, найти релевантные файлы (`grep`/чтение). Не менять лишнее.
2. Внести минимальные правки в `.js`/`.vue`.
3. Если добавил i18n-строки — обнови `en.js` и `ru.js`.
4. Если добавил функционал — добавь/обнови e2e-тест в `e2e/*.spec.js`.
5. Прогнать `npm run lint` (0 ошибок).
6. Прогнать `npm run test:e2e` (сборка + Playwright). Убедиться, что зелёный.
7. Проверить `git status` — не коммитить секреты (`.env`, ключи, сид-фразы).

## 7. E2E-тестирование (Playwright)

- Конфиг `playwright.config.js`; тесты в `e2e/*.spec.js`; пример — `e2e/wallet.spec.js`.
- Используется **системный Chrome** (`/usr/bin/google-chrome-stable`), браузер не скачивается.
  Путь переопределяется `CHROME_PATH`.
- Тесты идут по **production-сборке**: `webServer` поднимает `scripts/serve-dist.mjs` на порту 9100.
- Полный прогон одной командой: `npm run test:e2e`.
- Проверяй состояние IndexedDB напрямую из браузера (`page.evaluate` + `indexedDB`), например
  что сид сохранён зашифрованным и без плейнтекста.
- Для сброса состояния между сценариями удаляй БД: `indexedDB.deleteDatabase('yat')`.
- Селекторы: формы — `input[type="password"]`, `textarea`; кнопки — `getByRole('button', { name })`;
  признак авторизованного состояния — наличие `.q-footer`.

## 8. Команды

```bash
npm install
cp .env.example .env
npm run dev          # dev на :9000
npm run build        # сборка в dist/spa
npm run lint
npm run format
npm run test:e2e     # build + playwright
```

## 9. Чек-лист перед завершением

- [ ] Изменения минимальны и по задаче, логика не переписана.
- [ ] Нет TypeScript, нет комментариев, нет unit-тестов.
- [ ] Новый функционал покрыт e2e-тестом, тест сохранён в `e2e/`.
- [ ] i18n-строки есть в `en.js` и `ru.js`.
- [ ] `npm run lint` — 0 ошибок.
- [ ] `npm run test:e2e` — проходит.
- [ ] Секреты не попали в git.

## 10. Пополнение скилла

Если в ходе работы узнал новую тонкость проекта (особенность библиотеки, подводный камень сборки,
неочевидное поведение Quasar/Vite/IndexedDB, найденный рабочий рецепт) — **добавь её в
соответствующий раздел этого файла**, чтобы следующая правка была быстрее и безопаснее.
