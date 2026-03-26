export function setAuth(token: string, userId: string, email: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("authToken", token);
  localStorage.setItem("userId", userId);
  localStorage.setItem("userEmail", email);
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userId");
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userEmail");
}
