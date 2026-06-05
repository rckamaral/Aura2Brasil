declare const __API_URL__: string | undefined;

const apiUrl = typeof __API_URL__ === "string" ? __API_URL__.replace(/\/$/, "") : "";
const originalFetch = window.fetch.bind(window);

window.fetch = (input, init) => {
  if (apiUrl && typeof input === "string" && input.startsWith("/api")) {
    return originalFetch(`${apiUrl}${input}`, init);
  }

  if (apiUrl && input instanceof Request && input.url.startsWith(`${window.location.origin}/api`)) {
    return originalFetch(new Request(input.url.replace(window.location.origin, apiUrl), input), init);
  }

  return originalFetch(input, init);
};
