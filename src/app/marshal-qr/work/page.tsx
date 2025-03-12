import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

// Updated project data to match the featured projects on the home page
const projects = [
  {
    title: "Marshal QR Code: Project Overview",
    description: "Journey with me to better understand computing and design concepts by creating a physical version 2 QR code using a custom made go board and pieces as bits to encode.",
    tags: ["Next.js", "Drizzle ORM", "Design"],
    imageUrl: "/images/qr-code/marshal-with-final-board-pc.jpg",
    link: "/marshal-qr/work/qr-code-overview"
  },
  {
    title: "Marshal QR Code: A Visual Journey",
    description: "Explore the intricacies of QR code generation with this interactive visualization, built with Next.js and Drizzle ORM.",
    tags: ["Next.js", "Drizzle ORM", "Visualization"],
    imageUrl: "/images/qr-code/component-screenshot.jpg",
    link: "/marshal-qr/work/qr-code-component"
  },
  {
    title: "Marshal QR Code: Python Utilities",
    description: "Understand how I used Python to tackle the advanced math involved with error correction coding in QR code generation.",
    tags: ["Python", "Data Science", "QR Code"],
    imageUrl: "/images/qr-code/python-thumbnail.jpg",
    link: "/marshal-qr/work/python-utilities"
  },
];

export default function WorkPage() {
  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto">
        <section className="py-12">
          <h1 className="text-4xl font-bold mb-6">My Work</h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl">
            A collection of projects I've worked on, from web applications to AI agents and content design systems.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <Link href={project.link} key={index} className="block hover:transform hover:scale-[1.02] transition duration-300">
                <div className="bg-gray-800 rounded-lg overflow-hidden h-full">
                  <div 
                    className="h-48 bg-gray-700"
                    style={project.imageUrl ? { backgroundImage: `url(${project.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  ></div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-300 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 bg-gray-700 rounded text-xs">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 