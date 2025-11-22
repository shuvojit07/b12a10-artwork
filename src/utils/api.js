
export const API_BASE = import.meta.env.VITE_API_BASE || "https://artwork-servar.vercel.app";

function parseJsonSafe(res) {
  return res.text().then(text => {
    try { return JSON.parse(text || "{}"); }
    catch(e) { return { _raw: text }; }
  });
}

export async function fetcher(path, opts = {}) {
  const url = (path.startsWith("http") ? path : API_BASE + path);
  try {
    const res = await fetch(url, opts);

    // helpful logging during dev — remove/comment out in production
    console.log(`[fetcher] ${opts.method || "GET"} ${url} -> ${res.status}`);

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      // show both status + body for debugging
      const errMsg = data?.message || data?.error || data?._raw || `HTTP ${res.status}`;
      const err = new Error(errMsg);
      err.status = res.status;
      err.body = data;
      throw err;
    }

    // Return the parsed body (server may wrap with { data: ... } or return item directly)
    return data;
  } catch (networkErr) {
    // network-level error (DNS, refused, CORS preflight failure, etc.)
    console.error("[fetcher] network/error:", networkErr);
    throw new Error(networkErr.message || "Network error");
  }
}
