const BASE_URL: string = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'gs_token'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

function buildHeaders(): Headers {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return headers
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    clearToken()
    window.location.href = '/login'
    throw new ApiError(401, null, 'Unauthorized')
  }

  if (!response.ok) {
    let errorBody: unknown
    try {
      errorBody = await response.json() as unknown
    } catch {
      errorBody = await response.text()
    }
    throw new ApiError(response.status, errorBody, `API error ${response.status}: ${response.statusText}`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>('GET', path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('POST', path, body)
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('PUT', path, body)
}
