import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/src/lib/auth-context';

export const metadata: Metadata = {
  title: 'TFMaster - 德福词汇学习',
  description: '德福考试词汇学习平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
