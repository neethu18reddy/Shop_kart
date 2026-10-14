import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, AlertTriangle, PackageX, RotateCcw, Loader2 } from 'lucide-react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Filter & Sort State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');

  // Debounced/Triggered fetch products function
  const fetchProductList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category.trim()) params.category = category.trim();
      if (sort) params.sort = sort;

      const response = await getProducts(params);

      if (response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  // Fetch when search, category or sort changes (with lightweight debounce on search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductList();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProductList]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSort('newest');
  };

  return (
    <div className="products-page-container">
      {/* Page Header */}
      <div className="products-page-header">
        <div className="products-page-title-group">
          <div className="products-badge">
            <ShoppingBag size={14} />
            <span>Discover Products</span>
          </div>
          <h1>ShopKart Product Catalogue</h1>
          <p>Browse our curated collection with real-time search and category filtering.</p>
        </div>

        {/* Search, Filter & Sort Bar */}
        <SearchBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          onSearchSubmit={fetchProductList}
        />
      </div>

      {/* Main Content Area: Loading / Error / Empty / Grid States */}
      {loading ? (
        <div className="state-container state-loading">
          <Loader2 size={40} className="spinner-icon" />
          <h3>Loading products...</h3>
          <p>Fetching real-time inventory from MongoDB</p>
        </div>
      ) : error ? (
        <div className="state-container state-error">
          <div className="state-icon-wrapper error">
            <AlertTriangle size={36} />
          </div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchProductList} className="btn-state-action">
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="state-container state-empty">
          <div className="state-icon-wrapper empty">
            <PackageX size={36} />
          </div>
          <h3>No products found</h3>
          <p>We couldn't find any items matching your current search or category filter.</p>
          <button onClick={handleResetFilters} className="btn-state-action">
            <RotateCcw size={16} />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <>
          <div className="products-result-meta">
            <span>Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}</span>
            {category && <span className="active-filter-tag">Category: {category}</span>}
            {search && <span className="active-filter-tag">Search: "{search}"</span>}
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
