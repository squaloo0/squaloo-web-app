import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function BlogPostPage() {
  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="py-12">
          <div className="mb-8">
            <Link href="/marshal-qr/blog" className="text-blue-400 hover:text-blue-300 transition inline-flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">From Go Board to Grad School: Crafting a Custom QR Code and My Iovine & Young Application Story</h1>
            <div className="flex items-center text-gray-400 text-sm mb-6">
              <span>March 10, 2024</span>
              <span className="mx-2">•</span>
              <span>8 min read</span>
              <span className="mx-2">•</span>
              <span>By Marshal, Aether</span>
            </div>
          </div>
          
          <div className="prose prose-lg prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Introduction</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The journey to apply to the USC Iovine and Young Academy's MS in Integrated Design, Business, and Technology program wasn't just about writing essays; it was about building a tangible representation of my passion for innovation. For my portfolio, I decided to create a custom QR code, not just any QR code, but one physically encoded on a hand-crafted go board. This project became a microcosm of my approach to problem-solving, blending technical ingenuity with a touch of artistic flair.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">The Quest for the Perfect Matrix</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              It started with a vision: a 25x25 matrix, meticulously carved into a wooden board. But finding someone to bring this vision to life proved more challenging than expected. I visited numerous small engravers, each with their own reasons for declining. Just when I was about to give up, one kind soul pointed me towards Mahesh, a local craftsman with a CNC router. Mahesh's willingness to take on my unconventional project was the first of many serendipitous moments.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Encoding the Digital into the Physical</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              With the go board in hand, the real challenge began: encoding my data. I needed to generate codewords using Reed-Solomon error correction, a mathematical concept that, to be honest, felt like navigating a labyrinth. My math skills, honed through years of self-teaching and a healthy dose of persistence, were put to the ultimate test.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Fortunately, my background in full-stack development came to the rescue. I turned to Python, finding its English-like syntax made complex polynomial long division and Galois field calculations surprisingly accessible. With the help of an LLM to refine my code and add error logging, I developed a suite of functions that could accurately encode my data.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              However, printing the binary strings and manually placing the bits on the board proved to be an exercise in futility. It would have taken days! I needed a more efficient solution.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Visualizing the Encoding Process</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              That's when I decided to build a visualizer. I taught myself React and Next.js, and after a brief (and frustrating) detour into WordPress theme development, I created a component that could map the encoding phases onto the matrix. I integrated a database using Neon and Drizzle, allowing me to store and retrieve the data for each phase.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The visualizer not only accelerated the encoding process but also revealed a critical flaw: my initial URL was too long for the selected QR code configuration. I had chosen a V2 QR code with M error correction and masking pattern 3. Instead of panicking, I reverse-engineered a working code, refining my Python functions to accommodate a shorter URL and byte encoding.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">The Application Journey</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              This project became more than just a portfolio piece; it became a metaphor for my application journey. Each challenge, each setback, was an opportunity to learn and grow. The essays, the portfolio, the entire application process, was a reflection of my passion for integrated design, business, and technology.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              I wrote about failure, not as a deterrent, but as a mirror reflecting my relationship with myself. I shared my entrepreneurial ventures, the highs and lows, and the lessons learned along the way. I articulated my vision for the future, a future where technology empowers individuals and fosters collaboration.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Looking Ahead</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Submitting my application was a moment of culmination, a testament to the countless hours of work, the late nights, and the unwavering belief in my vision. I'm excited about the possibility of joining the Iovine and Young Academy, a community of innovators and dreamers.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              This project, this application, has reinforced my belief in the power of interdisciplinary thinking and the transformative potential of technology. I'm eager to continue my journey, to learn, to collaborate, and to contribute to a world where innovation knows no bounds.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Conclusion</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              From a simple go board to a complex QR code, this project has been a journey of discovery. And just like the QR code itself, it represents a bridge between the physical and the digital, the tangible and the abstract. It's a testament to the power of perseverance, the beauty of serendipity, and the endless possibilities that arise when passion meets innovation.
            </p>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Related Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/marshal-qr/work/qr-code-component" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition">
                <h4 className="font-medium mb-2">QR Code Component</h4>
                <p className="text-gray-400 text-sm">Interactive visualization of the QR code encoding process</p>
              </Link>
              <Link href="/marshal-qr/work/python-utilities" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition">
                <h4 className="font-medium mb-2">Python Utilities</h4>
                <p className="text-gray-400 text-sm">The Python code behind the QR code generation</p>
              </Link>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
} 