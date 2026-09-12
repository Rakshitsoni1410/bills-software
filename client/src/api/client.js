const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ✅ Logout handler — set by App.jsx on mount
let logoutHandler = null;

export function setLogoutHandler(fn) {
  logoutHandler = fn;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  // ✅ 401 = session kicked (another device logged in) or expired
  if (res.status === 401) {
    const message = data.error || "Session expired. Please login again.";
    if (logoutHandler) logoutHandler(message);
    throw new Error(message);
  }

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export const api = {
  get:    (path)       => request(path),
  post:   (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: "PUT",  body: JSON.stringify(body) }),
  delete: (path)       => request(path, { method: "DELETE" }),
};