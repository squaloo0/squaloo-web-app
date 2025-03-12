import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center text-center">
        <h1 className="text-4xl font-bold mb-4">Under Construction</h1>
        <p className="text-xl mb-8">This site is currently being built. Please check back soon!</p>
        
        <div className="mt-8 p-6 bg-black/[.05] dark:bg-white/[.06] rounded-lg">
          <p className="text-lg mb-4">Looking for the Marshal QR Code Project?</p>
          <Link 
            href="/marshal-qr" 
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Visit the QR Code Project
          </Link>
        </div>
      </main>
    </div>
  );
}
