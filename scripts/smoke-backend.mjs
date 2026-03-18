const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function expectJson(path, expectedStatus, validate, init) {
  const res = await fetch(`${BASE_URL}${path}`, init)
  const body = await res.json().catch(() => null)
  if (res.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus} for ${path}, got ${res.status}. Body: ${JSON.stringify(body)}`)
  }
  if (validate) {
    validate(body)
  }
}

function expectUnauthorizedEnvelope(body) {
  if (!body || body.ok !== false || body.code !== 'UNAUTHORIZED') {
    throw new Error(`Unexpected unauthorized envelope: ${JSON.stringify(body)}`)
  }
}

async function main() {
  await expectJson('/api/matters', 401, expectUnauthorizedEnvelope)
  await expectJson('/api/evidence', 401, expectUnauthorizedEnvelope)
  await expectJson('/api/drafts', 401, expectUnauthorizedEnvelope)
  await expectJson('/api/intake', 401, expectUnauthorizedEnvelope)
  await expectJson('/api/sos', 401, expectUnauthorizedEnvelope)
  await expectJson('/api/matters/smoke-id', 401, expectUnauthorizedEnvelope, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'x' })
  })
  await expectJson('/api/drafts/smoke-id', 401, expectUnauthorizedEnvelope, {
    method: 'DELETE'
  })
  await expectJson('/api/evidence/smoke-id', 401, expectUnauthorizedEnvelope, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags: ['smoke'] })
  })
  await expectJson('/api/sos/smoke-id', 401, expectUnauthorizedEnvelope, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'ACKNOWLEDGED' })
  })

  await expectJson(
    '/api/auth/sign-up',
    400,
    (body) => {
      if (!body || body.error !== 'Invalid sign-up payload') {
        throw new Error(`Unexpected invalid-payload response: ${JSON.stringify(body)}`)
      }
    },
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad', password: '123', name: '' })
    }
  )

  const email = `smoke.${Date.now()}@example.com`
  await expectJson(
    '/api/auth/sign-up',
    200,
    (body) => {
      if (!body || body.ok !== true) {
        throw new Error(`Unexpected sign-up success response: ${JSON.stringify(body)}`)
      }
    },
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Smoke User', email, password: 'Pass1234', role: 'CLIENT' })
    }
  )

  await expectJson(
    '/api/auth/sign-up',
    409,
    (body) => {
      if (!body || body.error !== 'Email is already registered') {
        throw new Error(`Unexpected duplicate sign-up response: ${JSON.stringify(body)}`)
      }
    },
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Smoke User', email, password: 'Pass1234', role: 'CLIENT' })
    }
  )

  console.log('Backend smoke checks passed.')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
