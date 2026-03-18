const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

class CookieJar {
  constructor() {
    this.store = new Map()
  }

  applyFromResponse(response) {
    const getSetCookie = response.headers.getSetCookie?.bind(response.headers)
    const headerValues = getSetCookie ? getSetCookie() : []

    for (const raw of headerValues) {
      const [pair] = raw.split(';')
      if (!pair) continue
      const eq = pair.indexOf('=')
      if (eq <= 0) continue
      const name = pair.slice(0, eq).trim()
      const value = pair.slice(eq + 1).trim()
      if (name) this.store.set(name, value)
    }
  }

  toHeader() {
    if (this.store.size === 0) return ''
    return [...this.store.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
  }
}

async function request(path, { method = 'GET', body, json = false, jar } = {}) {
  const headers = {}
  if (json) headers['Content-Type'] = 'application/json'
  if (jar) {
    const cookie = jar.toHeader()
    if (cookie) headers.Cookie = cookie
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: json ? JSON.stringify(body) : body
  })
  if (jar) jar.applyFromResponse(response)
  const payload = await response.json().catch(() => null)
  return { response, payload }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertUnauthorizedEnvelope(payload, path) {
  assert(payload?.ok === false, `Expected ok=false for ${path}`)
  assert(payload?.code === 'UNAUTHORIZED', `Expected UNAUTHORIZED code for ${path}, got ${payload?.code}`)
}

async function signInWithCredentials(email, password) {
  const jar = new CookieJar()

  const csrfRes = await request('/api/auth/csrf', { jar })
  assert(csrfRes.response.status === 200, `Expected csrf 200, got ${csrfRes.response.status}`)
  const csrfToken = csrfRes.payload?.csrfToken
  assert(typeof csrfToken === 'string' && csrfToken.length > 10, 'Missing csrf token')

  const form = new URLSearchParams({
    csrfToken,
    email,
    password,
    json: 'true',
    callbackUrl: `${BASE_URL}/dashboard`
  })

  const signInRes = await request('/api/auth/callback/credentials', {
    method: 'POST',
    body: form.toString(),
    jar
  })

  assert(signInRes.response.status === 200, `Expected sign-in 200 for ${email}, got ${signInRes.response.status}`)
  assert(typeof signInRes.payload?.url === 'string', `Missing callback url after sign-in for ${email}`)
  return jar
}

async function main() {
  // 1) Unauthorized matrix
  for (const path of ['/api/matters', '/api/evidence', '/api/drafts', '/api/intake', '/api/sos']) {
    const { response, payload } = await request(path)
    assert(response.status === 401, `Expected 401 for ${path}, got ${response.status}`)
    assertUnauthorizedEnvelope(payload, path)
  }

  // 2) Create identities
  const stamp = Date.now()
  const advocateEmail = `advocate.b6.${stamp}@example.com`
  const clientEmail = `client.b6.${stamp}@example.com`

  const advocateSignUp = await request('/api/auth/sign-up', {
    method: 'POST',
    json: true,
    body: { name: 'Advocate B6', email: advocateEmail, password: 'Pass1234', role: 'ADVOCATE' }
  })
  assert(advocateSignUp.response.status === 200, `Advocate sign-up failed: ${JSON.stringify(advocateSignUp.payload)}`)

  const clientSignUp = await request('/api/auth/sign-up', {
    method: 'POST',
    json: true,
    body: { name: 'Client B6', email: clientEmail, password: 'Pass1234', role: 'CLIENT' }
  })
  assert(clientSignUp.response.status === 200, `Client sign-up failed: ${JSON.stringify(clientSignUp.payload)}`)

  // 3) Authenticate both roles
  const advocateJar = await signInWithCredentials(advocateEmail, 'Pass1234')
  const clientJar = await signInWithCredentials(clientEmail, 'Pass1234')

  // 4) Client create should fail
  const clientCreateMatter = await request('/api/matters', {
    method: 'POST',
    json: true,
    body: { title: 'B6 Client should fail' },
    jar: clientJar
  })
  assert(clientCreateMatter.response.status === 403, `Expected client matter create 403, got ${clientCreateMatter.response.status}`)

  // 5) Advocate create should succeed
  const advocateCreateMatter = await request('/api/matters', {
    method: 'POST',
    json: true,
    body: { title: 'B6 Ownership Matter', description: 'integration matrix' },
    jar: advocateJar
  })
  assert(advocateCreateMatter.response.status === 201, `Expected advocate matter create 201, got ${advocateCreateMatter.response.status}`)
  const matterId = advocateCreateMatter.payload?.id
  assert(typeof matterId === 'string', 'Missing created matter id')

  // 6) Ownership checks on detail
  const clientReadMatter = await request(`/api/matters/${matterId}`, { jar: clientJar })
  assert(clientReadMatter.response.status === 404, `Expected client read foreign matter 404, got ${clientReadMatter.response.status}`)

  const advocatePatchMatter = await request(`/api/matters/${matterId}`, {
    method: 'PATCH',
    json: true,
    body: { status: 'PAUSED', title: 'B6 Ownership Matter Updated' },
    jar: advocateJar
  })
  assert(advocatePatchMatter.response.status === 200, `Expected advocate patch matter 200, got ${advocatePatchMatter.response.status}`)
  assert(advocatePatchMatter.payload?.ok === true, 'Expected patched matter envelope')

  const advocateArchiveMatter = await request(`/api/matters/${matterId}`, {
    method: 'DELETE',
    jar: advocateJar
  })
  assert(advocateArchiveMatter.response.status === 200, `Expected advocate archive matter 200, got ${advocateArchiveMatter.response.status}`)
  assert(advocateArchiveMatter.payload?.data?.status === 'ARCHIVED', 'Expected archived matter status')

  // 7) Pagination envelope presence
  const pagedMatters = await request('/api/matters?limit=2&offset=0', { jar: advocateJar })
  assert(pagedMatters.response.status === 200, `Expected paged matters 200, got ${pagedMatters.response.status}`)
  assert(pagedMatters.payload?.ok === true, 'Expected paged matters ok=true')
  assert(typeof pagedMatters.payload?.data?.page?.total === 'number', 'Expected page.total number')
  assert(typeof pagedMatters.payload?.data?.page?.hasMore === 'boolean', 'Expected page.hasMore boolean')

  console.log('Integration auth/RBAC/ownership matrix passed.')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
