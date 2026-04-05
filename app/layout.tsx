import type { Metadata, Viewport } from 'next'
import { Poppins, Fira_Code } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins"
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: 'tracking-container',
  description: 'tracking-container for logistics management, container tracking, and transport optimization',
  icons: {
    icon: [
      {
        url: '/tracking-container-mark-32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/tracking-container-mark.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        url: '/tracking-container-mark-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    apple: '/tracking-container-apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a5fb4',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${poppins.variable} ${firaCode.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
