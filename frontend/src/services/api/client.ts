const apiBaseUrl =
  (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env
    ?.VITE_API_BASE_URL ?? "http://localhost:5001"; // Fallback to our local backend port

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

const buildUrl = (path: string, params?: RequestOptions["params"]) => {
  // Support both relative paths like "/api/auth" and full paths.
  const isFullPath = path.startsWith("http://") || path.startsWith("https://");
  if (isFullPath) {
    const url = new URL(path);
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
    return url.toString();
  }

  const url = new URL(path.startsWith("/") ? path.slice(1) : path, apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

const getHeaders = (customHeaders?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = {};
  
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return {
    ...headers,
    ...customHeaders,
  };
};

export const httpClient = {
  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(buildUrl(path, options.params), {
      ...options,
      method: "GET",
      headers: getHeaders(options.headers),
    });

    if (!response.ok) {
      let errMsg = `GET ${path} failed: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) errMsg = errorData.message;
      } catch {}
      throw new Error(errMsg);
    }

    return response.json() as Promise<T>;
  },

  async post<T>(
    path: string,
    body: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const response = await fetch(buildUrl(path, options.params), {
      ...options,
      method: "POST",
      headers: getHeaders({
        "Content-Type": "application/json",
        ...options.headers,
      }),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errMsg = `POST ${path} failed: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) errMsg = errorData.message;
      } catch {}
      throw new Error(errMsg);
    }

    return response.json() as Promise<T>;
  },

  async patch<T>(
    path: string,
    body: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const response = await fetch(buildUrl(path, options.params), {
      ...options,
      method: "PATCH",
      headers: getHeaders({
        "Content-Type": "application/json",
        ...options.headers,
      }),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errMsg = `PATCH ${path} failed: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) errMsg = errorData.message;
      } catch {}
      throw new Error(errMsg);
    }

    return response.json() as Promise<T>;
  },
};

