import React, { useState } from 'react';
import './FilterSortControls.css';

const FilterSortControls = ({
  filters,
  setFilters,
  handleTagFilterChange,
  clearFilters,
  handleSort,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null); // Track which dropdown is active

  const toggleDropdown = (dropdownType) => {
    if (activeDropdown === dropdownType) {
      setActiveDropdown(null); // Close if already open
    } else {
      setActiveDropdown(dropdownType); // Open the clicked dropdown
    }
  };

  return (
    <div className="filter-sort-controls">
      <div className="controls">
        {/* Filter Button */}
        <button className="filter-button" onClick={() => toggleDropdown('filter')}>
        </button>

        {/* Sort Button */}
        <button className="sort-button" onClick={() => toggleDropdown('sort')}>
        </button>
      </div>

      {/* Filter Options - Only show when activeDropdown is 'filter' */}
      {activeDropdown === 'filter' && (
        <div className="filter-options">
          <h3>Filter</h3>
          <div className="filter-tags">
            <label>
              <input
                type="checkbox"
                value="API"
                onChange={handleTagFilterChange}
                checked={filters.tags.includes('API')}
              />{' '}
              API
            </label>
            <label>
              <input
                type="checkbox"
                value="Testing"
                onChange={handleTagFilterChange}
                checked={filters.tags.includes('Testing')}
              />{' '}
              Testing
            </label>
            <label>
              <input
                type="checkbox"
                value="Database"
                onChange={handleTagFilterChange}
                checked={filters.tags.includes('Database')}
              />{' '}
              Database
            </label>
            <label>
              <input
                type="checkbox"
                value="Frontend"
                onChange={handleTagFilterChange}
                checked={filters.tags.includes('Frontend')}
              />{' '}
              Frontend
            </label>
            <label>
              <input
                type="checkbox"
                value="Backend"
                onChange={handleTagFilterChange}
                checked={filters.tags.includes('Backend')}
              />{' '}
              Backend
            </label>
            <label>
              <input
                type="checkbox"
                value="UI/UX"
                onChange={handleTagFilterChange}
                checked={filters.tags.includes('UI/UX')}
              />{' '}
              UI/UX
            </label>
          </div>
          <button className="clear-filters" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Sort Options - Only show when activeDropdown is 'sort' */}
      {activeDropdown === 'sort' && (
        <div className="sort-options">
          <h3>Sort</h3>
          <button className="sort-option" onClick={() => handleSort('urgent-low')}>
            Urgent to Low
          </button>
          <button className="sort-option" onClick={() => handleSort('low-urgent')}>
            Low to Urgent
          </button>
          <button className="sort-option" onClick={() => handleSort('latest-oldest')}>
            Latest to Oldest
          </button>
          <button className="sort-option" onClick={() => handleSort('oldest-latest')}>
            Oldest to Latest
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterSortControls;
