<script setup lang="ts">
import { ref } from "vue";
import { testQcUtils, testRegularJS } from "./test";
const isTestingRegularJs = ref(false);
const isTestingQcUtils = ref(false);

const onTestRegularJs = async () => {
  isTestingRegularJs.value = true;
  setTimeout(async () => {
    await testRegularJS();
    isTestingRegularJs.value = false;
  });
};

const onTestQcUtils = async () => {
  isTestingQcUtils.value = true;
  await testQcUtils();
  isTestingQcUtils.value = false;
};
</script>

<template>
  <div class="container">
    <div class="test-btn" @click="onTestRegularJs">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      <div>
        {{ isTestingRegularJs ? "Testing regular JS..." : "Test Regular JS" }}
      </div>
    </div>

    <div class="test-btn" @click="onTestQcUtils">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
      <div>
        {{ isTestingQcUtils ? "Testing QC-Utils..." : "Test QC-Utils" }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.container {
  display: flex;
  align-items: space-between;
  gap: 2rem;
}

.test-btn {
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 2rem;

  &:hover {
    background: #ffffff27;
  }
}
</style>
