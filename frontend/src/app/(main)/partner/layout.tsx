import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Partners | U FORTY FOUR',
  description: 'พันธมิตรผลิตภัณฑ์และแบรนด์ชั้นนำระดับโลกที่ร่วมงานกับ ยู โฟร์ตี้โฟร์ เทคโนโลยี โซลูชั่นส์',
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
