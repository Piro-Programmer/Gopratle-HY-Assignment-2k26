import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GoPratle – Post a Requirement",
  description: "Post an event requirement for planners, performers or crew.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-extrabold tracking-tight text-slate-900">
              Go<span className="text-indigo-600">Pratle</span>
            </Link>
            <nav className="flex gap-1 text-sm font-medium">
              <Link href="/" className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                Post
              </Link>
              <Link href="/requirements" className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                Browse
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">{children}</main>
      </body>
    </html>
  );
}
