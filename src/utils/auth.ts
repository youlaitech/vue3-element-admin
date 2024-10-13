const TOKEN_KEY = "admin-token";

function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setToken(token: string) {
  return localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
  return localStorage.removeItem(TOKEN_KEY);
}

function isLogin(): boolean {
  return !!getToken();
}

export { getToken, setToken, removeToken, isLogin };
