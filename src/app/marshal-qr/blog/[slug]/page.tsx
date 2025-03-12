import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// This would typically come from a database or CMS
const blogPosts = {
  "getting-started-nextjs-tailwind": {
    title: "Getting Started with Next.js and Tailwind",
    date: "June 15, 2023",
    readTime: "5 min read",
    content: `
      <p>Next.js and Tailwind CSS have become an increasingly popular combination for building modern web applications. In this post, we'll explore how to set up a new project with these technologies.</p>
      
      <h2>Setting Up Your Project</h2>
      <p>First, let's create a new Next.js project with the following command:</p>
      <pre><code>npx create-next-app my-project</code></pre>
      
      <p>Next, let's add Tailwind CSS to our project:</p>
      <pre><code>npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p</code></pre>
      
      <h2>Configuring Tailwind</h2>
      <p>Now, we need to configure Tailwind by updating the tailwind.config.js file:</p>
      <pre><code>module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}</code></pre>
      
      <h2>Creating Your First Component</h2>
      <p>Let's create a simple component using Tailwind classes:</p>
      <pre><code>export default function Button({ children }) {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
      {children}
    </button>
  );
}</code></pre>
      
      <p>And that's it! You now have a Next.js project with Tailwind CSS set up and ready to go.</p>
    `
  }
};

// Generate static params for all blog posts
export async function generateStaticParams() {
  return Object.keys(blogPosts).map(slug => ({ slug }));
}

// Following the solution from Stack Overflow
export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params;
  const slug = params.slug;
  const post = blogPosts[slug];
  
  if (!post) {
    notFound();
  }
  
  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto">
        <article className="py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center text-gray-400 text-sm">
              <span>{post.date}</span>
              <span className="mx-2">•</span>
              <span>{post.readTime}</span>
            </div>
          </div>
          
          <div 
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <div className="mt-12 pt-8 border-t border-gray-800">
            <Link href="/marshal-qr/blog/" className="text-blue-400 hover:text-blue-300 inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all posts
            </Link>
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
} 