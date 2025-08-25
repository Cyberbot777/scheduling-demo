import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "YuziCare Scheduler",
  description: "AI-driven provider scheduling demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
        <nav className="p-4 bg-gray-800 border-b border-gray-700 flex gap-6">
          <a href="/" className="hover:text-purple-400 transition-colors">Dashboard</a>
          <a href="/providers" className="hover:text-purple-400 transition-colors">Providers</a>
          <a href="/requests" className="hover:text-purple-400 transition-colors">Requests</a>
          <a href="/assignments" className="hover:text-purple-400 transition-colors">Assignments</a>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
