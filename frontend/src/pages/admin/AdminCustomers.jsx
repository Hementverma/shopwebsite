import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { FiUsers, FiSearch, FiMail, FiPhone } from 'react-icons/fi';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/customers').then(r => { setCustomers(r.data.customers || r.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Customers</h2>
        <p className="text-sm text-gray-500">{customers.length} customers total</p>
      </div>

      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="input-field pl-10 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-44 bg-white rounded animate-pulse border border-gray-200" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><FiUsers size={40} className="mx-auto mb-3 opacity-50" /><p>No customers found</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((customer) => (
            <div key={customer._id} className="bg-white rounded border border-gray-200 p-4 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center text-white font-bold text-sm shrink-0">{customer.name?.[0]}</div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{customer.name}</h3>
                  <p className="text-[10px] text-gray-400">Joined {new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600"><FiMail size={12} className="text-gray-400" /> {customer.email}</div>
                {customer.phone && <div className="flex items-center gap-2 text-xs text-gray-600"><FiPhone size={12} className="text-gray-400" /> {customer.phone}</div>}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-500">Orders</span>
                <span className="text-sm font-bold text-gray-900">{customer.orderCount || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
