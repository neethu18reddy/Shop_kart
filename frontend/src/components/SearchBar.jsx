import React from 'react';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';

const SearchBar = ({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  onSearchSubmit,
}) => {
  const categories = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

  const handleClearSearch = () => {
    setSearch('');
  };

  return (
    <div className="search-filter-container">
      {/* Search Input */}
      <div className="search-input-wrapper">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search products by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onSearchSubmit) onSearchSubmit();
          }}
          className="search-input"
        />
        {search && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="search-clear-btn"
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="filter-controls-wrapper">
        {/* Category Dropdown */}
        <div className="dropdown-wrapper">
          <Filter size={16} className="dropdown-icon" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Bonus Sorting Dropdown */}
        <div className="dropdown-wrapper">
          <ArrowUpDown size={16} className="dropdown-icon" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
