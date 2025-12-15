import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Apex Tech Innovation Pvt Ltd - Data Science Training & Internship",
    template: "%s | Apex Tech Innovation",
  },
  description: "Become a job-ready Data Scientist in 1-3 months. Hands-on Data Science training with real-world projects and internship experience.",
  keywords: ["Data Science", "Training", "Internship", "Python", "Machine Learning", "Data Analysis"],
  authors: [{ name: "Apex Tech Innovation" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://apextechinnovation.com",
    siteName: "Apex Tech Innovation",
    title: "Apex Tech Innovation - Data Science Training & Internship",
    description: "Become a job-ready Data Scientist in 1-3 months.",
    images: [
      {
        url: "/og-apex-tech.png",
        width: 1200,
        height: 630,
        alt: "Apex Tech Innovation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Tech Innovation - Data Science Training",
    description: "Become a job-ready Data Scientist in 1-3 months.",
    images: ["/og-apex-tech.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Analytics />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

