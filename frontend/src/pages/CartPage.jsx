import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, generateWhatsAppUrl } from '../utils/helpers';
import EmptyState from '../components/common/EmptyState';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiMessageCircle, FiShoppingCart, FiTruck } from 'react-icons/fi';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();
  const deliveryCharge = cartTotal >= 500 ? 0 : 50;
  const total = cartTotal + deliveryCharge;

  if (!cart?.items?.length) {
    return (
      <div className="container-custom py-12">
        <div className="card max-w-2xl mx-auto">
          <EmptyState
            icon={<FiShoppingCart size={34} strokeWidth={1.3} />}
            title="Your cart is empty"
            description="Add some products to your cart to see them here."
            actionText="Start Shopping"
            actionPath="/products"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-brand-600 mb-4 text-sm font-medium transition"><FiArrowLeft size={16} /> Continue Shopping</button>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6 tracking-tight">Shopping Cart <span className="text-muted font-semibold text-lg">({cartCount} item{cartCount === 1 ? '' : 's'})</span></h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => {
            if (!item.product) return null;
            const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
            return (
              <div key={item.product._id} className="card p-4 flex gap-4">
                <Link to={`/product/${item.product.slug}`} className="w-24 h-24 bg-cream rounded-lg overflow-hidden shrink-0 border border-navy-100">
                  {item.product.images?.[0]?.url ? (
                    <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-navy-200"><FiShoppingCart size={22} /></div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/product/${item.product.slug}`} className="font-semibold text-[15px] text-ink hover:text-brand-600 line-clamp-1 transition">{item.product.name}</Link>
                      {item.product.brand && <p className="text-xs text-muted mt-0.5">{item.product.brand}</p>}
                    </div>
                    <button onClick={() => removeItem(item.product._id)} aria-label="Remove item" className="p-2 -mt-1 -mr-1 text-muted hover:text-danger hover:bg-danger-soft rounded-lg transition"><FiTrash2 size={16} /></button>
                  </div>
                  <p className="text-[15px] font-bold text-ink mt-1.5 font-display">{formatPrice(price)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-navy-200 rounded-lg bg-white">
                      <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} aria-label="Decrease quantity" className="px-2.5 py-1.5 hover:bg-cream rounded-l-lg transition text-navy-700"><FiMinus size={14} /></button>
                      <span className="px-3.5 py-1.5 text-sm font-semibold text-ink border-x border-navy-200">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} aria-label="Increase quantity" className="px-2.5 py-1.5 hover:bg-cream rounded-r-lg transition text-navy-700"><FiPlus size={14} /></button>
                    </div>
                    <span className="font-bold text-ink font-display">{formatPrice(price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card p-6 h-fit lg:sticky lg:top-28">
          <h3 className="font-display font-bold text-lg text-ink mb-5">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal ({cartCount} items)</span><span className="font-semibold text-ink">{formatPrice(cartTotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span className={`font-semibold ${deliveryCharge === 0 ? 'text-success' : 'text-ink'}`}>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span></div>
            {deliveryCharge > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-success bg-success-soft rounded-lg px-3 py-2">
                <FiTruck size={13} /> Add items worth {formatPrice(500 - cartTotal)} more for free delivery
              </p>
            )}
            <div className="border-t border-navy-100 pt-3 flex justify-between text-lg font-bold">
              <span className="text-ink">Total</span>
              <span className="text-brand-600 font-display">{formatPrice(total)}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary w-full mt-6 btn-lg">Proceed to Checkout</Link>
          <Link to="/products" className="btn-outline w-full mt-3">Continue Shopping</Link>
          <a
            href={generateWhatsAppUrl('919893369932', cart.items.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.product.discountPrice || i.product.price, subtotal: (i.product.discountPrice || i.product.price) * i.quantity })), total)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full mt-3 text-sm"
          >
            <FiMessageCircle size={15} /> Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
