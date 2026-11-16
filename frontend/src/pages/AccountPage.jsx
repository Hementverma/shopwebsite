import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../utils/api';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  FiUser, FiPackage, FiHeart, FiMapPin, FiLock, FiLogOut, FiChevronRight, FiCamera,
  FiShoppingCart, FiTrash2, FiBox,
} from 'react-icons/fi';

export default function AccountPage() {
  const { user, logout, updateUser } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [editForm, setEditForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    setLoading(true);
    try {
      const { data } = await API.put('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      toast.success('Photo updated!');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to upload photo'); }
    setLoading(false);
  };

  useEffect(() => {
    if (location.pathname.includes('/orders')) setActiveTab('orders');
    else if (location.pathname.includes('/wishlist')) setActiveTab('wishlist');
  }, [location]);

  useEffect(() => {
    if (activeTab === 'orders') {
      API.get('/orders/my-orders').then(r => setOrders(r.data.orders)).catch(() => {});
    }
    if (activeTab === 'wishlist') {
      API.get('/wishlist').then(r => setWishlist(r.data.wishlist || [])).catch(() => {});
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.put('/auth/profile', editForm);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to update profile'); }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await API.put('/auth/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to change password'); }
    setLoading(false);
  };

  const handleWishlistRemove = async (productId) => {
    try {
      await API.delete(`/wishlist/${productId}`);
      setWishlist(prev => prev.filter(p => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  const handleWishlistMoveToCart = async (product) => {
    await addToCart(product._id);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser size={16} /> },
    { id: 'orders', label: 'My Orders', icon: <FiPackage size={16} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <FiHeart size={16} /> },
    { id: 'address', label: 'Addresses', icon: <FiMapPin size={16} /> },
    { id: 'password', label: 'Change Password', icon: <FiLock size={16} /> },
  ];

  const statusColors = { pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info', shipped: 'badge-info', out_for_delivery: 'badge-warning', delivered: 'badge-success', cancelled: 'badge-danger' };

  return (
    <div className="container-custom py-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6 tracking-tight">My Account</h1>
      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="card p-5 h-fit md:sticky md:top-28">
          <div className="text-center mb-5 pb-5 border-b border-navy-100">
            <div className="relative w-20 h-20 mx-auto mb-3">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-2 border-brand-200" />
              ) : (
                <div className="w-20 h-20 bg-navy-900 rounded-full flex items-center justify-center border-2 border-brand-300"><span className="text-white font-display font-bold text-2xl">{user?.name?.[0]?.toUpperCase()}</span></div>
              )}
              <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="absolute bottom-0 right-0 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white hover:bg-brand-600 transition shadow-md" title="Change photo">
                <FiCamera size={13} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            <h3 className="font-display font-bold text-ink">{user?.name}</h3>
            <p className="text-sm text-muted break-all">{user?.email}</p>
          </div>
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-cream'}`}
              >
                <span className={activeTab === tab.id ? 'text-brand-600' : 'text-muted'}>{tab.icon}</span> {tab.label}
              </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger-soft transition"><FiLogOut size={16} /> Logout</button>
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="card p-6 md:p-8">
              <h2 className="font-display font-bold text-lg text-ink mb-5">Profile Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field" /></div>
                <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Email</label><input type="email" value={user?.email} className="input-field bg-cream" disabled /></div>
                <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Phone</label><input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="input-field" /></div>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Save Changes'}</button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="card p-6 md:p-8">
              <h2 className="font-display font-bold text-lg text-ink mb-5">My Orders</h2>
              {orders.length === 0 ? (
                <p className="text-muted py-10 text-center text-sm">No orders yet. <Link to="/products" className="text-brand-600 font-semibold hover:underline">Start shopping!</Link></p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <Link key={order._id} to={`/account/orders/${order._id}`} className="block border border-navy-100 rounded-xl p-4 hover:border-brand-300 hover:shadow-md transition group">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-sm font-semibold text-ink">#{order.orderNumber}</span>
                        <span className={`badge ${statusColors[order.status] || 'badge-info'}`}>{order.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                      </div>
                      <p className="text-sm text-muted mb-1.5">{order.items?.length} item(s) · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink font-display">{formatPrice(order.total)}</span>
                        <FiChevronRight className="text-muted group-hover:text-brand-500 transition" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="card p-6 md:p-8">
              <h2 className="font-display font-bold text-lg text-ink mb-5">My Wishlist</h2>
              {wishlist.length === 0 ? (
                <div className="py-10 text-center">
                  <FiHeart size={40} className="text-navy-200 mx-auto mb-3" strokeWidth={1.2} />
                  <p className="text-muted text-sm">Your wishlist is empty. Save products you love for later.</p>
                  <Link to="/products" className="btn-primary mt-5 inline-flex">Browse Products</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map(product => (
                    <div key={product._id} className="flex gap-4 border border-navy-100 rounded-xl p-4">
                      <Link to={`/product/${product.slug}`} className="w-20 h-20 bg-cream rounded-lg overflow-hidden shrink-0 border border-navy-100">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-navy-200"><FiBox size={22} /></div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <Link to={`/product/${product.slug}`} className="font-semibold text-sm text-ink hover:text-brand-600 line-clamp-1 transition">{product.name}</Link>
                        {product.brand && <p className="text-xs text-muted mt-0.5">{product.brand}</p>}
                        <p className="text-[15px] font-bold text-ink mt-1 font-display">{formatPrice(product.discountPrice || product.price)}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 justify-center">
                        <button onClick={() => handleWishlistMoveToCart(product)} className="btn-primary btn-sm"><FiShoppingCart size={13} /> Add to Cart</button>
                        <button onClick={() => handleWishlistRemove(product._id)} className="btn-outline btn-sm text-danger hover:border-danger hover:bg-danger-soft"><FiTrash2 size={13} /> Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'address' && (
            <div className="card p-6 md:p-8">
              <h2 className="font-display font-bold text-lg text-ink mb-5">Saved Addresses</h2>
              {user?.addresses?.length ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {user.addresses.map(addr => (
                    <div key={addr._id} className={`border rounded-xl p-4 ${addr.isDefault ? 'border-brand-400 bg-brand-50' : 'border-navy-100'}`}>
                      <div className="flex items-center justify-between mb-2"><span className="font-semibold text-sm text-ink">{addr.label}</span>{addr.isDefault && <span className="badge badge-success">Default</span>}</div>
                      <p className="text-sm text-ink">{addr.fullName}</p>
                      <p className="text-sm text-muted">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                      <p className="text-sm text-muted">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-muted">{addr.phone}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted text-sm py-6 text-center">No addresses saved yet. Addresses saved during checkout will appear here.</p>}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="card p-6 md:p-8">
              <h2 className="font-display font-bold text-lg text-ink mb-5">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Current Password</label><input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="input-field" required /></div>
                <div><label className="block text-[13px] font-semibold text-ink mb-1.5">New Password</label><input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input-field" required minLength={6} /></div>
                <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Confirm New Password</label><input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="input-field" required /></div>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Changing…' : 'Change Password'}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
