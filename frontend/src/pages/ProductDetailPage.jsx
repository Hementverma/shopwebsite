import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getStockStatus, generateWhatsAppUrl } from '../utils/helpers';
import StarRating from '../components/common/StarRating';
import ProductCard from '../components/common/ProductCard';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiShoppingCart, FiMessageCircle, FiTruck, FiShield, FiChevronRight, FiZap, FiPackage, FiCheckCircle } from 'react-icons/fi';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    setActiveImage(0);
    API.get(`/products/${slug}`).then(r => {
      setProduct(r.data.product);
      setRelated(r.data.related);
      setLoading(false);
    }).catch(() => { setLoading(false); toast.error('Product not found'); navigate('/products'); });
  }, [slug]);

  useEffect(() => {
    if (product) {
      API.get(`/reviews/product/${product._id}`).then(r => setReviews(r.data.reviews)).catch(() => {});
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); return; }
    for (let i = 0; i < quantity; i++) {
      await addToCart(product._id, 1);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { toast.error('Please login first'); return; }
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await API.post(`/reviews/product/${product._id}`, reviewForm);
      setReviews([data.review, ...reviews]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to submit review'); }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="skeleton h-4 w-48 mb-6" />
          <div className="grid md:grid-cols-2 gap-10">
            <div className="skeleton aspect-square rounded-xl" />
            <div className="space-y-4">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-5 w-32" />
              <div className="skeleton h-10 w-48" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!product) return null;

  const stock = getStockStatus(product.stock);
  const price = product.discountPrice || product.price;
  const discount = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const categoryName = product.category?.name;

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="text-[13px] text-muted mb-6 flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-brand-600 transition">Home</Link>
        <FiChevronRight size={13} />
        {categoryName && (
          <>
            <Link to={`/products?category=${product.category?.slug}`} className="hover:text-brand-600 transition">{categoryName}</Link>
            <FiChevronRight size={13} />
          </>
        )}
        <span className="text-ink font-medium line-clamp-1 max-w-[240px]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-14">
        {/* Gallery */}
        <div>
          <div className="card bg-white aspect-square flex items-center justify-center overflow-hidden border border-navy-100">
            {product.images?.[activeImage]?.url ? (
              <img src={product.images[activeImage].url} alt={product.name} className="w-full h-full object-contain p-6 transition-opacity duration-300" />
            ) : (
              <span className="text-navy-200"><FiZap size={80} strokeWidth={1.1} /></span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`w-[70px] h-[70px] rounded-lg border-2 overflow-hidden shrink-0 transition ${activeImage === i ? 'border-brand-500 shadow-md' : 'border-navy-100 hover:border-navy-300'}`}
                >
                  <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover bg-cream" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-brand-600 mb-2">{product.brand}</p>}
          <h1 className="font-display text-2xl md:text-[2rem] font-bold text-ink tracking-tight mb-3 leading-tight">{product.name}</h1>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <StarRating rating={product.rating} readonly size="sm" />
            <span className="text-[13px] text-muted">{product.numReviews || 0} review{product.numReviews === 1 ? '' : 's'}</span>
            <span className="w-1 h-1 rounded-full bg-navy-300" />
            <span className="text-[13px] text-muted">{product.sold || 0} sold</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3 mb-3">
            <span className="font-display text-[2rem] font-extrabold text-ink">{formatPrice(price)}</span>
            {discount > 0 && (
              <>
                <span className="text-base text-muted line-through">{formatPrice(product.price)}</span>
                <span className="badge badge-danger text-[12px]">{discount}% OFF</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${stock.color}`}>
              {stock.available ? <FiCheckCircle size={14} /> : null}
              {stock.label}
            </span>
            {product.sku && <span className="text-[13px] text-muted">SKU: {product.sku}</span>}
          </div>

          <p className="text-[14.5px] text-ink-soft leading-relaxed mb-7">
            {product.shortDescription || product.description?.substring(0, 220)}
          </p>

          {/* Quantity + Actions */}
          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm font-semibold text-ink">Quantity</span>
            <div className="flex items-center border border-navy-200 rounded-lg bg-white">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" className="px-3.5 py-2.5 hover:bg-cream rounded-l-lg transition text-navy-700"><FiMinus size={15} /></button>
              <span className="px-5 py-2.5 font-semibold text-ink border-x border-navy-200 min-w-[54px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))} aria-label="Increase quantity" className="px-3.5 py-2.5 hover:bg-cream rounded-r-lg transition text-navy-700"><FiPlus size={15} /></button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-7">
            <button onClick={handleAddToCart} disabled={!stock.available} className="btn-primary btn-lg flex-1 sm:flex-none min-w-[160px]">
              <FiShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={!stock.available} className="btn-secondary btn-lg flex-1 sm:flex-none min-w-[130px]">
              Buy Now
            </button>
            <a
              href={generateWhatsAppUrl('919893369932', [{ name: product.name, quantity, price, subtotal: price * quantity }], price * quantity)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp btn-lg flex-1 sm:flex-none min-w-[150px]"
            >
              <FiMessageCircle size={18} /> WhatsApp Order
            </a>
          </div>

          <div className="rounded-xl border border-navy-100 bg-cream divide-y divide-navy-100">
            <div className="flex items-center gap-3 text-[13.5px] px-4 py-3"><FiTruck className="text-brand-500 shrink-0" /><span className="text-ink-soft">Free delivery on orders above ₹500</span></div>
            <div className="flex items-center gap-3 text-[13.5px] px-4 py-3"><FiShield className="text-brand-500 shrink-0" /><span className="text-ink-soft">Genuine products from trusted brands</span></div>
            <div className="flex items-center gap-3 text-[13.5px] px-4 py-3"><FiPackage className="text-brand-500 shrink-0" /><span className="text-ink-soft">Call or WhatsApp for bulk requirements</span></div>
          </div>

          {product.specifications?.length > 0 && (
            <div className="mt-7">
              <h3 className="font-display font-bold text-lg text-ink mb-3">Specifications</h3>
              <div className="rounded-xl border border-navy-100 overflow-hidden divide-y divide-navy-100">
                {product.specifications.map((spec, i) => (
                  <div key={i} className={`grid grid-cols-2 text-sm ${i % 2 === 0 ? 'bg-cream/60' : 'bg-white'}`}>
                    <span className="px-4 py-2.5 text-muted font-medium">{spec.key}</span>
                    <span className="px-4 py-2.5 text-ink font-semibold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="card p-6 md:p-8 mb-12">
        <h2 className="font-display text-xl font-bold text-ink mb-4">Product Description</h2>
        <div className="text-ink-soft leading-relaxed whitespace-pre-line text-[15px]">{product.description}</div>
      </div>

      {/* Reviews */}
      <div className="mb-12">
        <h2 className="section-title mb-6">Customer Reviews ({reviews.length})</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {reviews.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-muted text-sm">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {reviews.map(review => (
                  <div key={review._id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-navy-900 rounded-full flex items-center justify-center text-sm font-bold text-white">{review.user?.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <p className="font-semibold text-sm text-ink">{review.user?.name}</p>
                          <p className="text-[11px] text-muted">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} readonly size="sm" />
                    </div>
                    {review.title && <p className="font-semibold text-sm mb-1 text-ink">{review.title}</p>}
                    <p className="text-sm text-ink-soft">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-display font-bold text-lg text-ink mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Rating</label>
                  <StarRating rating={reviewForm.rating} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Title (optional)</label>
                  <input type="text" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} className="input-field" placeholder="Summarize your review" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Review</label>
                  <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} className="input-field resize-y" rows="4" placeholder="Tell others about your experience" required />
                </div>
                <button type="submit" disabled={submittingReview} className="btn-primary w-full">{submittingReview ? 'Submitting…' : 'Submit Review'}</button>
              </form>
            ) : (
              <p className="text-sm text-muted"><Link to="/login" className="text-brand-600 font-semibold hover:underline">Login</Link> to write a review</p>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <div className="flex items-end justify-between mb-6">
            <h2 className="section-title">Related Products</h2>
            <Link to="/products" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{related.map(p => <ProductCard key={p._id} product={p} />)}</div>
        </div>
      )}
    </div>
  );
}
