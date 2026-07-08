<script setup lang="ts">
import { initialize } from "../core";
import { onMounted, ref } from "vue";

defineProps<{ msg: string }>();
onMounted(() => {
  window.addEventListener('web-docker:load-ready', () => {
  if (typeof window.getDockerConfigUrl === 'function') {
    const configUrl = window.getDockerConfigUrl();
    
    initialize({logEvents: true, configFilePath: configUrl});
    console.log("Docker initialized with URL:", configUrl);
    
  } else {
    console.error("Config script has not been loaded.");
  }
})});

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
