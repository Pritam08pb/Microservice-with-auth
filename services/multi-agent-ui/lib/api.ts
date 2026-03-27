const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

export interface ApiResponse<T> {
  status?: string;
  message?: string;
  error?: string;
  [key: string]: any;
}

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string | null;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { method = "GET", body, token, headers = {} } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": body instanceof FormData ? "" : "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || `API error ${res.status}`);
  }

  return data;
}

export const auth = {
  register: (email: string, password: string) =>
    apiRequest<
      ApiResponse<{ token: string; user: { id: string; email: string } }>
    >("/auth/register", { method: "POST", body: { email, password } }),
  login: (email: string, password: string) =>
    apiRequest<ApiResponse<{ token: string; user: any }>>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  generateApiKey: (token: string) =>
    apiRequest<ApiResponse<{ apiKey: string }>>("/auth/api-key", {
      method: "POST",
      token,
    }),
};

export const config = {
  get: (token: string) =>
    apiRequest<
      ApiResponse<{ activeDocumentId?: string; isEmailEnabled?: boolean }>
    >("/config", { token }),
  update: (
    token: string,
    payload?: { activeDocumentId?: string; isEmailEnabled?: boolean },
  ) => apiRequest("/config", { method: "PUT", token, body: payload }),
};

export const documents = {
  list: (token: string) =>
    apiRequest<
      ApiResponse<{
        documents: Array<{ id: string; filename: string; createdAt: string }>;
      }>
    >("/documents", { token }),
  upload: (token: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiRequest("/documents/upload", {
      method: "POST",
      token,
      body: form,
    });
  },
  delete: (token: string, id: string) =>
    apiRequest(`/documents/${id}`, { method: "DELETE", token }),
};

export const agent = {
  task: (token: string, prompt: string, conversationId?: string) =>
    apiRequest<{ messageId: string; conversationId: string; message: string }>(
      "/agents/task",
      {
        method: "POST",
        token,
        body: { prompt, conversationId },
      },
    ),
  getConversations: (token: string) =>
    apiRequest<{ conversations: any[] }>("/agents/conversations", { token }),
  getConversation: (token: string, conversationId: string) =>
    apiRequest<{ conversation: any }>(
      `/agents/conversations/${conversationId}`,
      { token },
    ),
};

export const plugin = {
  startGoogleConnect: (token: string) =>
    apiRequest<{ consentUrl: string }>("/plugins/google/connect", {
      method: "POST",
      token,
    }),
};
