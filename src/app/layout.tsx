import type {Metadata} from 'next';
import { Geist } from 'next/font/google'; // Using Geist Sans from next/font/google
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});


export const metadata: Metadata = {
  title: 'Hotel Connector - Find Your Perfect Stay',
  description: 'Search and book hotels worldwide with Hotel Connector.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
