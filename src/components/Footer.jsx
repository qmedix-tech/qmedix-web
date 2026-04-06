import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'How it Works', href: '#how-it-works' },
      { name: 'Demo', href: '#demo' },
      { name: 'Pricing', href: '#pricing' },
    ],
    Company: [
      { name: 'About Us', href: '#about' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
    ],
  };

  return (
    <footer className="bg-slate-900 text-slate-300 py-20 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* BRAND & DESC */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2 group text-white">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <HeartPulse size={20} className="text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight">
                QMedix
              </span>
            </Link>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Modernizing healthcare by eliminating physical queues. QMedix brings transparency and efficiency to patient flow management.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Github, Linkedin, Mail].map((Icon, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-slate-700"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* DYNAMIC LINKS */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-wider text-sm">{title}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="hover:text-primary transition-colors text-slate-400"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {currentYear} QMedix Solutions. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Made with ❤️ for Healthcare</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
