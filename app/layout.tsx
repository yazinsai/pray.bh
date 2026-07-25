import type React from "react"
import "./globals.css"
import { Inter, Amiri } from "next/font/google"
import type { Metadata, Viewport } from "next"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })
const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-amiri",
})

const siteUrl = "https://pray.bh"
const siteTitle = "pray.bh | Bahrain Prayer Times"
const siteDescription =
  "Accurate Bahrain prayer times for Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha. Fast, installable, and built for daily use in Bahrain."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "pray.bh",
  title: {
    default: siteTitle,
    template: "%s | pray.bh",
  },
  description: siteDescription,
  keywords: [
    "Bahrain prayer times",
    "Bahrain salah times",
    "pray.bh",
    "Fajr Bahrain",
    "Maghrib Bahrain",
    "Isha Bahrain",
    "Manama prayer times",
    "Muharraq prayer times",
    "مواقيت الصلاة البحرين",
    "أوقات الصلاة البحرين",
  ],
  authors: [{ name: "pray.bh" }],
  creator: "pray.bh",
  publisher: "pray.bh",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    title: "pray.bh",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    shortcut: "/icon-192.png",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "pray.bh",
    title: siteTitle,
    description: siteDescription,
    locale: "en_BH",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "pray.bh app icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "lifestyle",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff7ed" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="pray.bh" />
      </head>
      <body className={`${inter.variable} ${amiri.variable}`}>
        <ServiceWorkerRegistration />
        <PWAInstallPrompt />
        {children}
      </body>
    </html>
  )
}
