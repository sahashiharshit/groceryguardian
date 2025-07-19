import { API_BASE } from "./api";


export async function getAccessToken(): Promise<string | null> {

    const token = localStorage.getItem("accesstoken");
   
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const isExpired = payload ? Date.now() >= payload.exp * 100 : true;

    if (!isExpired) return token;


    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, { method: "POST",credentials:"include", });
        if(!res.ok) throw new Error("Refresh failed");
        const data = await res.json();
        localStorage.setItem("accesstoken", data.accessToken);

        return data.accessToken;

    } catch (error) {
        console.error("Silent refresh failed", error);
        localStorage.removeItem("accesstoken");
        return null;
    }
}