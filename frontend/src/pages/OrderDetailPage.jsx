import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import { formatPrice, generateWhatsAppUrl } from '../utils/helpers';
import { FiArrowLeft, FiPackage, FiCheckCircle, FiMessageCircle, FiShoppingCart, FiMapPin, FiCreditCard } from 'react-icons/fi';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/orders/${id}`).then(r => { setOrder(r.data.order); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="container-custom py-16 text-center">
        <FiPackage size={44} className="text-navy-200 mx-auto mb-4" strokeWidth={1.2} />
        <h2 className="font-display text-xl font-bold text-ink mb-2">Order not found</h2>
        <Link to="/account/orders" className="btn-primary mt-4 inline-flex">Back to Orders</Link>
      </div>
    );
  }

  const statusColors = { pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info', shipped: 'badge-info', out_for_delivery: 'badge-warning', delivered: 'badge-success', cancelled: 'badge-danger' };
  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStep = steps.indexOf(order.status);

  return (
    <div className="container-custom py-8">
      <Link to="/account/orders" className="flex items-center gap-2 text-muted hover:text-brand-600 mb-4 text-sm font-medium transition"><FiArrowLeft size={16} /> Back to Orders</Link>

      <div className="card p-6 md:p-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink tracking-tight">Order #{order.orderNumber}</h1>
            <p className="text-sm text-muted mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`badge ${statusColors[order.status] || 'badge-info'} text-[12px] px-3 py-1`}>{order.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <a href={generateWhatsAppUrl('919893369932', order.items, order.total)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp text-sm py-2"><FiMessageCircle size={15} /> Track via WhatsApp</a>
            )}
          </div>
        </div>

        {/* Status stepper */}
        {order.status !== 'cancelled' && (
          <div className="mb-8 px-1">
            <div className="flex items-start justify-between">
              {steps.map((step, i) => {
                const done = i <= currentStep;
                return (
                  <div key={step} className="flex flex-col items-center flex-1 relative">
                    {i > 0 && (
                      <span className={`absolute top-4 right-1/2 w-full h-0.5 ${done && i <= currentStep ? 'bg-brand-500' : 'bg-navy-100'}`} aria-hidden="true" />
                    )}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${done ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-navy-200 text-muted'}`}>
                      {i < currentStep ? <FiCheckCircle size={15} /> : i + 1}
                    </div>
                    <p className={`text-[11px] mt-2 text-center hidden md:block font-medium ${done ? 'text-ink' : 'text-muted'}`}>{step.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-cream border border-navy-100 p-5">
            <h3 className="font-display font-bold mb-3 flex items-center gap-2 text-ink"><FiMapPin size={16} className="text-brand-500" /> Shipping Address</h3>
            <div className="text-sm text-ink-soft space-y-1">
              <p className="font-semibold text-ink">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p>Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>
          <div className="rounded-xl bg-cream border border-navy-100 p-5">
            <h3 className="font-display font-bold mb-3 flex items-center gap-2 text-ink"><FiCreditCard size={16} className="text-brand-500" /> Payment Info</h3>
            <div className="text-sm text-ink-soft space-y-1">
              <p>Method: <span className="font-semibold text-ink capitalize">{order.paymentMethod}</span></p>
              <p>Status: <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>{order.paymentStatus}</span></p>
              {order.paymentId && <p>Payment ID: {order.paymentId}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 md:p-8">
        <h3 className="font-display font-bold text-lg text-ink mb-5">Order Items</h3>
        <div className="space-y-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-4 pb-4 border-b border-navy-100 last:border-0 last:pb-0">
              <div className="w-16 h-16 bg-cream rounded-lg overflow-hidden shrink-0 border border-navy-100">
                {item.image ? (
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-navy-200"><FiShoppingCart size={18} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-ink">{item.name}</p>
                <p className="text-sm text-muted">Qty: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <span className="font-bold text-ink font-display">{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-navy-100 mt-5 pt-4 space-y-2.5 text-sm max-w-sm ml-auto">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-semibold text-ink">{formatPrice(order.subtotal)}</span></div>
          {order.couponDiscount > 0 && <div className="flex justify-between text-success"><span className="font-medium">Coupon ({order.couponCode})</span><span className="font-semibold">−{formatPrice(order.couponDiscount)}</span></div>}
          <div className="flex justify-between"><span className="text-muted">Delivery</span><span className={`font-semibold ${order.deliveryCharge === 0 ? 'text-success' : 'text-ink'}`}>{order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge)}</span></div>
          {order.tax > 0 && <div className="flex justify-between"><span className="text-muted">GST</span><span className="font-semibold text-ink">{formatPrice(order.tax)}</span></div>}
          <div className="flex justify-between text-lg font-bold border-t border-navy-100 pt-3">
            <span className="text-ink">Total</span>
            <span className="text-brand-600 font-display">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
