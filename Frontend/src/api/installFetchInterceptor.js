// Wraps window.fetch once, at boot, so every call to the portal API gets the
// same credential handling and the same expiry behaviour.
//
// There are ~40 hand-written fetch() calls spread across the pages. Patching
// them individually would guarantee the next one added forgets something, and
// several already did: some omitted credentials, none handled a 401. A single
// interception point fixes all of them and any future ones.

import {
  API_BASE_URL,
  getToken,
  handleSessionExpired,
  isApiRequest,
} from "./session.js";

// Endpoints where a 401 is a legitimate answer ("wrong password"), not a sign
// that the current session died. Redirecting on these would bounce a user off
// the login page the moment they typo'd their password.
const PUBLIC_AUTH_PATHS = [
  "/user/login",
  "/user/create",
  "/logout",
  "/otp/get",
  "/otp/verify",
  "/password/reset",
  "/api/auth/complete-onboarding",
];

const isPublicAuthPath = (url) =>
  PUBLIC_AUTH_PATHS.some((p) => url.startsWith(`${API_BASE_URL}${p}`));

let installed = false;

export function installFetchInterceptor() {
  if (installed) return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url;

    if (!isApiRequest(url)) return originalFetch(input, init);

    const headers = new Headers(init.headers || {});

    // Bearer fallback for browsers that refuse the cross-site cookie. The
    // cookie still goes out too; the server prefers it.
    const token = getToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await originalFetch(input, {
      ...init,
      credentials: "include",
      headers,
    });

    if (response.status === 401 && !isPublicAuthPath(url)) {
      handleSessionExpired();
    }

    return response;
  };
}
