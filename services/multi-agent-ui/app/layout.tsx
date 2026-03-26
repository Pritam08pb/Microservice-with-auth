import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Helpy Multi-Agent UI',
  description: 'Frontend for Helpy multi agent service'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
