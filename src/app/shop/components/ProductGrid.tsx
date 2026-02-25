import ProductTile from './ProductTile';

// Product type definition for scalability
export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'physical' | 'digital';
  category: string;
  image: string;
  description?: string;
  tags?: string[];
  inStock: boolean;
  digitalDownload?: boolean;
  shippingInfo?: string;
}

// Mock data for New Hampton Party collection
const products: Product[] = [
  {
    id: 'nhp-001',
    name: 'DEATH TO SECTIONS T-Shirt',
    price: 45,
    type: 'physical',
    category: 'apparel',
    image: '/images/products/nhp-tshirt.jpg',
    description: 'Black t-shirt with 2wo30 manifesto text',
    tags: ['nhp', 'apparel', 'limited'],
    inStock: true,
    shippingInfo: 'Ships in 3-5 business days'
  },
  {
    id: 'nhp-002',
    name: '2wo30 Manifesto Print',
    price: 25,
    type: 'physical',
    category: 'prints',
    image: '/images/products/nhp-manifesto.jpg',
    description: 'High-quality print of the 2wo30 manifesto',
    tags: ['nhp', 'prints', 'manifesto'],
    inStock: true,
    shippingInfo: 'Ships in 3-5 business days'
  },
  {
    id: 'nhp-003',
    name: 'Digital Manifesto PDF',
    price: 5,
    type: 'digital',
    category: 'digital',
    image: '/images/products/nhp-digital.jpg',
    description: 'Complete 2wo30 manifesto in PDF format',
    tags: ['nhp', 'digital', 'manifesto'],
    inStock: true,
    digitalDownload: true
  },
  {
    id: 'nhp-004',
    name: 'Together Hoodie',
    price: 65,
    type: 'physical',
    category: 'apparel',
    image: '/images/products/nhp-hoodie.jpg',
    description: 'Premium hoodie with "Together is the only way"',
    tags: ['nhp', 'apparel', 'hoodie'],
    inStock: true,
    shippingInfo: 'Ships in 3-5 business days'
  },
  {
    id: 'nhp-005',
    name: 'NHP Experience Video',
    price: 15,
    type: 'digital',
    category: 'digital',
    image: '/images/products/nhp-video.jpg',
    description: 'Behind-the-scenes video of the NHP project',
    tags: ['nhp', 'digital', 'video'],
    inStock: true,
    digitalDownload: true
  },
  {
    id: 'nhp-006',
    name: 'Merch is for Memories Sticker Pack',
    price: 12,
    type: 'physical',
    category: 'accessories',
    image: '/images/products/nhp-stickers.jpg',
    description: 'Set of 5 vinyl stickers with 2wo30 messaging',
    tags: ['nhp', 'accessories', 'stickers'],
    inStock: true,
    shippingInfo: 'Ships in 3-5 business days'
  }
];

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductTile key={product.id} product={product} />
      ))}
    </div>
  );
} 