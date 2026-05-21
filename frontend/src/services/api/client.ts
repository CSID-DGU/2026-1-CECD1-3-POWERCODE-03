const apiBaseUrl =
  (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env
    ?.VITE_API_BASE_URL ?? "";

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

const buildUrl = (path: string, params?: RequestOptions["params"]) => {
  const url = new URL(path, apiBaseUrl || window.location.origin);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return apiBaseUrl ? url.toString() : `${url.pathname}${url.search}`;
};

export const httpClient = {
  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(buildUrl(path, options.params), {
      ...options,
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`GET ${path} failed: ${response.status}`);
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
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`PATCH ${path} failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  },
};
