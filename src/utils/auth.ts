const TOKEN_KEY = "admin-token";

function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setToken(token: string) {
  return localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  return localStorage.removeItem(TOKEN_KEY);
}

export { getToken, setToken, clearToken };
