import ProductGrid from './components/ProductGrid';
import ShopHeader from './components/ShopHeader';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Free Shipping Banner */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-gray-900 mb-2">!!!</div>
          <div className="text-red-600 font-semibold text-lg">
            FREE SHIPPING ON ORDERS OVER $250
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid />
      </main>
    </div>
  );
} 