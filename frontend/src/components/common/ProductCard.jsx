import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, getStockStatus } from '../../utils/helpers';
import { FiShoppingCart, FiMessageCircle, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const stock = getStockStatus(product.stock);
  const discount = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login first'); return; }
    if (!stock.available) { toast.error('Product out of stock'); return; }
    await addToCart(product._id);
  };

  const generateWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = '919893369932';
    const price = product.discountPrice || product.price;
    const msg = `Hi! I'm interested in:\n\nProduct: ${product.name}\nPrice: ${formatPrice(price)}\nSKU: ${product.sku || 'N/A'}\n\nPlease provide more details.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Link to={`/product/${product.slug}`} className="card card-hover group flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-cream aspect-square">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-navy-200"><FiZap size={44} strokeWidth={1.2} /></div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-brand-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">{discount}% OFF</span>
        )}
        {!stock.available && (
          <span className="absolute top-3 left-3 bg-navy-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md">Out of Stock</span>
        )}

        {/* Quick Actions */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <button onClick={handleAddToCart} className="bg-white hover:bg-brand-500 hover:text-white text-navy-700 w-9 h-9 rounded-lg flex items-center justify-center shadow-md border border-navy-100 transition" title="Add to Cart">
            <FiShoppingCart size={15} />
          </button>
          <button onClick={generateWhatsApp} className="bg-white hover:bg-[#1fa855] hover:text-white text-navy-700 w-9 h-9 rounded-lg flex items-center justify-center shadow-md border border-navy-100 transition" title="WhatsApp Order">
            <FiMessageCircle size={15} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1">
        {product.brand && <p className="text-[10.5px] text-muted mb-1 font-semibold uppercase tracking-[0.1em]">{product.brand}</p>}
        <h3 className="text-[13.5px] font-semibold text-ink mb-1.5 line-clamp-2 group-hover:text-brand-600 transition leading-snug">{product.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex text-amber-400 text-[13px] leading-none">
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s}>{s <= Math.round(product.rating) ? '★' : '☆'}</span>
            ))}
          </div>
          <span className="text-[11px] text-muted">({product.numReviews || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[17px] font-bold text-ink font-display">{formatPrice(product.discountPrice || product.price)}</span>
          {product.discountPrice > 0 && <span className="text-xs text-muted line-through">{formatPrice(product.price)}</span>}
        </div>

        {/* Stock */}
        <p className={`text-[11px] font-semibold mt-auto ${stock.color}`}>{stock.label}</p>
      </div>
    </Link>
  );
}
