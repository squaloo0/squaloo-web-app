export default function HeroSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent z-0"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fadeIn">
          Marshal Aldoph
        </h1>
        <p className="text-2xl text-gray-300 mb-8 max-w-2xl animate-slideUp">
        Think. Create. Design.
        </p>
        <div className="flex gap-4 animate-fadeIn animation-delay-300">
          <a 
            href="/marshal-qr/work" 
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            View My Work
          </a>
          <a 
            href="/marshal-qr/contact" 
            className="px-6 py-3 bg-gray-800 rounded-full hover:bg-gray-700 transition"
          >
            Contact Me
          </a>
        </div>
      </div>
      
      {/* Abstract shapes for visual interest */}
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-20 -left-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
    </section>
  );
} 