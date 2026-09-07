import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'NCCT Digital Platform — AI-Powered Cooperative Capacity Building',
  description:
    'AI-enabled cooperative capacity building, ERP, and employment ecosystem. Powered by Smart India Hackathon 2026.',
  keywords: ['cooperative', 'capacity building', 'AI', 'LMS', 'ERP', 'SIH 2026', 'Ministry of Cooperation'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
