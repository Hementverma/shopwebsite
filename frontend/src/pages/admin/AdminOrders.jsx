import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import { FiEye, FiSearch, FiFilter, FiShoppingCart } from 'react-icons/fi';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    let active = true;
    const load = () => {
      API.get('/orders/admin').then(r => {
        if (!active) return;
        setOrders(r.data.orders || r.data || []);
        setLoading(false);
      }).catch(() => active && setLoading(false));
    };
    load();
    window.addEventListener('order:new', load);
    return () => { active = false; window.removeEventListener('order:new', load); };
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = o.user?.name?.toLowerCase().includes(search.toLowerCase()) || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Orders</h2>
        <p className="text-sm text-gray-500">{orders.length} orders total</p>
      </div>

      <div className="bg-white rounded border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, order #..." className="input-field pl-10 text-sm" />
        </div>
        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field pl-10 pr-8 min-w-[150px] text-sm">
            <option value="">All Status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded animate-pulse border border-gray-200" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><FiShoppingCart size={40} className="mx-auto mb-3 opacity-50" /><p>No orders found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order._id} className="bg-white rounded border border-gray-200 p-4 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs shrink-0">
                  #{order.orderNumber?.slice(-3)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{order.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{order.user?.email}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">#{order.orderNumber} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-base font-bold text-gray-900">{formatPrice(order.total)}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</span>
                </div>
                <Link to={`/admin/orders/${order._id}`} className="p-2.5 bg-gray-50 hover:bg-green-50 hover:text-green-600 rounded transition text-gray-600">
                  <FiEye size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
