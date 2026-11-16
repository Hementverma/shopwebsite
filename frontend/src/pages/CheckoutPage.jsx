import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiMessageCircle, FiTag, FiShoppingCart } from 'react-icons/fi';

const paymentOptions = [
  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: <FiShoppingCart size={18} /> },
  { value: 'razorpay', label: 'Online Payment (Razorpay)', desc: 'UPI, Cards, Net Banking, Wallets', icon: <FiCreditCard size={18} /> },
  { value: 'whatsapp', label: 'WhatsApp Order', desc: 'Place your order via WhatsApp', icon: <FiMessageCircle size={18} /> },
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [form, setForm] = useState({
    fullName: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
    paymentMethod: 'cod', notes: ''
  });

  useEffect(() => {
    if (!cart?.items?.length) navigate('/cart');
    if (user?.addresses?.length) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      if (def) setForm(prev => ({ ...prev, fullName: def.fullName, phone: def.phone, addressLine1: def.addressLine1, addressLine2: def.addressLine2 || '', city: def.city, state: def.state, pincode: def.pincode }));
    }
  }, []);

  const deliveryCharge = cartTotal >= 500 ? 0 : 50;
  const tax = Math.round(cartTotal * 0.18);
  const total = cartTotal - couponDiscount + deliveryCharge + tax;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await API.post('/coupons/validate', { code: couponCode, subtotal: cartTotal });
      setCouponDiscount(data.coupon.discount);
      setAppliedCoupon(data.coupon.code);
      toast.success(`Coupon applied! You save ${formatPrice(data.coupon.discount)}`);
    } catch (error) { toast.error(error.response?.data?.message || 'Invalid coupon'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields'); return;
    }
    setLoading(true);
    try {
      const orderData = {
        shippingAddress: { fullName: form.fullName, phone: form.phone, email: form.email, addressLine1: form.addressLine1, addressLine2: form.addressLine2, city: form.city, state: form.state, pincode: form.pincode },
        paymentMethod: form.paymentMethod, couponCode: appliedCoupon || undefined, notes: form.notes
      };

      if (form.paymentMethod === 'razorpay') {
        const { data: razorpayOrder } = await API.post('/payments/create-order', { amount: total });
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
          amount: razorpayOrder.order.amount, currency: 'INR', name: 'OM Electrical & Hardware',
          description: 'Order Payment', order_id: razorpayOrder.order.id,
          handler: async (response) => {
            try {
              await API.post('/payments/verify', response);
              orderData.paymentId = response.razorpay_payment_id;
              orderData.razorpayOrderId = response.razorpay_order_id;
              const { data } = await API.post('/orders', orderData);
              await clearCart();
              toast.success('Order placed successfully!');
              navigate(`/account/orders/${data.order._id}`);
            } catch { toast.error('Payment verification failed'); }
          },
          prefill: { name: form.fullName, email: form.email, contact: form.phone },
          theme: { color: '#f97316' }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const { data } = await API.post('/orders', orderData);
        await clearCart();
        toast.success('Order placed successfully!');
        navigate(`/account/orders/${data.order._id}`);
      }
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to place order'); }
    setLoading(false);
  };

  if (!cart?.items?.length) return null;

  const inputClass = 'input-field';

  return (
    <div className="container-custom py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-brand-600 mb-4 text-sm font-medium transition"><FiArrowLeft size={16} /> Back</button>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6 tracking-tight">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-ink mb-5 flex items-center gap-2.5"><FiMapPin size={18} className="text-brand-500" /> Shipping Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Full Name *</label><input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} required /></div>
                <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Phone *</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} required /></div>
                <div className="md:col-span-2"><label className="block text-[13px] font-semibold text-ink mb-1.5">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></div>
                <div className="md:col-span-2"><label className="block text-[13px] font-semibold text-ink mb-1.5">Address Line 1 *</label><input type="text" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} className={inputClass} required placeholder="House no., Street, Area" /></div>
                <div className="md:col-span-2"><label className="block text-[13px] font-semibold text-ink mb-1.5">Address Line 2</label><input type="text" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} className={inputClass} placeholder="Landmark, Colony" /></div>
                <div><label className="block text-[13px] font-semibold text-ink mb-1.5">City *</label><input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} required /></div>
                <div><label className="block text-[13px] font-semibold text-ink mb-1.5">State *</label><input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass} required /></div>
                <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Pincode *</label><input type="text" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className={inputClass} required /></div>
              </div>
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-ink mb-5 flex items-center gap-2.5"><FiCreditCard size={18} className="text-brand-500" /> Payment Method</h2>
              <div className="space-y-3">
                {paymentOptions.map(opt => (
                  <label key={opt.value} className={`flex items-start gap-3.5 p-4 border-2 rounded-xl cursor-pointer transition ${form.paymentMethod === opt.value ? 'border-brand-500 bg-brand-50' : 'border-navy-100 hover:border-navy-300 bg-white'}`}>
                    <input type="radio" name="payment" value={opt.value} checked={form.paymentMethod === opt.value} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="accent-brand-500 mt-1" />
                    <span className={`mt-0.5 ${form.paymentMethod === opt.value ? 'text-brand-600' : 'text-muted'}`}>{opt.icon}</span>
                    <div>
                      <p className="font-semibold text-ink text-[15px]">{opt.label}</p>
                      <p className="text-sm text-muted">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg text-ink mb-4">Order Notes (Optional)</h2>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field resize-y" rows="3" placeholder="Special instructions for delivery…" />
            </div>
          </div>

          {/* Summary */}
          <div className="card p-6 h-fit lg:sticky lg:top-28">
            <h2 className="font-display font-bold text-lg text-ink mb-4">Order Summary</h2>
            <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1">
              {cart.items.map(item => item.product && (
                <div key={item.product._id} className="flex items-center gap-3 text-sm">
                  <div className="w-12 h-12 bg-cream rounded-lg overflow-hidden shrink-0 border border-navy-100">
                    {item.product.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-navy-200"><FiShoppingCart size={15} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-xs truncate text-ink font-medium">{item.product.name}</p><p className="text-xs text-muted">Qty: {item.quantity}</p></div>
                  <span className="font-semibold text-xs text-ink">{formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-ink mb-1.5">Coupon Code</label>
              <div className="flex gap-2">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="e.g. WELCOME10" className="input-field text-sm py-2" />
                <button type="button" onClick={applyCoupon} className="btn-outline text-sm py-2 whitespace-nowrap"><FiTag size={14} /> Apply</button>
              </div>
              {appliedCoupon && <p className="text-xs text-success font-medium mt-1.5">Coupon {appliedCoupon} applied! −{formatPrice(couponDiscount)}</p>}
            </div>

            <div className="space-y-2.5 text-sm border-t border-navy-100 pt-4">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-semibold text-ink">{formatPrice(cartTotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">GST (18%)</span><span className="font-semibold text-ink">{formatPrice(tax)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Delivery</span><span className={`font-semibold ${deliveryCharge === 0 ? 'text-success' : 'text-ink'}`}>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span></div>
              {couponDiscount > 0 && <div className="flex justify-between text-success"><span className="font-medium">Coupon Discount</span><span className="font-semibold">−{formatPrice(couponDiscount)}</span></div>}
              <div className="flex justify-between text-lg font-bold border-t border-navy-100 pt-3">
                <span className="text-ink">Total</span>
                <span className="text-brand-600 font-display">{formatPrice(total)}</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-6 btn-lg">
              {loading ? 'Placing Order…' : form.paymentMethod === 'razorpay' ? `Pay ${formatPrice(total)}` : 'Place Order'}
            </button>
            <p className="text-[11.5px] text-muted text-center mt-3 leading-relaxed">By placing this order you agree to our store policies. Need help? Call +91 98933 69932.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
