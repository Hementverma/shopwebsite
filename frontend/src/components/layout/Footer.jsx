import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiClock, FiMessageCircle, FiChevronRight, FiZap } from 'react-icons/fi';
import API from '../../utils/api';
import logoImg from '../../assets/Logo.png';

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {});
  }, []);

  const electrical = categories.find(c => c.slug === 'electrical');
  const hardware = categories.find(c => c.slug === 'hardware');

  const shopLinks = [
    { label: 'Home', path: '/' },
    { label: 'All Products', path: '/products' },
    { label: 'Best Sellers', path: '/products?bestseller=true' },
    { label: 'New Arrivals', path: '/products?new=true' },
    { label: 'About Us', path: '/#about' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const customerLinks = [
    { label: 'My Account', path: '/account' },
    { label: 'My Orders', path: '/account/orders' },
    { label: 'Shopping Cart', path: '/cart' },
    { label: 'Login / Register', path: '/login' },
  ];

  const linkClass = 'flex items-center gap-2 text-[13.5px] text-navy-300 hover:text-brand-400 transition';

  return (
    <footer className="bg-navy-950 text-white texture-stripes">
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img src={logoImg} alt="OM Electrical & Hardware" className="h-12 mb-4" />
            <p className="font-display font-bold text-white text-sm mb-2">Electrical &amp; Hardware Shop</p>
            <p className="text-navy-300 text-[13.5px] leading-relaxed mb-5">Quality electrical supplies and reliable hardware essentials for every home, workshop and project.</p>
            <div className="flex flex-col gap-2.5">
              <a href="tel:+919893369932" className="flex items-center gap-2.5 text-sm text-white hover:text-brand-400 transition">
                <span className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center shrink-0"><FiPhone size={14} className="text-brand-400" /></span>
                +91 98933 69932
              </a>
              <a href="https://wa.me/919893369932" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-white hover:text-brand-400 transition">
                <span className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center shrink-0"><FiMessageCircle size={14} className="text-brand-400" /></span>
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-[13px] uppercase tracking-[0.16em] flex items-center gap-2">
              <FiZap size={13} className="text-brand-400" /> Shop
            </h4>
            <ul className="space-y-2.5">
              {shopLinks.map(link => (
                <li key={link.label}><Link to={link.path} className={linkClass}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Electrical category */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-[13px] uppercase tracking-[0.16em] flex items-center gap-2">
              <FiZap size={13} className="text-brand-400" /> Electrical
            </h4>
            <ul className="space-y-2.5">
              {electrical?.subcategories?.slice(0, 7).map(sub => (
                <li key={sub.slug}>
                  <Link to={`/products?category=electrical&subcategory=${encodeURIComponent(sub.name)}`} className={linkClass}>{sub.name}</Link>
                </li>
              ))}
              <li><Link to="/products?category=electrical" className="flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-400 hover:text-brand-300 transition">View All <FiChevronRight size={13} /></Link></li>
            </ul>
          </div>

          {/* Hardware category */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-[13px] uppercase tracking-[0.16em] flex items-center gap-2">
              <FiZap size={13} className="text-brand-400" /> Hardware
            </h4>
            <ul className="space-y-2.5">
              {hardware?.subcategories?.slice(0, 7).map(sub => (
                <li key={sub.slug}>
                  <Link to={`/products?category=hardware&subcategory=${encodeURIComponent(sub.name)}`} className={linkClass}>{sub.name}</Link>
                </li>
              ))}
              <li><Link to="/products?category=hardware" className="flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-400 hover:text-brand-300 transition">View All <FiChevronRight size={13} /></Link></li>
            </ul>
          </div>

          {/* Contact + Customer service */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-[13px] uppercase tracking-[0.16em] flex items-center gap-2">
              <FiZap size={13} className="text-brand-400" /> Customer Care
            </h4>
            <ul className="space-y-2.5 mb-6">
              {customerLinks.map(link => (
                <li key={link.label}><Link to={link.path} className={linkClass}>{link.label}</Link></li>
              ))}
            </ul>
            <div className="space-y-3 text-[13px]">
              <div className="flex items-start gap-2.5">
                <FiMapPin className="text-brand-400 mt-0.5 shrink-0" size={14} />
                <span className="text-navy-300">Main Road, Amajhir, Near Pani Ki Tanki, Post Mograram, Jilla Sehore, Madhya Pradesh</span>
              </div>
              <div className="flex items-start gap-2.5">
                <FiClock className="text-brand-400 mt-0.5 shrink-0" size={14} />
                <div className="text-navy-300">
                  <p>Mon – Sat: 9:00 AM – 8:00 PM</p>
                  <p>Sunday: 10:00 AM – 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <FiMail className="text-brand-400 shrink-0" size={14} />
                <a href="mailto:info@omelectrical.com" className="text-navy-300 hover:text-brand-400 transition break-all">info@omelectrical.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-navy-800/80">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-navy-400">
          <p>&copy; {new Date().getFullYear()} OM Electrical &amp; Hardware Shop. All rights reserved.</p>
          <p>Powering every connection. Building every dream.</p>
        </div>
      </div>
    </footer>
  );
}
