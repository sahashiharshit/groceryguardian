
export const API_BASE = "/api";
//export const API_BASE = "http://localhost:5000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: HeadersInit;
  _retry?: boolean;
};

export async function apiFetch<T = object>(
  endpoint: string,
  { method = "GET", body, headers = {}, _retry = false }: RequestOptions = {}
): Promise<T> {
  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };


  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: finalHeaders,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && !_retry) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // retry original request once
      return apiFetch<T>(endpoint, { method, body, headers, _retry: true });
    }
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    let errorCode: string | undefined;
    try {
      const errorData = await response.json();
      if (typeof errorData === 'object' && errorData !== null) {
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
        errorCode=errorData.code;
      }
    } catch (error) {
      const errorText = await response.text();
      if (errorText) errorMessage = errorText;
    }

 const err: any = new Error(errorMessage);
  err.status = response.status;
  if (errorCode) err.code = errorCode;
  throw err;
  }
  const contentType = response.headers.get("Content-Type") || "";
  return contentType.includes("application/json") ? response.json() : (response.text() as unknown as T);
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {

      method: "POST",
      credentials: "include",
    });
    return res.ok
  } catch (error) {
    return false;
  }
}




