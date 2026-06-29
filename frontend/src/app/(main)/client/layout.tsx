import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Clients | U FORTY FOUR',
  description: 'ลูกค้าองค์กรทั้งภาครัฐและเอกชนที่ไว้วางใจใช้บริการ IT Solutions จากเรา',
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
