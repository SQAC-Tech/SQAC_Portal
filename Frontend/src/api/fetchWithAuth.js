export async function fetchWithAuth(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        credentials: "include", // 🔥 REQUIRED FOR COOKIES
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    let data = null;
    try {
        data = await res.json();
    } catch { }

    if (!res.ok) {
        throw new Error(data?.message || `Request failed (${res.status})`);
    }

    return data;
}