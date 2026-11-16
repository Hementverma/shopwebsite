import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import ProductSkeleton from '../components/common/LoadingSkeleton';
import {
  FiArrowRight, FiArrowUpRight, FiPhone, FiMessageCircle, FiMapPin, FiClock, FiTruck,
  FiLayers, FiZap, FiShield, FiCheckCircle, FiCheck, FiTool, FiShare2, FiDroplet, FiLock,
  FiBookOpen, FiBox, FiPackage, FiPower, FiSun, FiDisc, FiToggleLeft, FiActivity,
  FiRefreshCw, FiSliders, FiHome, FiTag,
} from 'react-icons/fi';
import shopImg from '../assets/shop.png';
import logoImg from '../assets/Logo.png';

const subcategoryIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('wire') || n.includes('cable')) return <FiActivity size={20} />;
  if (n.includes('switch') || n.includes('socket')) return <FiToggleLeft size={20} />;
  if (n.includes('led') || n.includes('bulb') || n.includes('light')) return <FiSun size={20} />;
  if (n.includes('fan')) return <FiDisc size={20} />;
  if (n.includes('mcb') || n.includes('distribution') || n.includes('protection')) return <FiPower size={20} />;
  if (n.includes('motor')) return <FiRefreshCw size={20} />;
  if (n.includes('plug') || n.includes('adapter')) return <FiZap size={20} />;
  if (n.includes('tap') || n.includes('faucet') || n.includes('plumb') || n.includes('sanitary')) return <FiDroplet size={20} />;
  if (n.includes('pipe') || n.includes('fitting')) return <FiShare2 size={20} />;
  if (n.includes('lock')) return <FiLock size={20} />;
  if (n.includes('hinge')) return <FiBookOpen size={20} />;
  if (n.includes('screw') || n.includes('nut') || n.includes('bolt') || n.includes('fastener')) return <FiBox size={20} />;
  if (n.includes('adhesive') || n.includes('glue')) return <FiTag size={20} />;
  if (n.includes('safety')) return <FiShield size={20} />;
  if (n.includes('tool')) return <FiTool size={20} />;
  if (n.includes('accessor') || n.includes('modular')) return <FiSliders size={20} />;
  return <FiPackage size={20} />;
};

