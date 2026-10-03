<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{ message: string; url: string; copyable?: boolean }>();

const copied = ref(false);
watch(
  () => props.url,
  () => (copied.value = false),
);

async function copy() {
  try {
    await navigator.clipboard.writeText(props.url);
    copied.value = true;
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <div class="result">
    <p class="result-message">{{ message }}</p>
    <div class="result-row">
      <a class="result-url" :href="url">{{ url }}</a>
      <button v-if="copyable" type="button" @click="copy">
        {{ copied ? "コピー済み" : "コピー" }}
      </button>
    </div>
  </div>
</template>
