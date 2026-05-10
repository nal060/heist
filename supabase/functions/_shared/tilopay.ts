export const TILOPAY_BASE = 'https://app.tilopay.com'

export const IS_MOCK = Deno.env.get('TILOPAY_MOCK') === 'true'

export async function getTilopayToken(): Promise<string> {
  const apiUser = Deno.env.get('TILOPAY_API_USER')!
  const password = Deno.env.get('TILOPAY_API_PASSWORD')!
  const key = Deno.env.get('TILOPAY_KEY')!

  const res = await fetch(`${TILOPAY_BASE}/api/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiUser, password, application: key }),
  })

  if (!res.ok) {
    throw new Error(`Tilopay login failed: ${res.status} ${res.statusText}`)
  }

  const json = await res.json()

  if (!json.token) {
    throw new Error('Tilopay login response missing token')
  }

  return json.token as string
}

export function generateOrderNumber(orderId: string): string {
  return `HEIST-${orderId}-${Date.now()}`
}
