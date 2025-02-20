// 访问 token 缓存的 key
const ACCESS_TOKEN_KEY = "access_token";
// 刷新 token 缓存的 key
const REFRESH_TOKEN_KEY = "refresh_token";

function getToken(): string {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

function setToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function getRefreshToken(): string {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || "";
}

function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export { getToken, setToken, clearToken, getRefreshToken, setRefreshToken };
