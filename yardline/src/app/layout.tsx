import type { Metadata, Viewport } from 'next';
import './globals.css';
import './workspace.css';
import './figma-workspace.css';
import './overview-figma.css';
import './yard-grid.css';
export const metadata: Metadata = {
  title: 'Yardline — A place for every container',
  description:
    'A practical, software-only container yard management workspace. Find, place, move, and verify containers on a persistent digital yard grid.',
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
  colorScheme: 'light',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
