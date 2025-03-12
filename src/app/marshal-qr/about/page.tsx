import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto">
        <section className="py-12">
          <h1 className="text-4xl font-bold mb-6">About Me</h1>
          
          <div className="flex flex-col md:flex-row gap-12 mb-16">
            <div className="w-full md:w-1/3 flex items-start justify-center">
              <img 
                src="/images/qr-code/marshal-blue-icon.jpg" 
                alt="Marshal Aldoph" 
                className="rounded-lg w-full max-w-[250px] h-auto object-cover"
              />
            </div>
            <div className="w-full md:w-2/3">
              <p className="text-xl text-gray-300 mb-6">
                I'm Marshal Aldoph, a MarTech and Automation professional and self-taught developer.
              </p>
              <p className="text-gray-300 mb-4">
                I'm a self-taught web developer, marketing technology professional, and entrepreneur with a passion for systems and application design, artificial intelligence, and product design. 
                My background in marketing and business development provides me with a unique perspective on how to leverage technology to achieve business goals. 
                I'm excited to continue my journey as a new developer and spearhead/contribute to projects that make a positive impact.
              </p>
            </div>
          </div>
          
          {/* Experience section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Experience</h2>
            
            <div className="space-y-8">
              <div className="border-l-2 border-gray-800 pl-6 relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
                <h3 className="text-xl font-semibold">Marketing Analytics Automation Specialist</h3>
                <p className="text-gray-400 mb-2">Pacific Life • Jan 2025 - Present</p>
                <p className="text-gray-300">
                  Identify and implement streamlined processes for automation reporting and communication, leverage marketing 
                  analytics to identify insights to drive key decisions across leadership and the organization.
                </p>
              </div>
              
              <div className="border-l-2 border-gray-800 pl-6 relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
                <h3 className="text-xl font-semibold">Digital Marketing Specialist</h3>
                <p className="text-gray-400 mb-2">Pacific Life • 2018 - 2025</p>
                <p className="text-gray-300">
                  Manage the activation and execution of digital marketing campaigns, materials, 
                  and projects across web properties, CRM, and sales enablement platforms.
                </p>
              </div>
              
              <div className="border-l-2 border-gray-800 pl-6 relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
                <h3 className="text-xl font-semibold">Co-Founder & Digital Marketing Strategist</h3>
                <p className="text-gray-400 mb-2">Greenrose Agency • 2016 - 2018</p>
                <p className="text-gray-300">
                  Led a boutique digital marketing agency specializing in providing comprehensive solutions for SMBs. 
                  Successfully managed omni-channel digital marketing campaigns for clients, including organic and paid search, 
                  social media marketing, email marketing, and content marketing.
                </p>
              </div>
            </div>
          </div>
          
          {/* Education section */}
          <div>
            <h2 className="text-2xl font-bold mb-8">Education</h2>
            
            <div className="space-y-8">
              <div className="border-l-2 border-gray-800 pl-6 relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
                <h3 className="text-xl font-semibold">BS in Marketing</h3>
                <p className="text-gray-400 mb-2">Hampton University • 2011 - 2018</p>
                <p className="text-gray-300">
                  Focused on Marketing, otherwise concentrated studies on business administration & economics.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 