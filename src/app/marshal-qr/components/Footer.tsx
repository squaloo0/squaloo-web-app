export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-6 sm:py-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-gray-400 text-sm sm:text-base">© {currentYear} Marshal Aldoph. All rights reserved.</p>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <a href="mailto:marshal.aldophjr@gmail.com" className="text-gray-400 hover:text-white transition text-sm sm:text-base">
              Email
            </a>
            <a href="https://github.com/marshal2093" className="text-gray-400 hover:text-white transition text-sm sm:text-base">
              GitHub
            </a>
            <a href="https://linkedin.com/in/marshalaldoph/" className="text-gray-400 hover:text-white transition text-sm sm:text-base">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 