const CategoryPanel = ({ cat, slug, accent, stats }) => (
  <div className={`card card-hover border-t-4 ${accent} flex flex-col`}>
    <div className="p-6 pb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="font-display text-xl font-bold text-ink">{cat?.name || (slug === 'electrical' ? 'Electrical' : 'Hardware')}</h3>
        <p className="text-sm text-muted mt-1">{stats} subcategories</p>
      </div>
      <Link to={`/products?category=${slug}`} className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition shrink-0">
        View all <FiArrowUpRight size={15} />
      </Link>
    </div>
    <div className="grid grid-cols-2 gap-2.5 px-6 pb-6">
      {cat?.subcategories?.map(sub => (
        <Link
          key={sub.slug}
          to={`/products?category=${slug}&subcategory=${encodeURIComponent(sub.name)}`}
          className="group flex items-center gap-3 rounded-lg border border-navy-100 bg-cream/60 px-3.5 py-3 hover:border-brand-300 hover:bg-brand-50 transition-all duration-200"
        >
          <span className="w-9 h-9 rounded-lg bg-white border border-navy-100 text-navy-700 group-hover:text-brand-600 group-hover:border-brand-200 flex items-center justify-center shrink-0 transition">
            {subcategoryIcon(sub.name)}
          </span>
          <span className="text-[13px] font-medium text-navy-800 leading-tight">{sub.name}</span>
        </Link>
      ))}
    </div>
  </div>
);

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    Promise.all([
      API.get('/products/featured').catch(() => ({ data: { products: [] } })),
      API.get('/products/best-sellers').catch(() => ({ data: { products: [] } })),
      API.get('/products/new-arrivals').catch(() => ({ data: { products: [] } })),
      API.get('/categories').catch(() => ({ data: { categories: [] } })),
    ]).then(([f, b, n, c]) => {
      setFeatured(f.data.products);
      setBestSellers(b.data.products);
      setNewArrivals(n.data.products);
      setCategories(c.data.categories);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }, [location.hash]);

  const electrical = categories.find(c => c.slug === 'electrical');
  const hardware = categories.find(c => c.slug === 'hardware');
  const subcategoryCount = (electrical?.subcategories?.length || 0) + (hardware?.subcategories?.length || 0);

  const collage = [...featured, ...bestSellers, ...newArrivals]
    .filter(p => p.images?.[0]?.url)
    .filter((p, i, arr) => arr.findIndex(x => x._id === p._id) === i)
    .slice(0, 6);

  const categoryStats = {
    electrical: electrical?.subcategories?.length || 0,
    hardware: hardware?.subcategories?.length || 0,
  };

  const sectionHeader = (eyebrow, title, linkText, linkTo) => (
    <div className="animate-fade-up flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <p className="section-eyebrow mb-2">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
      </div>
      {linkText && (
        <Link to={linkTo} className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition group">
          {linkText} <FiArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );

  return (
    <div>
      {/* ======================= HERO ======================= */}
      <section className="relative bg-cream texture-grid overflow-hidden">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center py-12 md:py-16 lg:py-20">
            {/* Left: content */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_-24px_rgba(6,16,31,0.45)] animate-fade-up">
              <img
                src={shopImg}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover animate-zoom-soft"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/85 to-navy-950/60" aria-hidden="true" />
              <div className="relative p-6 sm:p-8 lg:p-10">
                <p className="section-eyebrow text-brand-400 mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-brand-400" aria-hidden="true" />
                  Electrical &amp; Hardware Supplies
                </p>
                <h1 className="font-display text-[2.15rem] leading-[1.1] sm:text-5xl sm:leading-[1.08] font-extrabold text-white tracking-tight mb-5">
                  Powering Every Connection.<br />
                  <span className="text-brand-400">Building Every Dream.</span>
                </h1>
                <p className="text-base md:text-lg text-navy-200 leading-relaxed mb-8 max-w-lg">
                  Quality electrical supplies and reliable hardware essentials for every home, workshop, and project.
                </p>

                <div className="flex flex-wrap gap-3.5 mb-10">
                  <Link to="/products" className="btn-primary btn-lg shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30">
                    Explore Products <FiArrowRight size={18} />
                  </Link>
                  <Link to="/contact" className="btn-outline btn-lg bg-white">
                    Contact Our Shop
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] font-medium text-navy-100">
                  <span className="flex items-center gap-2"><FiLayers size={16} className="text-brand-400" /> {subcategoryCount || 20}+ subcategories</span>
                  <span className="flex items-center gap-2"><FiTruck size={16} className="text-brand-400" /> Free delivery over ₹500</span>
                  <span className="flex items-center gap-2"><FiPhone size={16} className="text-brand-400" /> Call or WhatsApp to order</span>
                </div>
              </div>
            </div>

            {/* Right: product arrangement */}
            <div className="relative">
              <div className="absolute inset-4 sm:inset-6 lg:inset-8 bg-navy-900 rounded-[28px] texture-stripes" aria-hidden="true" />
              <div className="relative grid grid-cols-3 gap-2.5 sm:gap-3 p-4 sm:p-6 stagger">
                {collage.length >= 4 ? (
                  collage.map((p, i) => (
                    <Link
                      key={p._id}
                      to={`/product/${p.slug}`}
                      className={`group relative overflow-hidden rounded-xl bg-white border border-navy-100 shadow-lg aspect-square transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl ${i === 0 ? 'col-span-2 row-span-2 aspect-auto min-h-[180px]' : ''}`}
                    >
                      <img
                        src={p.images[0].url}
                        alt={p.images[0].alt || p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 to-transparent p-2.5 pt-8">
                        <span className="text-white text-[11px] font-semibold line-clamp-1 block">{p.name}</span>
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 rounded-xl overflow-hidden shadow-xl aspect-[4/3]">
                    <img src={shopImg} alt="OM Electrical & Hardware shop" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 left-4 sm:left-8 bg-white rounded-xl shadow-[0_16px_40px_-12px_rgba(6,16,31,0.3)] border border-navy-100 px-4 py-3 flex items-center gap-3 animate-float-soft">
                <img src={logoImg} alt="" className="w-9 h-9 object-contain" />
                <div className="leading-tight">
                  <p className="font-display font-bold text-navy-900 text-sm">Under One Roof</p>
                  <p className="text-[11px] text-muted">Electrical + Hardware</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= TRUST STRIP ======================= */}
      <section className="bg-white border-y border-navy-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-navy-100 stagger">
            {[
              { icon: <FiShield size={22} />, title: 'Quality Products', desc: 'Genuine products from trusted brands' },
              { icon: <FiCheckCircle size={22} />, title: 'Reliable Service', desc: 'Support before and after your purchase' },
              { icon: <FiLayers size={22} />, title: 'One Roof', desc: 'Electrical & hardware together' },
              { icon: <FiMapPin size={22} />, title: 'Local Shop Support', desc: 'Visit us at Amajhir, Sehore' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-6 lg:p-7">
                <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">{item.icon}</span>
                <div>
                  <p className="font-display font-bold text-ink text-[15px] leading-tight mb-1">{item.title}</p>
                  <p className="text-[13px] text-muted leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= CATEGORIES ======================= */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          {sectionHeader('Shop by category', 'Everything, From Wires to Pipes', 'Browse All Products', '/products')}
          <div className="grid lg:grid-cols-2 gap-6 stagger">
            <CategoryPanel cat={electrical} slug="electrical" accent="border-brand-500" stats={categoryStats.electrical} />
            <CategoryPanel cat={hardware} slug="hardware" accent="border-navy-800" stats={categoryStats.hardware} />
          </div>
        </div>
      </section>

      {/* ======================= PRODUCT SECTIONS ======================= */}
      {loading ? (
        <div className="container-custom pb-16"><ProductSkeleton count={8} /></div>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="py-16 md:py-20 bg-white border-y border-navy-100">
              <div className="container-custom">
                {sectionHeader('Handpicked for you', 'Featured Products', 'View All Featured', '/products?featured=true')}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 stagger">
                  {featured.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {bestSellers.length > 0 && (
            <section className="py-16 md:py-20">
              <div className="container-custom">
                {sectionHeader('Customer favourites', 'Best Sellers', 'View All Best Sellers', '/products?bestseller=true')}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 stagger">
                  {bestSellers.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {newArrivals.length > 0 && (
            <section className="py-16 md:py-20 bg-white border-y border-navy-100">
              <div className="container-custom">
                {sectionHeader('Just stocked', 'New Arrivals', 'View All New Arrivals', '/products?new=true')}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 stagger">
                  {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ======================= EXPERT HELP BAND ======================= */}
      <section className="bg-navy-900 texture-stripes">
        <div className="container-custom py-14 md:py-16">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center stagger">
            <div>
              <p className="section-eyebrow text-brand-400 mb-3">Need help choosing?</p>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight">
                Talk to Our Experts Before You Buy
              </h2>
              <p className="text-navy-300 text-sm md:text-base max-w-xl leading-relaxed">
                Not sure which wire, switch, MCB or fitting fits your requirement? Call or message us — we'll help you pick the right product for your home, shop or project.
              </p>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3 max-w-lg">
                {['Guidance for the right product', 'Electrical & hardware, one shop', 'Free delivery over ₹500', 'Order online, on call or WhatsApp'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-[13.5px] text-navy-200">
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0"><FiCheck size={12} /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3.5">
              <a href="tel:+919893369932" className="flex items-center gap-4 bg-navy-800/80 border border-navy-700 rounded-xl px-5 py-4 hover:border-brand-400 hover:bg-navy-800 transition group">
                <span className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-500/25"><FiPhone size={20} /></span>
                <span>
                  <span className="block text-navy-300 text-xs mb-0.5">Call Us</span>
                  <span className="block font-display font-bold text-white text-lg">+91 98933 69932</span>
                </span>
                <FiArrowUpRight size={18} className="ml-auto text-navy-400 group-hover:text-brand-400 transition" />
              </a>
              <a href="https://wa.me/919893369932" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-navy-800/80 border border-navy-700 rounded-xl px-5 py-4 hover:border-[#1fa855] hover:bg-navy-800 transition group">
                <span className="w-12 h-12 bg-[#1fa855] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#1fa855]/25"><FiMessageCircle size={20} /></span>
                <span>
                  <span className="block text-navy-300 text-xs mb-0.5">WhatsApp Us</span>
                  <span className="block font-display font-bold text-white text-lg">Chat to Order</span>
                </span>
                <FiArrowUpRight size={18} className="ml-auto text-navy-400 group-hover:text-[#1fa855] transition" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= ABOUT ======================= */}
      <section id="about" className="py-16 md:py-20 scroll-mt-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center stagger">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-[0_20px_50px_-20px_rgba(6,16,31,0.35)] border border-navy-100">
                <img src={shopImg} alt="OM Electrical & Hardware shop" className="w-full h-[320px] md:h-[420px] object-cover" />
              </div>
              <div className="absolute -bottom-5 -right-2 sm:right-6 bg-white rounded-xl shadow-[0_16px_40px_-12px_rgba(6,16,31,0.3)] border border-navy-100 px-5 py-4 max-w-[240px]">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <FiHome size={16} className="text-brand-500" />
                  <p className="font-display font-bold text-navy-900 text-sm">Visit Our Shop</p>
                </div>
                <p className="text-[12px] text-muted leading-snug">Main Road, Amajhir, Near Pani Ki Tanki, Sehore (M.P.)</p>
              </div>
            </div>

            <div>
              <p className="section-eyebrow mb-3">About our shop</p>
              <h2 className="section-title mb-5">Your Trusted Local Electrical &amp; Hardware Shop</h2>
              <p className="text-ink-soft leading-relaxed mb-4">
                OM Electrical &amp; Hardware is a local shop serving homes, workshops and projects with the electrical and hardware essentials they need — day after day.
              </p>
              <p className="text-ink-soft leading-relaxed mb-6">
                From wires, switches and LED lighting to pipes, taps, tools and fasteners, our shelves carry dependable products at honest prices, with helpful guidance whenever you need it.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Electrical & hardware products under one roof',
                  'Genuine products from trusted brands',
                  'Free delivery on orders above ₹500',
                  'Order online, call or WhatsApp — your choice',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-[14.5px] text-navy-800">
                    <span className="w-5 h-5 rounded-full bg-success-soft text-success flex items-center justify-center shrink-0 mt-0.5"><FiCheck size={12} /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link to="/products" className="btn-primary">Explore Products <FiArrowRight size={16} /></Link>
                <Link to="/contact" className="btn-outline">Contact Our Shop</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= VISIT / LOCATION ======================= */}
      <section className="py-16 md:py-20 bg-white border-t border-navy-100">
        <div className="container-custom">
          {sectionHeader('Find us', 'Visit OM Electrical & Hardware', null, null)}
          <div className="grid lg:grid-cols-3 gap-6 stagger">
            {/* Details */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-ink mb-5">Shop Details</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <FiMapPin className="text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-ink mb-0.5">Address</p>
                    <p className="text-ink-soft">Main Road, Amajhir, Near Pani Ki Tanki, Post Mograram, Jilla Sehore, Madhya Pradesh</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiClock className="text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-ink mb-0.5">Store Hours</p>
                    <p className="text-ink-soft">Mon – Sat: 9:00 AM – 8:00 PM</p>
                    <p className="text-ink-soft">Sunday: 10:00 AM – 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiPhone className="text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-ink mb-0.5">Phone</p>
                    <a href="tel:+919893369932" className="text-brand-600 font-semibold hover:text-brand-700">+91 98933 69932</a>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 mt-6">
                <a href="tel:+919893369932" className="btn-primary w-full"><FiPhone size={15} /> Call the Shop</a>
                <a href="https://wa.me/919893369932" target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full"><FiMessageCircle size={15} /> WhatsApp Us</a>
              </div>
            </div>

            {/* Tagline card */}
            <div className="card p-8 flex flex-col items-center justify-center text-center bg-cream">
              <img src={logoImg} alt="" className="w-16 h-16 object-contain mb-5" />
              <p className="font-display text-2xl font-extrabold text-navy-900 leading-tight mb-3">
                Powering Every Connection.<br />Building Every Dream.
              </p>
              <p className="text-sm text-muted">Your one-stop shop for electrical &amp; hardware</p>
            </div>

            {/* Map */}
            <div className="card overflow-hidden min-h-[300px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3697.5!2d77.0456!3d23.2012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s42J8%2BW3Q+Amajhir%2C+Madhya+Pradesh+466001!5e0!3m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '300px' }}
                allowFullScreen
                loading="lazy"
                title="OM Electrical & Hardware shop location"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
