import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import ProductSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { FiFilter, FiX, FiChevronDown, FiChevronLeft, FiChevronRight, FiSearch, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popularity', label: 'Most Popular' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [brands, setBrands] = useState([]);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'newest',
    isNewArrival: searchParams.get('new') || '',
    isFeatured: searchParams.get('featured') || '',
    isBestSeller: searchParams.get('bestseller') || '',
    page: searchParams.get('page') || '1',
  });

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    API.get('/products', { params }).then(r => {
      setProducts(r.data.products);
      setPagination(r.data.pagination);
      const allBrands = [...new Set(r.data.products.map(p => p.brand).filter(Boolean))];
      setBrands(prev => [...new Set([...prev, ...allBrands])]);
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [filters, reloadKey]);

  const updateFilter = (key, value) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: value, page: '1' };
      if (key === 'category') updated.subcategory = '';
      return updated;
    });
  };

  const clearFilters = () => {
    setBrands([]);
    setFilters({ search: '', category: '', subcategory: '', brand: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest', isNewArrival: '', isFeatured: '', isBestSeller: '', page: '1' });
    setSearchParams({});
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && v !== '1' && v !== 'newest' && k !== 'sort').length;

  const selectedCategory = categories.find(cat => cat.slug === filters.category);
  const pageTitle = filters.search
    ? `Search: “${filters.search}”`
    : filters.subcategory
      ? filters.subcategory
      : selectedCategory
        ? selectedCategory.name
        : filters.isBestSeller
          ? 'Best Sellers'
          : filters.isNewArrival
            ? 'New Arrivals'
            : filters.isFeatured
              ? 'Featured Products'
              : 'All Products';

  return (
    <div className="container-custom py-8">
      {/* Page header */}
      <div className="mb-6">
        <nav className="text-[13px] text-muted mb-2 flex items-center gap-1.5">
          <Link to="/" className="hover:text-brand-600 transition">Home</Link>
          <FiChevronRight size={13} />
          <span className="text-ink font-medium">{pageTitle}</span>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">{pageTitle}</h1>
            <p className="text-sm text-muted mt-1">{loading ? 'Loading products…' : `${pagination.total} product${pagination.total === 1 ? '' : 's'} found`}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(true)} className="lg:hidden btn-outline text-sm py-2">
              <FiFilter size={15} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                aria-label="Sort products"
                className="appearance-none bg-white border border-navy-200 rounded-lg text-sm py-2.5 pl-4 pr-10 text-ink focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 outline-none cursor-pointer hover:border-navy-300 transition"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" size={15} />
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {filters.search && <Chip label={`“${filters.search}”`} onClear={() => updateFilter('search', '')} />}
            {filters.category && <Chip label={selectedCategory?.name || filters.category} onClear={() => updateFilter('category', '')} />}
            {filters.subcategory && <Chip label={filters.subcategory} onClear={() => updateFilter('subcategory', '')} />}
            {filters.brand && <Chip label={filters.brand} onClear={() => updateFilter('brand', '')} />}
            {filters.rating && <Chip label={`${filters.rating}★ & up`} onClear={() => updateFilter('rating', '')} />}
            {filters.minPrice && <Chip label={`Min ₹${filters.minPrice}`} onClear={() => updateFilter('minPrice', '')} />}
            {filters.maxPrice && <Chip label={`Max ₹${filters.maxPrice}`} onClear={() => updateFilter('maxPrice', '')} />}
          </div>
        )}
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="card p-5 sticky top-28">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-navy-100">
              <h3 className="font-display font-bold text-lg text-ink">Filters</h3>
              <FiFilter size={16} className="text-brand-500" />
            </div>
            <FilterPanel categories={categories} filters={filters} updateFilter={updateFilter} brands={brands} activeFilterCount={activeFilterCount} clearFilters={clearFilters} />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-navy-950/50" onClick={() => setShowFilters(false)} />
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-navy-100 px-5 py-4 flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-ink">Filters</h3>
                <button onClick={() => setShowFilters(false)} aria-label="Close filters" className="p-2 -mr-2 hover:bg-cream rounded-lg transition"><FiX size={22} /></button>
              </div>
              <div className="p-5"><FilterPanel categories={categories} filters={filters} updateFilter={updateFilter} brands={brands} activeFilterCount={activeFilterCount} clearFilters={clearFilters} /></div>
              <div className="sticky bottom-0 bg-white border-t border-navy-100 p-4">
                <button onClick={() => setShowFilters(false)} className="btn-primary w-full">Show {pagination.total} Products</button>
              </div>
            </div>
          </div>
        )}

        {/* Product grid */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <ProductSkeleton count={12} />
          ) : error ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-danger-soft text-danger flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle size={30} />
              </div>
              <h3 className="font-display text-xl font-bold text-ink mb-2">Couldn't load products</h3>
              <p className="text-muted mb-6 text-sm">Something went wrong while fetching products. Please check your connection and try again.</p>
              <button onClick={() => setReloadKey(k => k + 1)} className="btn-primary inline-flex"><FiRefreshCw size={15} /> Try Again</button>
            </div>
          ) : products.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<FiSearch size={34} strokeWidth={1.3} />}
                title="No products found"
                description="Try adjusting your filters or search for something else."
                actionText="Clear Filters"
                actionPath="/products"
              />
              {activeFilterCount > 0 && (
                <div className="text-center pb-10 -mt-2">
                  <button onClick={clearFilters} className="btn-outline text-sm">Clear All Filters</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => updateFilter('page', String(Math.max(1, Number(filters.page) - 1)))}
                    disabled={Number(filters.page) <= 1}
                    aria-label="Previous page"
                    className="px-3 py-2 rounded-lg bg-white border border-navy-200 text-navy-700 hover:border-navy-400 disabled:opacity-40 disabled:pointer-events-none transition"
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(pg => pagination.pages <= 7 || Math.abs(pg - Number(filters.page)) <= 2 || pg === 1 || pg === pagination.pages)
                    .map((pg, i, arr) => (
                      <span key={pg} className="flex items-center">
                        {i > 0 && arr[i - 1] !== pg - 1 && <span className="text-navy-300 px-1">…</span>}
                        <button
                          onClick={() => updateFilter('page', String(pg))}
                          className={`min-w-[38px] px-3 py-2 rounded-lg text-sm font-medium transition ${Number(filters.page) === pg ? 'bg-navy-900 text-white shadow-md' : 'bg-white text-navy-700 border border-navy-200 hover:border-navy-400'}`}
                        >
                          {pg}
                        </button>
                      </span>
                    ))}
                  <button
                    onClick={() => updateFilter('page', String(Math.min(pagination.pages, Number(filters.page) + 1)))}
                    disabled={Number(filters.page) >= pagination.pages}
                    aria-label="Next page"
                    className="px-3 py-2 rounded-lg bg-white border border-navy-200 text-navy-700 hover:border-navy-400 disabled:opacity-40 disabled:pointer-events-none transition"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Chip({ label, onClear }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-[12.5px] font-medium rounded-full pl-3 pr-1.5 py-1">
      {label}
      <button onClick={onClear} aria-label={`Remove filter ${label}`} className="w-5 h-5 rounded-full hover:bg-brand-200 flex items-center justify-center transition">
        <FiX size={12} />
      </button>
    </span>
  );
}

