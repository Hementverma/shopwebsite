import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiZap, FiCheck, FiArrowLeft } from 'react-icons/fi';
import logoImg from '../assets/Logo.png';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Login successful!');
      } else {
        await register(form);
        toast.success('Registration successful!');
      }
      navigate('/');
    } catch (error) {
      const message = !error.response
        ? 'Cannot reach server. Make sure the backend is running on port 5000.'
        : error.response?.data?.message || 'Authentication failed';
      toast.error(message);
    }
    setLoading(false);
  };

  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-180px)]">
      {/* Brand panel */}
      <div className="hidden lg:flex bg-navy-900 texture-stripes flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-navy-300 hover:text-white transition text-sm mb-16">
            <FiArrowLeft size={15} /> Back to store
          </Link>
          <img src={logoImg} alt="" className="w-16 h-16 object-contain mb-6" />
          <h2 className="font-display text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight mb-5">
            Powering Every Connection.<br /><span className="text-brand-500">Building Every Dream.</span>
          </h2>
          <p className="text-navy-300 text-sm leading-relaxed max-w-md mb-10">
            Sign in to shop electrical and hardware essentials, track your orders and reorder in seconds.
          </p>
          <ul className="space-y-4">
            {['Browse electrical & hardware in one place', 'Free delivery on orders above ₹500', 'Track orders and reorder easily', 'Order online, call or WhatsApp'].map(item => (
              <li key={item} className="flex items-center gap-3 text-[14.5px] text-navy-200">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0"><FiCheck size={13} /></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-navy-400 text-[13px]">© {new Date().getFullYear()} OM Electrical &amp; Hardware · Amajhir, Sehore (M.P.)</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 bg-cream texture-grid">
        <div className="card w-full max-w-md p-7 sm:p-9">
          <div className="text-center mb-7">
            <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiZap size={22} className="text-brand-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="text-sm text-muted mt-1.5">{isLogin ? 'Login to your OM Electrical & Hardware account' : 'Register for a new account'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[13px] font-semibold text-ink mb-1.5">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-10" placeholder="Enter your name" required={!isLogin} />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-ink mb-1.5">Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-10" placeholder="10-digit phone number" />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-10" placeholder="Enter your email" required />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-10 pr-11" placeholder="Enter password" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition">{showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-2">{loading ? 'Please wait…' : isLogin ? 'Login' : 'Create Account'}</button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">{isLogin ? "Don't have an account?" : 'Already have an account?'} <button onClick={() => setIsLogin(!isLogin)} className="text-brand-600 font-semibold hover:underline">{isLogin ? 'Register' : 'Login'}</button></p>
          </div>

          {isLogin && (
            <div className="mt-5 p-3.5 bg-cream rounded-lg border border-navy-100 text-[12px] text-muted space-y-0.5">
              <p className="font-semibold text-ink mb-1">Demo Credentials</p>
              <p>Admin: admin@electricalshop.com / admin123</p>
              <p>Customer: rahul@example.com / customer123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
