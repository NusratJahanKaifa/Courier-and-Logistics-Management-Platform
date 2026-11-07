const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://courierconnect-logistics.onrender.com"
).replace(/\/+$/, "");

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");
  const headers = { ...options.headers };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
    {
      ...options,
      headers,
    }
  );

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    throw new Error("Session expired. Please log in again.");
  }

  return response;
}