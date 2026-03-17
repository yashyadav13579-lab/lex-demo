import './globals.css'
import { ReactNode } from 'react'
import { Providers } from './providers'

export const metadata = {
  title: 'LexSovereign',
  description: 'Advocate-first safety and workflow OS'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <Providers>
          <div className="min-h-screen">
            <header className="border-b bg-white">
              <div className="container py-4 flex items-center justify-between">
                <div className="text-lg font-semibold">LexSovereign</div>
                <nav className="flex gap-4 text-sm text-slate-600">
                  <a href="/pricing">Pricing</a>
                  <a href="/auth/sign-in">Sign in</a>
                  <a href="/auth/sign-up" className="text-accent font-medium">Get started</a>
                </nav>
              </div>
            </header>
            <main className="container py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
