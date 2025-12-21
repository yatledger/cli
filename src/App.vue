<template>
  <router-view />
</template>

<script setup>
//
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab&display=swap');

h2 {
  font-family: 'Roboto Slab', serif;
  font-size: 20px;
  font-weight: normal;
  margin-bottom: 1vh;
}

p {
  font-family: 'Roboto Slab', serif;
  font-size: 15px;
  font-weight: normal;
  margin-bottom: 0.5vh;
  line-height: 20px;
}

a {
  color: #ac5de7;
  text-decoration: underline;
}

p,
li {
  margin-bottom: 10px;
}

ul {
  list-style: none;
}

img {
  max-width: 100%;
}

.raw_txt {
  white-space: pre-line;
  word-wrap: break-word;
}
</style>
