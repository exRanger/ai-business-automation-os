import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Business Automation OS',
  description: 'All-in-one automation showcase: leads, content, proposals, invoices, bookings and digest.'
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#10151d' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>;
}
