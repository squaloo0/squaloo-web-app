import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

// Blog post data
const blogPosts = [
  {
    title: "From Go Board to Grad School: Crafting a Custom QR Code and My Iovine & Young Application Story",
    excerpt: "The journey to apply to the USC Iovine and Young Academy's MS in Integrated Design, Business, and Technology program wasn't just about writing essays; it was about building a tangible representation of my passion for innovation.",
    date: "March 10, 2024",
    readTime: "8 min read",
    slug: "go-board-to-grad-school",
    authors: "Marshal, Aether"
  }
];

export default function BlogPage() {
  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-12">
          <h1 className="text-4xl font-bold mb-6">Blog</h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl">
            Thoughts, insights, and stories from my journey in technology, design, and innovation.
          </p>
          
          <div className="space-y-8">
            {blogPosts.map((post, index) => (
              <article key={index} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition">
                <div className="mb-2 text-gray-400 text-sm flex items-center justify-between">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-2xl font-semibold mb-3">
                  <Link href={`/marshal-qr/blog/${post.slug}`} className="hover:text-blue-400 transition">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-400 text-sm mb-3">By {post.authors}</p>
                <p className="text-gray-300 mb-4">{post.excerpt}</p>
                <Link 
                  href={`/marshal-qr/blog/${post.slug}`} 
                  className="text-blue-400 hover:text-blue-300 transition inline-flex items-center"
                >
                  Read more
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
          
          {/* Featured section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2">✨</span>
              Featured Project
            </h2>
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">QR Code Component</h3>
              <p className="text-gray-200 mb-4">
                Explore the interactive QR code component that visualizes the encoding process from data to final matrix.
              </p>
              <Link 
                href="/marshal-qr/work/qr-code-component" 
                className="bg-white text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition inline-flex items-center"
              >
                View Project
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 