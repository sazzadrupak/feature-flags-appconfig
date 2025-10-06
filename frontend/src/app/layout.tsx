import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AppConfig Multi-Country App',
  description: 'Dynamic UI based on country configuration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}