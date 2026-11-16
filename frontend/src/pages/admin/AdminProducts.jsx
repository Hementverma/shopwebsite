import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave, FiPackage } from 'react-icons/fi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: '', subcategory: '', sku: '', brand: '', unit: 'piece', features: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const loadData = async () => {
    try {
      const [p, c] = await Promise.all([API.get('/products'), API.get('/categories')]);
      setProducts(p.data.products || p.data || []);
      setCategories(c.data.categories || c.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditProduct(null); setForm({ name: '', description: '', price: '', stock: '', category: '', subcategory: '', sku: '', brand: '', unit: 'piece', features: '' }); setImageFile(null); setError(''); setShowModal(true); };
  const openEdit = (p) => { setEditProduct(p); setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, category: p.category?._id || '', subcategory: p.subcategory || '', sku: p.sku || '', brand: p.brand || '', unit: p.unit || 'piece', features: p.features?.join(', ') || '' }); setImageFile(null); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k === 'features') fd.append('features', v); else if (v !== '') fd.append(k, v); });
      if (imageFile) fd.append('images', imageFile);
      if (editProduct) { await API.put(`/products/${editProduct._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); }
      else { await API.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); }
      setShowModal(false); loadData();
    } catch (e) { setError(e.response?.data?.message || 'Error saving product'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await API.delete(`/products/${id}`); loadData(); } catch (e) { alert('Error deleting product'); }
  };

  const getSubcategories = () => {
    const cat = categories.find(c => c._id === form.category);
    return cat?.subcategories || [];
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">{products.length} products total</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm"><FiPlus /> Add Product</button>
      </div>

      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-10 text-sm" />
        </div>
      </div>

      {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white rounded animate-pulse border border-gray-200" />)}</div> : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><FiPackage size={40} className="mx-auto mb-3 opacity-50" /><p>No products found</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => (
            <div key={product._id} className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition group">
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                {product.images?.[0]?.url ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><FiPackage size={36} /></div>}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEdit(product)} className="p-1.5 bg-white rounded shadow hover:bg-green-50 hover:text-green-600 transition"><FiEdit2 size={13} /></button>
                  <button onClick={() => handleDelete(product._id)} className="p-1.5 bg-white rounded shadow hover:bg-red-50 hover:text-red-600 transition"><FiTrash2 size={13} /></button>
                </div>
                {product.stock < 5 && <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-semibold">Low Stock</div>}
              </div>
              <div className="p-3">
                <p className="text-[10px] text-gray-400 font-mono">{product.sku || 'N/A'}</p>
                <h3 className="font-medium text-sm text-gray-900 mt-0.5 truncate">{product.name}</h3>
                <p className="text-[10px] text-gray-500">{product.category?.name} {product.subcategory ? `/ ${product.subcategory}` : ''}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{product.stock} in stock</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">{editProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded transition"><FiX size={18} /></button>
            </div>
            {error && <div className="mx-5 mt-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-sm font-medium text-gray-700 mb-1 block">Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" /></div>
                <div className="col-span-2"><label className="text-sm font-medium text-gray-700 mb-1 block">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field resize-none" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Price *</label><input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Stock *</label><input required type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="input-field" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">SKU</label><input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="input-field" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Brand</label><input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="input-field" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
                  <select required value={form.category} onChange={e => setForm({...form, category: e.target.value, subcategory: ''})} className="input-field">
                    <option value="">Select</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Subcategory</label>
                  <select value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})} className="input-field" disabled={!form.category}>
                    <option value="">Select</option>
                    {getSubcategories().map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Unit</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="input-field">
                    {['piece','kg','meter','box','set','pair','liter','roll','bundle','can'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Image</label><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="input-field text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-green-50 file:text-green-700 file:font-semibold file:text-xs" /></div>
                <div className="col-span-2"><label className="text-sm font-medium text-gray-700 mb-1 block">Features (comma separated)</label><input value={form.features} onChange={e => setForm({...form, features: e.target.value})} className="input-field" placeholder="ISI certified, Copper winding, etc." /></div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 px-4 border border-gray-300 rounded font-semibold text-gray-600 hover:bg-gray-50 transition text-sm">Cancel</button>
                <button disabled={saving} type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"><FiSave size={14} /> {saving ? 'Saving...' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
