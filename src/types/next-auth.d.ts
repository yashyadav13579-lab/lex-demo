import NextAuth, { DefaultSession } from 'next-auth'

type Role = 'CLIENT' | 'ADVOCATE' | 'FIRM_MEMBER' | 'FIRM_ADMIN' | 'REVIEWER' | 'ADMIN' | 'COMPLIANCE_ADMIN' | 'SUPER_ADMIN'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession['user']
  }

  interface User {
    role: Role
  }
}
