const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost/api'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Onbekende fout' }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  get: <T>(path: string) =>
    apiFetch<T>(path),

  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
}