import './globals.css'
import { ReactNode } from 'react'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { HeaderNav } from './header-nav'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

export const metadata = {
  title: 'LexSovereign',
  description: 'Advocate-first safety and workflow OS'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <Providers session={null}>
          <div className="min-h-screen">
            <header className="border-b bg-white">
              <div className="container py-4 flex items-center justify-between">
                <Link href="/" className="text-lg font-semibold">
                  LexSovereign
                </Link>
                <HeaderNav />
              </div>
            </header>
            <main className="container py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
