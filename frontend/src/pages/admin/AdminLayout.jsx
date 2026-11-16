import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../../utils/api';
import { playOrderSiren, stopOrderSiren, unlockAudio } from '../../utils/notify';
import { formatPrice } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiPackage, FiShoppingCart, FiUsers, FiTag, FiMenu, FiX, FiArrowLeft, FiLogOut, FiBell } from 'react-icons/fi';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const latestOrderId = useRef(undefined);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const { data } = await API.get('/orders/admin/notifications');
        if (!active) return;
        const latest = data.latest?.id || null;
        if (latestOrderId.current === undefined) {
          latestOrderId.current = latest;
        } else if (latest && latest !== latestOrderId.current) {
          latestOrderId.current = latest;
          playOrderSiren();
          setNewOrderCount(c => c + 1);
          setPendingOrder(data.latest);
          toast.success(`New order #${data.latest.orderNumber} - ${formatPrice(data.latest.total)}`, { duration: 8000 });
          window.dispatchEvent(new CustomEvent('order:new', { detail: data.latest }));
        }
      } catch (e) { /* ignore polling errors */ }
    };
    check();
    const id = setInterval(check, 8000);
    return () => { active = false; clearInterval(id); };
  }, []);

  const links = [
    { to: '/admin', icon: <FiGrid size={18} />, label: 'Dashboard', exact: true },
    { to: '/admin/products', icon: <FiPackage size={18} />, label: 'Products' },
    { to: '/admin/orders', icon: <FiShoppingCart size={18} />, label: 'Orders' },
    { to: '/admin/customers', icon: <FiUsers size={18} />, label: 'Customers' },
    { to: '/admin/coupons', icon: <FiTag size={18} />, label: 'Coupons' },
  ];

  const isActive = (path, exact) => exact ? location.pathname === '/admin' : location.pathname.startsWith(path) && location.pathname !== '/admin';

  const Sidebar = () => (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">⚡</span>
          </div>
          <div>
            <h2 className="font-bold text-sm text-white">Om Electrical</h2>
            <p className="text-[11px] text-gray-400">Admin Panel</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(link => {
          const active = isActive(link.to, link.exact);
          return (
            <Link key={link.to} to={link.to} className={`flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition ${active ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              {link.icon} {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link to="/" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded transition">
          <FiArrowLeft size={16} /> Back to Store
        </Link>
        <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-400 rounded transition w-full">
          <FiLogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  const handleOrderAction = async (status) => {
    if (!pendingOrder) return;
    setActionLoading(true);
    try {
      await API.put(`/orders/${pendingOrder.id}/status`, {
        status,
        note: status === 'confirmed' ? 'Order accepted by admin' : 'Order declined by admin'
      });
      toast.success(status === 'confirmed' ? `Order #${pendingOrder.orderNumber} accepted` : `Order #${pendingOrder.orderNumber} declined`);
      stopOrderSiren();
      setPendingOrder(null);
      window.dispatchEvent(new CustomEvent('order:new'));
    } catch (e) {
      toast.error('Failed to update order');
    }
    setActionLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:block"><Sidebar /></div>
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden"><Sidebar /></div>
        </>
      )}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded transition"><FiMenu size={20} /></button>
            <h1 className="text-lg font-bold text-gray-900">
              {links.find(l => isActive(l.to, l.exact))?.label || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { stopOrderSiren(); setNewOrderCount(0); navigate('/admin/orders'); }}
              className="p-2 hover:bg-gray-100 rounded transition relative"
              title={newOrderCount > 0 ? `${newOrderCount} new order(s)` : 'No new orders'}
            >
              <FiBell size={18} className={newOrderCount > 0 ? 'text-red-500' : 'text-gray-600'} />
              {newOrderCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {newOrderCount > 9 ? '9+' : newOrderCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6"><Outlet /></main>
      </div>

      {pendingOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-green-600 px-5 py-4 flex items-center gap-3">
              <FiBell className="text-white" size={22} />
              <h3 className="text-white font-bold">New Order Received!</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order #</span>
                <span className="font-mono font-semibold text-gray-900">{pendingOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-900">{formatPrice(pendingOrder.total)}</span>
              </div>
              <p className="text-gray-600 text-sm pt-1">Do you want to accept this order?</p>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => handleOrderAction('confirmed')}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleOrderAction('cancelled')}
                  disabled={actionLoading}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
