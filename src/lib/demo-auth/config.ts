export const DEMO_AUTH_ENV_KEY = 'NEXT_PUBLIC_DEMO_AUTH_ENABLED'

export function isDemoAuthEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_AUTH_ENABLED === 'true'
}
