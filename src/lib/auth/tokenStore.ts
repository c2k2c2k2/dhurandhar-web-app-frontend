const ACCESS_TOKEN_KEY = "dhurandhar_access_token";
const REFRESH_TOKEN_KEY = "dhurandhar_refresh_token";

const memoryStore: {
  accessToken: string | null;
  refreshToken: string | null;
} = {
  accessToken: null,
  refreshToken: null,
};

function hasWindow() {
  return typeof window !== "undefined";
}

export function getAccessToken() {
  if (!hasWindow()) {
    return memoryStore.accessToken;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (!hasWindow()) {
    return memoryStore.refreshToken;
  }
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (!hasWindow()) {
    memoryStore.accessToken = accessToken;
    memoryStore.refreshToken = refreshToken;
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  if (!hasWindow()) {
    memoryStore.accessToken = null;
    memoryStore.refreshToken = null;
    return;
  }
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
