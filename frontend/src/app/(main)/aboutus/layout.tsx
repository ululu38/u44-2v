import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | U FORTY FOUR',
  description: 'ทำความรู้จักกับ บริษัท ยู โฟร์ตี้โฟร์ เทคโนโลยี โซลูชั่นส์ จำกัด ผู้ให้บริการด้าน IT Solutions อย่างครบวงจร',
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
