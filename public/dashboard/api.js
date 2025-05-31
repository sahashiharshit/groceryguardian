const API_BASE = "http://localhost:5000";

export async function apiFetch(endpoint, method ="GET", body){

const token = localStorage.getItem('token');

const options = {
method,
credentials:"include",
headers:{
    "Content-Type": "application/json",
    ...(token && {Authorization:`Bearer ${token}`})
  }
};

if(body) 
    options.body = JSON.stringify(body);

const response = await fetch(`${API_BASE}${endpoint}`, options);

if(!response.ok) throw new Error("Request failed");
return response.json();
}