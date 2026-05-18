"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full">
      <div className="footer-top">
        <div className="container mx-auto px-4 max-w-[1600px]">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full lg:w-1/3 md:w-2/3 px-4 mb-10 lg:mb-0">
              <div className="widget">
                <h5 className="footer-title">About Us</h5>
                <div className="gem-contacts">
                  <h6 className="footer-heading">COMPANY DESCRIPTION</h6>
                  <p className="footer-text">
                    บริษัท ยู โฟร์ตี้โฟร์ เทคโนโลยี โซลูชั่นส์ จำกัด ให้บริการจัดจำหน่าย ออกแบบ ติดตั้ง และดูแลระบบเทคโนโลยี IT ทั้งฮาร์ดแวร์และซอฟต์แวร์ พร้อมทีมผู้เชี่ยวชาญด้าน System Integration ครบวงจรสำหรับองค์กรทุกขนาด
                  </p>
                </div>
              </div>
              <div className="widget mt-10">
                <h6 className="footer-heading">SOLUTION</h6>
                <div className="solution-grid">
                  <div>
                    <span><Link href="/solution">IOT Solutions</Link></span>
                    <span><Link href="/solution">IT Service</Link></span>
                  </div>
                  <div>
                    <span><Link href="/solution">Data Center Solutions</Link></span>
                    <span><Link href="/solution">Digital Signage Solutions</Link></span>
                  </div>
                  <div>
                    <span><Link href="/solution">Network System Solutions</Link></span>
                    <span><Link href="/solution">CCTV & Access Control Solutions</Link></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/6 md:w-1/4 px-4 mb-10 lg:mb-0">
              <div className="widget hidden lg:block">
                <h6 className="footer-heading">Link Page</h6>
                <div className="link-list flex flex-col gap-2">
                  <span><Link href="/aboutus">About us</Link></span>
                  <span><Link href="/solution">Solution</Link></span>
                  <span><Link href="/project">Project</Link></span>
                  <span><Link href="/contactus">Contact us</Link></span>
                  <span><Link href="/article">Article</Link></span>
                </div>
              </div>

              <div className="widget mt-10">
                <h6 className="footer-heading">Social Media</h6>
                <div className="flex gap-2">
                  <a href="https://www.facebook.com/profile.php?id=61555566792786" className="facebook-btn btn-social">
                    <i className="fa-brands fa-facebook mr-2"></i> Facebook
                  </a>
                  <a href="#" className="line-btn btn-social">
                    <i className="fa-brands fa-line mr-2"></i> Line
                  </a>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/4 md:w-1/4 px-4 mb-10 lg:mb-0">
              <div className="widget">
                <h5 className="footer-title">Facebook Fan-Page</h5>
                <div className="overflow-hidden rounded">
                  <iframe
                    src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61555566792786&tabs=timeline&width=340&height=331&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false&appId=1670230966608061"
                    width="100%" height="331" style={{border:'none', overflow:'hidden'}} scrolling="no"
                    frameBorder="0" allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/4 md:w-1/4 px-4">
              <div className="widget">
                <h5 className="footer-title">Map</h5>
                <div className="relative h-[300px] w-full overflow-hidden rounded">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.67490950521!2d100.62902827508888!3d13.677521086706681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d5f5852115dad%3A0xb8e3b18f7bccd5d2!2sU%20FORTY%20FOUR%20TECHNOLOGY%20SOLUTIONS%20CO.%2C%20LTD.!5e0!3m2!1sen!2sth!4v1733292667037!5m2!1sen!2sth"
                    className="absolute inset-0 w-full h-full border-0" allowFullScreen={true} loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom py-4 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2 text-center md:text-left text-white/70 text-sm">
              © 2024 U FORTY FOUR TECHNOLOGY SOLUTIONS CO., LTD.
            </div>
            <div className="w-full md:w-1/2 hidden md:flex justify-end gap-4">
               <a href="https://www.facebook.com/profile.php?id=61555566792786" target="_blank" className="text-white hover:text-blue-400">
                  <i className="fab fa-facebook-f"></i>
               </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-top {
            background: var(--nav-gradient);
            padding: 50px 0;
            color: white;
        }
        .footer-bottom {
            background: var(--nav-gradient);
        }
        .footer-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 2rem;
            position: relative;
            padding-bottom: 10px;
        }
        .footer-title:after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            width: 50px;
            height: 2px;
            background: var(--accent);
        }
        .footer-heading {
            font-size: 0.9rem;
            font-weight: bold;
            color: var(--accent);
            margin-bottom: 1rem;
            text-transform: uppercase;
        }
        .footer-text {
            font-size: 0.95rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.8);
        }
        .solution-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }
        .solution-grid span a, .link-list span a {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
            text-decoration: none;
            transition: color 0.3s;
        }
        .solution-grid span a:hover, .link-list span a:hover {
            color: var(--accent);
        }
        .btn-social {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            border-radius: 4px;
            color: white;
            font-size: 0.85rem;
            text-decoration: none;
        }
        .facebook-btn { background-color: #4267B2; }
        .line-btn { background-color: #00B900; }
      `}</style>
    </footer>
  );
}
