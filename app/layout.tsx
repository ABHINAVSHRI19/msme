import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "MicroMatch — Zero-Cash Growth for Local Businesses",
  description: "MicroMatch connects local MSMEs with student creators who promote products through barter and affiliate marketing—turning local products into local growth.",
  keywords: ["MSME", "micro-influencer", "affiliate marketing", "barter", "local business", "creator economy"],
  openGraph: {
    title: "MicroMatch — Zero-Cash Growth for Local Businesses",
    description: "Connect with local creators. Grow without ads.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
