import Link from 'next/link';
import ShopHeader from '../components/ShopHeader';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
          <p className="text-gray-600 mb-8">Cart functionality coming soon...</p>
          
          <Link 
            href="/shop"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
} 