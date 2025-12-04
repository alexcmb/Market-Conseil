import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="category-filter">
      <div className="category-tabs">
        <button
          className={`category-tab ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => onCategoryChange(null)}
        >
          <span className="category-icon">🌐</span>
          <span className="category-name">Tous</span>
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
            style={{
              '--category-color': category.color
            }}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
