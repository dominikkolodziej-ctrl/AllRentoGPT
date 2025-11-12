// src/lib/httpInterceptor.js
(() => {
  if (typeof window === "undefined" || window.__HTTP_INTERCEPTOR_INSTALLED__) return;
  window.__HTTP_INTERCEPTOR_INSTALLED__ = true;

  const origFetch = window.fetch;

  function getToken() {
    try {
      return localStorage.getItem("token") || "";
      // eslint-disable-next-line no-empty
    } catch {
      // ignore storage errors (Safari/privacy modes)
      return "";
    }
  }
  function onUnauthorized() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      // eslint-disable-next-line no-empty
    } catch {
      // ignore storage errors
    }
    const loc = window.location;
    const here = encodeURIComponent(loc.pathname + loc.search + loc.hash);
    if (!loc.pathname.startsWith("/login")) {
      loc.assign(`/login?returnTo=${here}`);
    }
  }

  window.fetch = async (input, init = {}) => {
    const token = getToken();
    const headers = new Headers(init.headers || {});
    if (token && !headers.has("authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (!headers.has("accept")) headers.set("Accept", "application/json");
    const finalInit = { ...init, headers };

    const res = await origFetch(input, finalInit);
    if (res.status === 401) {
      onUnauthorized();
      return res;
    }
    return res;
  };

  window.addEventListener("storage", (e) => {
    if (e.key === "token" && !e.newValue) {
      onUnauthorized();
    }
  });
})();
