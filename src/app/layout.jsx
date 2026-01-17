import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Ho tolto ": Metadata" dopo la costante
export const metadata = {
  title: "MediGuard", // Ho messo il nome del tuo progetto
  description: "Gestione Farmaci e Listini",
};

// Ho tolto ": Readonly<{ children: React.ReactNode; }>"
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}