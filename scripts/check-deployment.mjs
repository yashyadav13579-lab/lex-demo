const BASE_URL = process.env.BASE_URL
const CRON_SECRET = process.env.CRON_SECRET

if (!BASE_URL) {
  console.error('Missing BASE_URL. Example: BASE_URL=https://your-deployment.vercel.app')
  process.exit(1)
}

if (!CRON_SECRET) {
  console.error('Missing CRON_SECRET for internal deployment checks.')
  process.exit(1)
}

async function request(path, init = {}) {
  const response = await fetch(`${BASE_URL}${path}`, init)
  const body = await response.json().catch(() => null)
  return { response, body }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function main() {
  // Auth session should be reachable.
  const authSession = await request('/api/auth/session')
  assert(authSession.response.status === 200, `Expected /api/auth/session=200, got ${authSession.response.status}`)

  // Cleanup endpoint must be protected.
  const cleanupNoAuth = await request('/api/internal/cleanup-idempotency')
  assert(cleanupNoAuth.response.status === 401, `Expected cleanup without auth=401, got ${cleanupNoAuth.response.status}`)

  // Deployment status endpoint must be protected.
  const statusNoAuth = await request('/api/internal/deployment-status')
  assert(statusNoAuth.response.status === 401, `Expected deployment-status without auth=401, got ${statusNoAuth.response.status}`)

  // Protected internal checks.
  const headers = { Authorization: `Bearer ${CRON_SECRET}` }
  const statusWithAuth = await request('/api/internal/deployment-status', { headers })
  assert(statusWithAuth.response.status === 200, `Expected deployment-status with auth=200, got ${statusWithAuth.response.status}`)

  const env = statusWithAuth.body?.env
  assert(env, 'Missing env object in deployment-status response')
  assert(env.hasDatabaseUrl, 'DATABASE_URL is missing in deployment environment')
  assert(env.hasNextAuthSecret, 'NEXTAUTH_SECRET is missing in deployment environment')
  assert(env.hasNextAuthUrl, 'NEXTAUTH_URL is missing in deployment environment')
  assert(env.hasCronSecret, 'CRON_SECRET is missing in deployment environment')

  const cleanupWithAuth = await request('/api/internal/cleanup-idempotency', { headers })
  assert(cleanupWithAuth.response.status === 200, `Expected cleanup with auth=200, got ${cleanupWithAuth.response.status}`)
  assert(cleanupWithAuth.body?.ok === true, 'Cleanup response did not return ok=true')

  // Idempotency replay on sign-up with fixed key.
  const stamp = Date.now()
  const signupPayload = {
    name: 'Deploy Check User',
    email: `deploy.check.${stamp}@example.com`,
    password: 'Pass1234',
    role: 'CLIENT'
  }
  const idemHeaders = {
    'Content-Type': 'application/json',
    'Idempotency-Key': `deploy-signup-${stamp}`
  }

  const signup1 = await request('/api/auth/sign-up', {
    method: 'POST',
    headers: idemHeaders,
    body: JSON.stringify(signupPayload)
  })
  assert(signup1.response.status === 200, `Expected first idempotent sign-up=200, got ${signup1.response.status}`)
  assert(signup1.response.headers.get('x-request-id'), 'Missing x-request-id on first sign-up')

  const signup2 = await request('/api/auth/sign-up', {
    method: 'POST',
    headers: idemHeaders,
    body: JSON.stringify(signupPayload)
  })
  assert(signup2.response.status === 200, `Expected replayed sign-up=200, got ${signup2.response.status}`)
  assert(signup2.response.headers.get('x-idempotent-replay') === 'true', 'Missing x-idempotent-replay=true on replayed sign-up')
  assert(signup2.response.headers.get('x-request-id'), 'Missing x-request-id on replayed sign-up')

  console.log('Deployment checks passed.')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
