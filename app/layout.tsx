import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/big-shoulders-display';
import '@fontsource-variable/source-serif-4';
import '@fontsource-variable/source-serif-4/wght-italic.css';
import '@fontsource/architects-daughter';
import './globals.css';

export const metadata: Metadata = {
  title: 'BuildHouse mentor book',
  description: 'Private. For BuildHouse mentors.',
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#27463D' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
