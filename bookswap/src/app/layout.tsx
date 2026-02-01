import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "BookSwap - Trade Books with Fellow Readers",
  description: "Connect with book lovers, list your books for trade, and discover your next great read.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
