import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave, FiTag } from 'react-icons/fi';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [form, setForm] = useState({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', expiresAt: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = () => { API.get('/coupons').then(r => { setCoupons(r.data.coupons || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { fetchCoupons(); }, []);

  const filtered = coupons.filter(c => c.code?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditCoupon(null); setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', expiresAt: '', isActive: true }); setShowModal(true); };
  const openEdit = (c) => { setEditCoupon(c); setForm({ code: c.code, description: c.description || '', discountType: c.discountType, discountValue: c.discountValue, minOrderAmount: c.minOrderAmount || '', maxDiscount: c.maxDiscount || '', usageLimit: c.usageLimit || '', expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '', isActive: c.isActive }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = { ...form, code: form.code.toUpperCase(), discountValue: Number(form.discountValue), minOrderAmount: Number(form.minOrderAmount) || 0, maxDiscount: Number(form.maxDiscount) || 0, usageLimit: Number(form.usageLimit) || 0 };
      if (editCoupon) { await API.put(`/coupons/${editCoupon._id}`, data); toast.success('Coupon updated!'); }
      else { await API.post('/coupons', data); toast.success('Coupon created!'); }
      setShowModal(false); fetchCoupons();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => { if (!confirm('Delete this coupon?')) return; try { await API.delete(`/coupons/${id}`); toast.success('Deleted!'); fetchCoupons(); } catch { toast.error('Failed'); } };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Coupons</h2>
          <p className="text-sm text-gray-500">{coupons.length} coupons total</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm"><FiPlus /> Add Coupon</button>
      </div>

      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coupons..." className="input-field pl-10 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded animate-pulse border border-gray-200" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><FiTag size={40} className="mx-auto mb-3 opacity-50" /><p>No coupons found</p></div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Code</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Discount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Min Order</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Used</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Expires</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(coupon => (
                  <tr key={coupon._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-4"><span className="font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded text-sm">{coupon.code}</span></td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatPrice(coupon.discountValue)}</td>
                    <td className="py-3 px-4 text-gray-600">{coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{coupon.usedCount || 0}/{coupon.usageLimit || '∞'}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}</td>
                    <td className="py-3 px-4"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{coupon.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEdit(coupon)} className="p-1.5 hover:bg-green-50 hover:text-green-600 rounded transition text-gray-500"><FiEdit2 size={13} /></button>
                        <button onClick={() => handleDelete(coupon._id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition text-gray-500"><FiTrash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">{editCoupon ? 'Edit Coupon' : 'Add Coupon'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded transition"><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Code *</label><input required value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="input-field font-mono uppercase text-sm" placeholder="e.g. SAVE20" /></div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Description</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field text-sm" placeholder="Short description" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Type *</label>
                  <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className="input-field text-sm">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Value *</label><input required type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} className="input-field text-sm" min="0" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Min Order</label><input type="number" value={form.minOrderAmount} onChange={e => setForm({...form, minOrderAmount: e.target.value})} className="input-field text-sm" min="0" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Max Discount</label><input type="number" value={form.maxDiscount} onChange={e => setForm({...form, maxDiscount: e.target.value})} className="input-field text-sm" min="0" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Usage Limit</label><input type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} className="input-field text-sm" min="0" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Expires *</label><input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} className="input-field text-sm" required /></div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-600' : 'bg-gray-300'}`} onClick={() => setForm({...form, isActive: !form.isActive})}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 px-4 border border-gray-300 rounded font-semibold text-gray-600 hover:bg-gray-50 transition text-sm">Cancel</button>
                <button disabled={saving} type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"><FiSave size={14} /> {saving ? 'Saving...' : editCoupon ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
