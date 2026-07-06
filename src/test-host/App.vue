<script setup lang="ts">
import { initialize } from "../core";
import { ref } from "vue";

defineProps<{ msg: string }>();

initialize({logEvents: true, configFilePath: '/test-config.json'});

const showObservedElement = ref(false);
const handleClick = () => {
  showObservedElement.value = !showObservedElement.value;
};

</script>

<template>
  <button @click="handleClick">Click to inject observed element</button>
  <page-fragment />
  <div v-if="showObservedElement">
    <observed-fragment />
  </div>

</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
