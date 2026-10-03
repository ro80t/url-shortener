import { ref, shallowRef } from "vue";

/** POST JSON to an API route, exposing the pending/error/data state both forms on Home need. */
export function useJsonPost<T>(path: string, errorMessage: string) {
  const pending = ref(false);
  const error = ref("");
  const data = shallowRef<T | null>(null);

  function reset() {
    error.value = "";
    data.value = null;
  }

  async function post(body: unknown) {
    reset();
    pending.value = true;
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        error.value = errorMessage;
        return;
      }
      data.value = (await response.json()) as T;
    } catch {
      error.value = errorMessage;
    } finally {
      pending.value = false;
    }
  }

  return { pending, error, data, reset, post };
}
