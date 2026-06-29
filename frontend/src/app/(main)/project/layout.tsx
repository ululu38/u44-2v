import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Projects | U FORTY FOUR',
  description: 'ผลงานและโปรเจกต์ที่เราให้บริการติดตั้ง ออกแบบ และวางระบบ IT Solutions ให้กับลูกค้า',
  openGraph: {
    images: ['/images/U44-icon-133x123.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/U44-icon-133x123.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
