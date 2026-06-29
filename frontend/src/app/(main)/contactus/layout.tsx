import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | U FORTY FOUR',
  description: 'ติดต่อ บริษัท ยู โฟร์ตี้โฟร์ เทคโนโลยี โซลูชั่นส์ จำกัด สอบถามข้อมูลบริการ IT Solutions หรือขอคำปรึกษา',
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
