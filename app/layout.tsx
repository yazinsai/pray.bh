import type React from "react"
import "./globals.css"
import { Inter, Amiri } from "next/font/google"
import type { Metadata } from "next"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })
const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-amiri",
})

export const metadata: Metadata = {
  title: "pray.bh | Prayer Times in Bahrain",
  description: "Elegant prayer times application for Bahrain",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'pray.bh'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: 'pray.bh | Prayer Times in Bahrain',
    description: 'Elegant prayer times application for Bahrain',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'pray.bh',
    description: 'Elegant prayer times application for Bahrain',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
      </head>
      <body className={`${inter.variable} ${amiri.variable}`}>
        <ServiceWorkerRegistration />
        <PWAInstallPrompt />
        {children}
      </body>
    </html>
  )
}