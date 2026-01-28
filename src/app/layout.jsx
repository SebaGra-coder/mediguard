import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Assicurati che il percorso di importazione sia corretto in base a dove hai salvato il file
import MedicationReminder from "@/components/modals/MedicationReminder"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MediGuard",
  description: "Gestione Farmaci e Listini",
  locale: "it",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Non serve più passare userId come prop */}
        <MedicationReminder />
        
        {children}
      </body>
    </html>
  );
}