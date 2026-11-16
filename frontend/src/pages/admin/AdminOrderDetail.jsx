import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave, FiMapPin, FiCreditCard, FiClock } from 'react-icons/fi';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    API.get(`/orders/${id}`).then(r => { setOrder(r.data.order); setStatus(r.data.order.status); setTrackingNumber(r.data.order.trackingNumber || ''); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const updateStatus = async () => {
    setUpdating(true);
    try {
      const { data } = await API.put(`/orders/${id}/status`, { status, note, trackingNumber });
      setOrder(data.order); toast.success('Status updated!');
    } catch (error) { toast.error('Failed to update'); }
    setUpdating(false);
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-white rounded animate-pulse border border-gray-200" />)}</div>;
  if (!order) return <div className="text-center py-16 text-gray-400">Order not found</div>;

  const statusColors = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', out_for_delivery: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div className="space-y-5">
      <Link to="/admin/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 text-sm font-medium transition">
        <FiArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded font-semibold ${statusColors[order.status]}`}>{order.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Status Update */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FiClock size={16} className="text-green-600" /> Update Status</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field text-sm">
                  {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="input-field text-sm" placeholder="Courier tracking number" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="input-field text-sm" placeholder="e.g. Order confirmed, will ship today" />
            </div>
            <button onClick={updateStatus} disabled={updating} className="btn-primary flex items-center gap-2 disabled:opacity-50 text-sm">
              <FiSave size={14} /> {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>

          {/* Status History */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Status History</h2>
            <div className="space-y-3">
              {order.statusHistory?.slice().reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-green-600' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium text-sm text-gray-900 capitalize">{h.status?.replace(/_/g, ' ')}</p>
                    {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(h.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                    {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">⚡</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-bold text-sm text-gray-900">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Customer</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-900">{order.user?.name}</p>
              <p className="text-gray-500">{order.user?.email}</p>
              {order.user?.phone && <p className="text-gray-500">{order.user?.phone}</p>}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FiMapPin size={14} className="text-gray-500" /> Shipping</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              {order.shippingAddress?.phone && <p>Phone: {order.shippingAddress.phone}</p>}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FiCreditCard size={14} className="text-gray-500" /> Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium capitalize text-gray-900">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span></div>
              {order.paymentId && <div className="flex justify-between"><span className="text-gray-500">ID</span><span className="text-[10px] font-mono text-gray-600">{order.paymentId}</span></div>}
              <hr className="border-gray-100" />
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-gray-900">{formatPrice(order.subtotal)}</span></div>
              {order.couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-{formatPrice(order.couponDiscount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="text-gray-900">{order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge)}</span></div>
              {order.tax > 0 && <div className="flex justify-between"><span className="text-gray-500">GST</span><span className="text-gray-900">{formatPrice(order.tax)}</span></div>}
              <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2"><span className="text-gray-900">Total</span><span className="text-green-600">{formatPrice(order.total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
