const BASE_URL = "/api/auth";

export async function registerUser(username, password) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || "Failed to register user");
  }
  return data;
}

export async function loginUser(username, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || "Failed to login user");
  }

  localStorage.setItem("token", data.token);

  if (data.user?.username) {
    localStorage.setItem("username", JSON.stringify(data.user.username));
  }
  if (data.user?.id) {
    localStorage.setItem("userId", JSON.stringify(data.user.id));
  }
  return data;
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
}
export function getAuthToken() {
  return localStorage.getItem("token");
}
export function getStoredUser(){
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    if (!username || !userId) {
        return null;
    }
    return { username, userId };
}