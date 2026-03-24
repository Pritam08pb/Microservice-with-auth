import { authApi } from "./api";

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (e) {
    return null;
  }
};

export const getValidToken = async (): Promise<string | null> => {
  let token = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!token) return null;

  const decoded = parseJwt(token);
  // Check if token expires in less than 5 minutes (or is already expired)
  if (!decoded || (decoded.exp * 1000) - Date.now() < 5 * 60 * 1000) {
    if (!refreshToken) {
      logoutSession();
      return null;
    }

    try {
      const res = await authApi.post("/refresh", { refreshToken });
      const data = res.data;
      
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      token = data.accessToken;
    } catch (err: any) {
      console.error("Token refresh failed", err);
      // ONLY hard-logout if the server actively rejected the refresh token (401/403)
      // Do NOT logout on systemic network drops to prevent UI crash looping
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        logoutSession();
      }
      return null;
    }
  }

  return token;
};

export const logoutSession = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  
  if (refreshToken) {
    try {
      await authApi.post("/logout", { refreshToken });
    } catch (e) {
      console.error("Logout API failed", e);
    }
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  
  // Protect against infinite loop reloads if already unauthenticated on the auth portal
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};
