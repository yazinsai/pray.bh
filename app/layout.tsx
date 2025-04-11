import type React from "react"
import "./globals.css"
import { Inter, Amiri } from "next/font/google"
import type { Metadata } from "next"

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
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${amiri.variable}`}>{children}</body>
    </html>
  )
}


import './globals.css'