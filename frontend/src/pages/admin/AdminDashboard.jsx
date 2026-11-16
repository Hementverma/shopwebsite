import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiDollarSign, FiShoppingCart, FiUsers, FiPackage, FiClock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () => {
      API.get('/dashboard').then(r => {
        if (!active) return;
        setStats(r.data.stats);
        setLoading(false);
      }).catch(() => active && setLoading(false));
    };
    load();
    window.addEventListener('order:new', load);
    return () => { active = false; window.removeEventListener('order:new', load); };
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded animate-pulse border border-gray-200" />)}
    </div>
  );
  if (!stats) return <div className="text-center py-16 text-gray-400">Failed to load dashboard</div>;

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: <FiDollarSign size={20} />, color: 'bg-green-600' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <FiShoppingCart size={20} />, color: 'bg-gray-800' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: <FiUsers size={20} />, color: 'bg-blue-600' },
    { label: 'Total Products', value: stats.totalProducts, icon: <FiPackage size={20} />, color: 'bg-amber-600' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: <FiClock size={20} />, color: 'bg-yellow-600' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: <FiCheckCircle size={20} />, color: 'bg-green-500' },
    { label: 'Low Stock', value: stats.lowStockProducts, icon: <FiAlertTriangle size={20} />, color: 'bg-red-500' },
    { label: 'Out of Stock', value: stats.outOfStockProducts, icon: <FiPackage size={20} />, color: 'bg-gray-500' },
  ];

  const chartData = stats.monthlySales?.map(m => ({ name: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' }), sales: m.total, orders: m.count })) || [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded border border-gray-200 p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-10 h-10 ${card.color} rounded flex items-center justify-center text-white`}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Top Selling */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Monthly Sales</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} formatter={(v) => formatPrice(v)} />
                <Bar dataKey="sales" fill="#2ed241" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-16">No sales data yet</p>}
        </div>

        <div className="bg-white rounded border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Top Selling</h3>
          {stats.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-green-100 text-green-700 rounded flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.totalSold} sold</p>
                  </div>
                  <span className="font-bold text-sm text-gray-700">{formatPrice(p.totalRevenue)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-center py-12">No data yet</p>}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
        {stats.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200">
                <th className="text-left py-3 font-semibold text-gray-500 text-xs uppercase">Order</th>
                <th className="text-left py-3 font-semibold text-gray-500 text-xs uppercase">Customer</th>
                <th className="text-left py-3 font-semibold text-gray-500 text-xs uppercase">Amount</th>
                <th className="text-left py-3 font-semibold text-gray-500 text-xs uppercase">Status</th>
                <th className="text-left py-3 font-semibold text-gray-500 text-xs uppercase">Date</th>
              </tr></thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 font-mono text-xs text-gray-700">{order.orderNumber}</td>
                    <td className="py-3 text-gray-700">{order.user?.name}</td>
                    <td className="py-3 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{order.status}</span></td>
                    <td className="py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-400 text-center py-8">No orders yet</p>}
      </div>
    </div>
  );
}
