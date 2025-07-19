import { getAccessToken } from "./tokenservice";

export const API_BASE = "/api";

type RequestOptions ={
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  
}

export async function apiFetch<T = object>(
    endpoint: string, 
    { method = "GET", body }: RequestOptions = {}
    ): Promise<T> {
  const headers:HeadersInit ={
    "Content-Type":"application/json",
  };
  const authToken = await getAccessToken();
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const response = await fetch(`${API_BASE}${endpoint}`,{
    method,
    headers,
    credentials:"include",
    body:body ?JSON.stringify(body) :undefined,
  });
  if(!response.ok){
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  const contentType = response.headers.get("Content-Type") ||"";
  return contentType.includes("application/json")?response.json():(response.text() as unknown as T);
}
  
  
  

 
 