function FilterPanel({ categories, filters, updateFilter, brands, activeFilterCount, clearFilters }) {
  return (
    <div className="space-y-7">
      {categories.length > 0 && (
        <div>
          <h4 className="font-display font-bold text-[13px] uppercase tracking-[0.12em] text-ink mb-3.5">Category</h4>
          <div className="space-y-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm py-1">
              <input type="radio" name="category" checked={!filters.category} onChange={() => updateFilter('category', '')} className="w-4 h-4 accent-brand-500" />
              <span className="text-ink-soft">All Categories</span>
            </label>
            {categories.map(cat => (
              <div key={cat._id}>
                <label className="flex items-center gap-2.5 cursor-pointer text-sm py-1">
                  <input type="radio" name="category" checked={filters.category === cat.slug} onChange={() => updateFilter('category', cat.slug)} className="w-4 h-4 accent-brand-500" />
                  <span className="text-ink-soft font-medium">{cat.name}</span>
                </label>
                {filters.category === cat.slug && cat.subcategories?.length > 0 && (
                  <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-brand-200 pl-3">
                    {cat.subcategories.map(sub => (
                      <label key={sub.slug} className="flex items-center gap-2 cursor-pointer py-0.5">
                        <input type="radio" name="subcategory" checked={filters.subcategory === sub.name} onChange={() => updateFilter('subcategory', filters.subcategory === sub.name ? '' : sub.name)} className="w-3.5 h-3.5 accent-brand-500" />
                        <span className="text-muted text-[13px] hover:text-ink transition">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-display font-bold text-[13px] uppercase tracking-[0.12em] text-ink mb-3.5">Price Range</h4>
        <div className="flex items-center gap-2">
          <input type="number" min="0" placeholder="Min ₹" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} className="input-field py-2 text-sm" />
          <span className="text-navy-300">—</span>
          <input type="number" min="0" placeholder="Max ₹" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} className="input-field py-2 text-sm" />
        </div>
      </div>

      <div>
        <h4 className="font-display font-bold text-[13px] uppercase tracking-[0.12em] text-ink mb-3.5">Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2, 1].map(r => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer text-sm py-1">
              <input type="radio" name="rating" checked={filters.rating === String(r)} onChange={() => updateFilter('rating', filters.rating === String(r) ? '' : String(r))} className="w-4 h-4 accent-brand-500" />
              <span className="text-amber-400 text-sm tracking-tight">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
              <span className="text-muted text-xs">& up</span>
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h4 className="font-display font-bold text-[13px] uppercase tracking-[0.12em] text-ink mb-3.5">Brand</h4>
          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            {brands.map(b => (
              <label key={b} className="flex items-center gap-2.5 cursor-pointer text-sm py-1">
                <input type="radio" name="brand" checked={filters.brand === b} onChange={() => updateFilter('brand', filters.brand === b ? '' : b)} className="w-4 h-4 accent-brand-500" />
                <span className="text-ink-soft">{b}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="w-full border border-brand-500 text-brand-600 font-semibold py-2.5 rounded-lg hover:bg-brand-50 transition text-sm">
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );
}
