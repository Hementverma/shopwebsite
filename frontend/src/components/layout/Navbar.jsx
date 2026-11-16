import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import API from '../../utils/api';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiPhone, FiMessageCircle, FiChevronDown, FiChevronRight, FiPackage, FiMapPin, FiGrid, FiLogOut, FiHome } from 'react-icons/fi';
import logoImg from '../../assets/Logo.png';

export default function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileSection, setMobileSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenu, setUserMenu] = useState(false);
  const [catDropdown, setCatDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenu(false);
    setUserMenu(false);
    setCatDropdown(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = mobileMenu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/products?search=${encodeURIComponent(q)}`);
    setMobileMenu(false);
  };

  const electrical = categories.find(c => c.slug === 'electrical');
  const hardware = categories.find(c => c.slug === 'hardware');
  const categoryParam = new URLSearchParams(location.search).get('category');
  const isHome = location.pathname === '/';
  const isActive = (path) => location.pathname === path;

  const navLinkClass = (active) =>
    `font-display text-[13px] font-semibold uppercase tracking-[0.08em] border-b-2 py-[18px] transition whitespace-nowrap ${
      active ? 'text-white border-brand-400' : 'text-navy-200 border-transparent hover:text-white'
    }`;

  const dropdownPanel = 'absolute left-0 top-full w-64 bg-white rounded-b-xl rounded-tr-xl shadow-[0_16px_40px_-12px_rgba(6,16,31,0.25)] border border-navy-100 py-2 z-50';

  return (
    <>
      {/* Top Info Bar */}
      <div className="bg-navy-950 text-white texture-stripes">
        <div className="container-custom">
          <div className="flex items-center justify-between h-9 text-[12px]">
            <a href="tel:+919893369932" className="flex items-center gap-1.5 text-navy-200 hover:text-white transition">
              <FiPhone size={12} className="text-brand-400" /> +91 98933 69932
            </a>
            <div className="hidden lg:flex items-center gap-7 text-navy-300">
              <span className="flex items-center gap-1.5"><FiMapPin size={12} className="text-brand-400" /> Amajhir, Sehore (M.P.)</span>
              <span className="flex items-center gap-1.5"><FiPackage size={12} className="text-brand-400" /> Electrical &amp; Hardware, one roof</span>
              <span className="flex items-center gap-1.5"><FiMessageCircle size={12} className="text-brand-400" /> WhatsApp orders welcome</span>
            </div>
            <a href="https://wa.me/919893369932" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-navy-200 hover:text-white transition">
              <FiMessageCircle size={12} className="text-brand-400" /> <span className="hidden sm:inline">Chat to Order</span><span className="sm:hidden">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sticky Header */}
      <header className={`sticky top-0 z-50 bg-navy-950 transition-shadow duration-300 ${scrolled ? 'shadow-[0_4px_20px_-6px_rgba(6,16,31,0.15)]' : 'border-b border-navy-800'}`}>
        <div className="container-custom">
          <div className="flex items-center gap-4 h-16 md:h-[68px]">
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu" className="md:hidden p-2 -ml-2 text-white hover:text-brand-300 transition">
              {mobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <img src={logoImg} alt="OM Electrical & Hardware" className="h-9 md:h-10 w-auto" />
              <span className="hidden sm:flex flex-col leading-none">
                <span className="font-display font-extrabold text-[17px] text-white tracking-tight">OM Electrical</span>
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.24em] text-brand-300 mt-0.5">&amp; Hardware</span>
              </span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
              <div className="relative w-full group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand-500 transition" size={17} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search wires, switches, LED lights, pipes, tools..."
                  className="w-full pl-11 pr-4 py-2.5 bg-cream border border-navy-200 rounded-lg text-sm text-ink placeholder:text-muted focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 outline-none transition-all"
                />
              </div>
            </form>

            {/* Right Icons */}
            <div className="hidden md:flex items-center gap-1 ml-auto">
              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-navy-800 transition">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-navy-400" />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-white text-navy-900 flex items-center justify-center text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                    )}
                    <span className="text-sm font-medium text-white max-w-[100px] truncate">{user.name}</span>
                    <FiChevronDown size={14} className={`text-navy-300 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenu && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-[0_16px_40px_-12px_rgba(6,16,31,0.25)] border border-navy-100 py-1.5 z-50">
                      <Link to="/account" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-cream text-navy-800 transition"><FiUser size={14} className="text-muted" /> My Account</Link>
                      <Link to="/account/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-cream text-navy-800 transition"><FiPackage size={14} className="text-muted" /> My Orders</Link>
                      {isAdmin && <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-50 text-brand-400 font-semibold transition"><FiGrid size={14} /> Admin Dashboard</Link>}
                      <hr className="my-1.5 border-navy-100" />
                      <button onClick={() => { logout(); setUserMenu(false); }} className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger-soft transition"><FiLogOut size={14} /> Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-navy-800 transition text-sm font-medium text-white hover:text-brand-200">
                  <FiUser size={18} /> <span className="hidden lg:inline">Account</span>
                </Link>
              )}

              <div className="w-px h-7 bg-navy-700 mx-1.5"></div>

              <Link to="/cart" className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-navy-800 transition text-sm font-medium text-white hover:text-brand-200">
                <span className="relative">
                  <FiShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-brand-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold shadow-sm">{cartCount}</span>
                  )}
                </span>
                <span className="hidden lg:inline">Cart</span>
              </Link>
            </div>

            {/* Mobile cart */}
            <Link to="/cart" className="relative md:hidden ml-auto p-2 text-white">
              <FiShoppingCart size={22} />
              {cartCount > 0 && <span className="absolute top-0.5 right-0.5 bg-brand-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
            </Link>
          </div>

          {/* Mobile search row */}
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-cream border border-navy-200 rounded-lg text-sm text-ink placeholder:text-muted focus:bg-white focus:border-brand-500 outline-none transition"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 border-t border-navy-800 -mt-px">
            <Link to="/" className={navLinkClass(isHome)}>Home</Link>

            {/* Electrical */}
            <div className="relative" onMouseEnter={() => setCatDropdown('electrical')} onMouseLeave={() => setCatDropdown(null)}>
              <Link to="/products?category=electrical" className={`${navLinkClass(categoryParam === 'electrical')} flex items-center gap-1`}>
                Electrical <FiChevronDown size={13} className={`transition-transform ${catDropdown === 'electrical' ? 'rotate-180' : ''}`} />
              </Link>
              {catDropdown === 'electrical' && electrical?.subcategories?.length > 0 && (
                <div className={dropdownPanel}>
                  {electrical.subcategories.map(sub => (
                    <Link key={sub.slug} to={`/products?category=electrical&subcategory=${encodeURIComponent(sub.name)}`} className="flex items-center justify-between px-4 py-2 text-sm text-navy-700 hover:bg-brand-50 hover:text-brand-700 transition">
                      {sub.name} <FiChevronRight size={13} className="text-brand-400" />
                    </Link>
                  ))}
                  <hr className="my-1.5 border-navy-100" />
                  <Link to="/products?category=electrical" className="block px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition">View All Electrical</Link>
                </div>
              )}
            </div>

            {/* Hardware */}
            <div className="relative" onMouseEnter={() => setCatDropdown('hardware')} onMouseLeave={() => setCatDropdown(null)}>
              <Link to="/products?category=hardware" className={`${navLinkClass(categoryParam === 'hardware')} flex items-center gap-1`}>
                Hardware <FiChevronDown size={13} className={`transition-transform ${catDropdown === 'hardware' ? 'rotate-180' : ''}`} />
              </Link>
              {catDropdown === 'hardware' && hardware?.subcategories?.length > 0 && (
                <div className={dropdownPanel}>
                  {hardware.subcategories.map(sub => (
                    <Link key={sub.slug} to={`/products?category=hardware&subcategory=${encodeURIComponent(sub.name)}`} className="flex items-center justify-between px-4 py-2 text-sm text-navy-700 hover:bg-brand-50 hover:text-brand-700 transition">
                      {sub.name} <FiChevronRight size={13} className="text-brand-400" />
                    </Link>
                  ))}
                  <hr className="my-1.5 border-navy-100" />
                  <Link to="/products?category=hardware" className="block px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition">View All Hardware</Link>
                </div>
              )}
            </div>

            <Link to="/products" className={navLinkClass(location.pathname === '/products' && !categoryParam && !new URLSearchParams(location.search).get('bestseller'))}>All Products</Link>
            <Link to="/products?bestseller=true" className={navLinkClass(new URLSearchParams(location.search).get('bestseller') === 'true')}>Best Sellers</Link>
            <Link to="/#about" className={navLinkClass(false)}>About Us</Link>
            <Link to="/contact" className={navLinkClass(isActive('/contact'))}>Contact</Link>
          </nav>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenu && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-white border-b border-navy-100 shadow-[0_20px_40px_-12px_rgba(6,16,31,0.3)] max-h-[calc(100vh-140px)] overflow-y-auto">
            <nav className="py-2">
              <Link to="/" className="flex items-center gap-3 px-5 py-3 text-navy-800 hover:bg-cream font-medium border-b border-navy-50"><FiHome size={16} className="text-muted" /> Home</Link>

              {['electrical', 'hardware'].map(slug => {
                const cat = slug === 'electrical' ? electrical : hardware;
                const open = mobileSection === slug;
                return (
                  <div key={slug} className="border-b border-navy-50">
                    <button onClick={() => setMobileSection(open ? '' : slug)} className="flex items-center justify-between w-full px-5 py-3 text-navy-800 hover:bg-cream font-medium">
                      <span className="capitalize">{slug}</span>
                      <FiChevronDown size={16} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && (
                      <div className="bg-cream/60 pb-2">
                        {cat?.subcategories?.map(sub => (
                          <Link key={sub.slug} to={`/products?category=${slug}&subcategory=${encodeURIComponent(sub.name)}`} className="block px-8 py-2 text-sm text-navy-700 hover:text-brand-600">{sub.name}</Link>
                        ))}
                        <Link to={`/products?category=${slug}`} className="block px-8 py-2 text-sm text-brand-600 font-semibold">View All {slug === 'electrical' ? 'Electrical' : 'Hardware'} →</Link>
                      </div>
                    )}
                  </div>
                );
              })}

              <Link to="/products" className="block px-5 py-3 text-navy-800 hover:bg-cream font-medium border-b border-navy-50">All Products</Link>
              <Link to="/products?bestseller=true" className="block px-5 py-3 text-navy-800 hover:bg-cream font-medium border-b border-navy-50">Best Sellers</Link>
              <Link to="/#about" className="block px-5 py-3 text-navy-800 hover:bg-cream font-medium border-b border-navy-50">About Us</Link>
              <Link to="/contact" className="block px-5 py-3 text-navy-800 hover:bg-cream font-medium border-b border-navy-50">Contact</Link>

              {user ? (
                <>
                  <Link to="/account" className="block px-5 py-3 text-navy-800 hover:bg-cream font-medium border-b border-navy-50">My Account</Link>
                  <Link to="/account/orders" className="block px-5 py-3 text-navy-800 hover:bg-cream font-medium border-b border-navy-50">My Orders</Link>
                  {isAdmin && <Link to="/admin" className="block px-5 py-3 text-brand-400 hover:bg-brand-50 font-semibold border-b border-navy-50">Admin Dashboard</Link>}
                  <button onClick={() => { logout(); setMobileMenu(false); }} className="block w-full text-left px-5 py-3 text-danger hover:bg-danger-soft font-medium">Logout</button>
                </>
              ) : (
                <Link to="/login" className="block px-5 py-3 text-navy-800 hover:bg-cream font-medium">Login / Register</Link>
              )}

              <div className="px-5 py-4">
                <a href="tel:+919893369932" className="btn-outline w-full text-sm"><FiPhone size={14} /> Call +91 98933 69932</a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Click-away backdrop for open desktop dropdowns is handled by onMouseLeave */}
    </>
  );
}
