import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProjectCard from './components/ProjectCard';
import Footer from './components/Footer';

const projects = [
  {
    title: "Marshal QR Code: Project Overview",
    description: "Journey with me to better understand computing and design concepts by creating a physical version 2 QR code using a custom made go board and pieces as bits to encode.",
    tags: ["Next.js", "Drizzle ORM", "Design"],
    imageUrl: "/images/qr-code/marshal-with-final-board-pc.jpg",
    href: "/marshal-qr/work/qr-code-overview"
  },
  {
    title: "Marshal QR Code: A Visual Journey",
    description: "Explore the intricacies of QR code generation with this interactive visualization, built with Next.js and Drizzle ORM.",
    tags: ["Next.js", "Drizzle ORM", "Visualization"],
    imageUrl: "/images/qr-code/component-screenshot.jpg",
    href: "/marshal-qr/work/qr-code-component"
  },
  {
    title: "Marshal QR Code: Python Utilities",
    description: "Understand how I used Python to tackle the advanced math involved with error correction coding in QR code generation.",
    tags: ["Python", "Data Science", "QR Code"],
    imageUrl: "/images/qr-code/python-thumbnail.jpg",
    href: "/marshal-qr/work/python-utilities"
  },
  {
    title: "From Go Board to Grad School",
    description: "The journey to apply to USC Iovine and Young Academy's MS program with a custom QR code on a hand-crafted go board.",
    tags: ["Blog", "QR Code", "Application Story"],
    imageUrl: "/images/qr-code/practice-board-pc.jpg",
    href: "/marshal-qr/blog/go-board-to-grad-school"
  }
];

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />
        
        {/* Projects section */}
        <section id="projects" className="py-12">
          <h2 className="text-2xl font-bold mb-8">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <ProjectCard 
                key={index}
                title={project.title}
                description={project.description}
                tags={project.tags}
                imageUrl={project.imageUrl}
                href={project.href}
              />
            ))}
          </div>
        </section>
        
        {/* Skills section */}
        <section id="skills" className="py-12">
          <h2 className="text-2xl font-bold mb-8">Skills & Expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "Full-stack Development (Self Taught)", level: 3 },
              { name: "Adobe Experience Manager", level: 5 },
              { name: "Salesforce Marketing Cloud", level: 2 },
              { name: "SEO", level: 5 },
              { name: "MarTech & Automation", level: 4 }
            ].map((skill, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>{skill.name}</span>
                  <span>{skill.level}/5</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(skill.level / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Coding Languages section */}
        <section id="coding-languages" className="py-12">
          <h2 className="text-2xl font-bold mb-8">Coding Languages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "Python", level: 3 },
              { name: "JS", level: 3 },
              { name: "Typescript", level: 3 },
              { name: "SQL", level: 3 },
              { name: "HTML", level: 4 },
              { name: "Tailwind CSS", level: 3 }
            ].map((language, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>{language.name}</span>
                  <span>{language.level}/5</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(language.level / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* About section */}
        <section id="about" className="py-12">
          <h2 className="text-2xl font-bold mb-8">About Me</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex items-start justify-center">
              <img 
                src="/images/qr-code/marshal-blue-icon.jpg" 
                alt="Marshal Aldoph" 
                className="rounded-lg w-full max-w-[250px] h-auto object-cover"
              />
            </div>
            <div className="w-full md:w-2/3">
              <h3 className="text-xl font-semibold mb-4">Marshal: Curious, Steadfast, and Adaptable</h3>
              <p className="text-gray-300 mb-4">
                I&apos;m a self-taught web developer, marketing technology professional, and entrepreneur with a passion for systems and application design, artificial intelligence, and product design. My background in marketing and business development provides me with a unique perspective on how to leverage technology to achieve business goals. I&apos;m excited to continue my journey as a new developer and spearhead/contribute to projects that make a positive impact.
              </p>
              <ul className="list-disc pl-5 text-gray-300 space-y-2">
                <li>Co-founded and led a boutique digital marketing agency, The Greenrose Agency, specializing in providing comprehensive solutions for SMBs.</li>
                <li>Developed and launched &quot;Digital Jumpstart,&quot; a program offering bundled digital marketing services tailored to address common SMB needs and drive revenue growth.</li>
                <li>Managed omni-channel digital marketing campaigns for clients, including organic and paid search, social media marketing, email marketing, and content marketing.</li>
                <li>Currently a MarTech and Automation professional at Pacific Life, starting as a catalyst of our SEO and value-add content strategy. I now focus on leading the automation of key marketing processes, including web data integration and social media lead capture.</li>
                <li>I&apos;m currently applying for my Master&apos;s in Integrated Design, Business, and Technology at the USC Iovine and Young Academy to further enhance my skills and knowledge.</li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* Contact section */}
        <section id="contact" className="py-12">
          <h2 className="text-2xl font-bold mb-8">Get In Touch</h2>
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-4">Let's Connect</h3>
            <p className="text-gray-200 mb-6">
              I'm always eager to collaborate on exciting projects and explore new opportunities. Feel free to reach out to me via email or connect with me on LinkedIn or GitHub.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="mailto:marshal.aldophjr@gmail.com" 
                className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-medium inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Me
              </a>
              <a 
                href="https://linkedin.com/in/marshalaldoph/" 
                className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-medium inline-flex items-center"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
              <a 
                href="https://github.com/marshal2093" 
                className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-medium inline-flex items-center"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
