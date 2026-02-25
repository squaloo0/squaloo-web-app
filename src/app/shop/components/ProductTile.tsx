'use client';

import { useState } from 'react';
import { Product } from './ProductGrid';

interface ProductTileProps {
  product: Product;
}

export default function ProductTile({ product }: ProductTileProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Product Image</span>
        </div>
        
        {/* Product Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            product.type === 'digital' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {product.type === 'digital' ? 'DIGITAL' : 'PHYSICAL'}
          </span>
        </div>

        {/* Add to Cart Button */}
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors">
            +
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-gray-900">
          ${product.price}
        </p>
        
        {/* Product Details */}
        <div className="mt-2 space-y-1">
          {product.type === 'digital' && product.digitalDownload && (
            <p className="text-xs text-blue-600">Instant Download</p>
          )}
          {product.type === 'physical' && product.shippingInfo && (
            <p className="text-xs text-gray-500">{product.shippingInfo}</p>
          )}
          {!product.inStock && (
            <p className="text-xs text-red-600">Out of Stock</p>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 