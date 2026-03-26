import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tunisian Tutor - AI Agent for Bac Students',
  description: 'Your personal AI tutor for Bac Info/Math preparation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  )
}
