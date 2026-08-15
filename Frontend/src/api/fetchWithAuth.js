// Credentials, the bearer fallback and 401 handling are applied globally by
// api/installFetchInterceptor.js, so this helper only deals with JSON encoding
// and turning a failed response into a thrown Error.
export async function fetchWithAuth(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    let data = null;
    try {
        data = await res.json();
    } catch {
        // Empty or non-JSON body (204, an HTML error page) — leave data null.
    }

    if (!res.ok) {
        // The API reports failures as `error` on most routes and `message` on
        // the older ones; checking only `message` swallowed half of them and
        // surfaced a bare "Request failed (500)" instead.
        throw new Error(
            data?.error || data?.message || `Request failed (${res.status})`
        );
    }

    return data;
}
