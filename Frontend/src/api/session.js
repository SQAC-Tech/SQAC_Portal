// Client-side session state, in one place.
//
// The portal is served from portal.sqac.space while the API answers from a
// different registrable domain, which makes the session cookie a third-party
// cookie — Safari, Firefox, Brave and Chrome's incognito mode drop it
// silently. When that happens the cookie-only setup logs the user straight
// back out on the next request. So we keep a bearer token as a fallback and
// let the cookie take priority whenever the browser actually honours it.
//
// Once the API moves to api.sqac.space the cookie stops being third-party and
// this fallback simply stops being needed — nothing here has to change.

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const USER_KEY = "user";
const TOKEN_KEY = "sqac.session.token";

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveSession({ user, token }) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (token) localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* private mode / storage full — the cookie may still carry the session */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nothing we can do */
  }
}

/** True for URLs that should carry credentials. */
export function isApiRequest(url) {
  return typeof url === "string" && url.startsWith(API_BASE_URL);
}

let redirecting = false;

/**
 * Called when the API says the session is gone. Guarded so that a page firing
 * six parallel requests doesn't kick off six redirects.
 */
export function handleSessionExpired() {
  clearSession();
  if (redirecting) return;
  if (window.location.pathname === "/login") return;
  redirecting = true;
  window.location.replace("/login?expired=1");
}
