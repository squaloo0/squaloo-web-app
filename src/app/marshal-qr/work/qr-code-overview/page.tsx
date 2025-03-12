import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { Suspense } from 'react';
import GoQRMatrix from '../../components/GoQRMatrix';
import Timeline from '../../components/Timeline';
import { getQREncodingPhases } from '../../db/qrData';

// Define a local type for the phases to avoid importing from DB schema
type Phase = {
  id: number;
  name: string;
  description: string;
  matrixData: boolean[][];
  order: number;
};

// Fallback mock data in case database fetch fails
function createMockPhases(): Phase[] {
  const mockPhases = [
    {
      id: 1,
      name: "Finder Patterns",
      description: "The three finder patterns in the corners help QR readers locate and orient the code.",
      matrixData: Array(25).fill(null).map(() => Array(25).fill(false)),
      order: 1
    },
    {
      id: 2,
      name: "Separators",
      description: "White separators around the finder patterns help distinguish them from the data.",
      matrixData: Array(25).fill(null).map(() => Array(25).fill(false)),
      order: 2
    },
    {
      id: 3,
      name: "Alignment Pattern",
      description: "The alignment pattern helps QR readers maintain orientation on larger codes.",
      matrixData: Array(25).fill(null).map(() => Array(25).fill(false)),
      order: 3
    },
    {
      id: 4,
      name: "Timing Patterns",
      description: "Timing patterns help QR readers determine the size of the data modules.",
      matrixData: Array(25).fill(null).map(() => Array(25).fill(false)),
      order: 4
    },
    {
      id: 5,
      name: "Format Information",
      description: "Format information tells QR readers about the error correction level and mask pattern.",
      matrixData: Array(25).fill(null).map(() => Array(25).fill(false)),
      order: 5
    },
    {
      id: 6,
      name: "Data Encoding",
      description: "The actual data is encoded into the QR code using a specific pattern.",
      matrixData: Array(25).fill(null).map(() => Array(25).fill(false)),
      order: 6
    },
    {
      id: 7,
      name: "Final QR Code",
      description: "The complete QR code with all elements in place.",
      matrixData: Array(25).fill(null).map(() => Array(25).fill(false)),
      order: 7
    }
  ];
  
  // Add finder patterns to the first phase
  const finderPatternMatrix = [...mockPhases[0].matrixData];
  
  // Top-left finder pattern
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
        finderPatternMatrix[i][j] = true;
      }
    }
  }
  
  // Top-right finder pattern
  for (let i = 0; i < 7; i++) {
    for (let j = 18; j < 25; j++) {
      if (i === 0 || i === 6 || j === 18 || j === 24 || (i >= 2 && i <= 4 && j >= 20 && j <= 22)) {
        finderPatternMatrix[i][j] = true;
      }
    }
  }
  
  // Bottom-left finder pattern
  for (let i = 18; i < 25; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 18 || i === 24 || j === 0 || j === 6 || (i >= 20 && i <= 22 && j >= 2 && j <= 4)) {
        finderPatternMatrix[i][j] = true;
      }
    }
  }
  
  mockPhases[0].matrixData = finderPatternMatrix;
  
  // Add separators to the second phase
  const separatorsMatrix = JSON.parse(JSON.stringify(finderPatternMatrix)); // Deep copy
  
  // Add white separators around finder patterns
  // Top-left
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (i === 7 || j === 7) {
        separatorsMatrix[i][j] = false;
      }
    }
  }
  
  // Top-right
  for (let i = 0; i < 8; i++) {
    for (let j = 17; j < 25; j++) {
      if (i === 7 || j === 17) {
        separatorsMatrix[i][j] = false;
      }
    }
  }
  
  // Bottom-left
  for (let i = 17; i < 25; i++) {
    for (let j = 0; j < 8; j++) {
      if (i === 17 || j === 7) {
        separatorsMatrix[i][j] = false;
      }
    }
  }
  
  mockPhases[1].matrixData = separatorsMatrix;
  
  return mockPhases;
}

// Timeline events for the Process section
const timelineEvents = [
  {
    title: "Inspiration",
    description: "Watching the Veritasium video featuring Masahiro Hara, the inventor of the QR code. A video discussing the creation of the QR code, the inventor himself and his philosophy inspired my project.",
    mediaType: "embed",
    mediaContent: "https://www.youtube.com/embed/w5ebcowAJD8?si=7g_JSFLmKekO0s9n",
    mediaCaption: "Veritasium video on the QR code and its inventor"
  },
  {
    title: "Learning & Planning",
    description: "Researching QR code structure and encoding process. Using a thonky.com tutorial as the foundation, I followed along w/ the guide and researched concepts I needed to learn along the way.",
    mediaType: "link",
    mediaContent: "https://www.thonky.com/qr-code-tutorial/",
    mediaCaption: "Thonky.com QR code tutorial"
  },
  {
    title: "Data Encoding",
    description: "Generating the QR code data sequence and error correction codewords using Python. First utilized python to develop functions to understand data encoding, then refined them once I better understood the theory.",
    mediaType: "code",
    mediaContent: `def analyze_byte_encoding(text):
    print(f"Analyzing text: {text}")
    print(f"Length: {len(text)} characters")
    
    # In byte mode, each character is encoded as its ISO-8859-1 value
    encoded_bytes = []
    binary_result = ""
    
    for char in text:
        # Get the ISO-8859-1 value of the character
        byte_value = ord(char)
        binary = format(byte_value, '08b')
        encoded_bytes.append((char, byte_value, binary))
        binary_result += binary + " "
    
    # Print encoding details
    print("\\nEncoding Details:")
    for char, value, binary in encoded_bytes:
        print(f"'{char}' -> {value} -> {binary}")
    
    print(f"\\nTotal encoded bytes: {len(encoded_bytes)}")
    print(f"Binary encoding: {binary_result}")
    
    # Calculate data codewords
    data_codewords = []
    binary_string = binary_result.replace(" ", "")
    
    # Add mode indicator (0100 for byte mode)
    mode_indicator = "0100"
    
    # Add character count (8 bits for version 2 QR code with byte data)
    char_count = format(len(text), '08b')
    
    # Complete data stream
    complete_data = mode_indicator + char_count + binary_string
    print(f"\\nMode indicator: {mode_indicator}")
    print(f"Character count: {char_count} (for {len(text)} characters)")
    print(f"Complete data stream: {complete_data}")
    
    # Add terminator if needed
    bits_needed = 8 * 16  # 16 codewords for version 2-M
    if len(complete_data) < bits_needed:
        terminator = min(4, bits_needed - len(complete_data))
        complete_data += "0" * terminator
        print(f"Added {terminator} terminator bits: {'0' * terminator}")
    
    # Add padding to make multiple of 8
    while len(complete_data) % 8 != 0:
        complete_data += "0"
    
    print(f"After padding to byte boundary: {len(complete_data)} bits")
    
    # Convert to codewords
    for i in range(0, len(complete_data), 8):
        if i + 8 <= len(complete_data):
            codeword = int(complete_data[i:i+8], 2)
            data_codewords.append(codeword)
    
    # Add padding codewords if needed
    padding_codewords = []
    while len(data_codewords) < 16:
        padding_codewords.append(236 if len(padding_codewords) % 2 == 0 else 17)
        data_codewords.append(padding_codewords[-1])
    
    print(f"\\nData codewords ({len(data_codewords)}):")
    for i, cw in enumerate(data_codewords):
        print(f"Codeword {i+1}: {cw} ({format(cw, '08b')})")
    
    if padding_codewords:
        print(f"\\nPadding codewords used: {padding_codewords}")
    
    return data_codewords

# Test with the URL
url = "www.squaloo.com/marshal-qr"
data_codewords = analyze_byte_encoding(url)`,
    mediaLanguage: "python",
    mediaCaption: "Python code for QR encoding"
  },
  {
    title: "Board Design & Fabrication",
    description: "Designing the physical board and collaborating with Mahesh for CNC routing. Purchased an actual go board, discovered it was too small. Sought to get a board engraved until I was pointed to Mahesh a small business owner with a CNC router and other machinery. We plotted and cut a 25x25 matrix necessary for a v2 QR code.",
    mediaType: "gallery",
    mediaContent: [
      {
        src: "/images/qr-code/cnc-router.jpg",
        alt: "CNC router cutting the QR code board",
        caption: "CNC machine and the final custom Go board"
      },
      {
        src: "/images/qr-code/mahesh.jpg",
        alt: "Mahesh with the CNC equipment",
        caption: "Mahesh, the small business owner who helped with fabrication"
      },
      {
        src: "/images/qr-code/cnc-router-2.jpg",
        alt: "Close-up of CNC router cutting the grid",
        caption: "Close-up view of the CNC router cutting the precise grid pattern"
      }
    ],
    mediaCaption: "Board design and fabrication process"
  },
  {
    title: "Physical Implementation",
    description: "Encoding the data onto the board using black and white Go pieces. Utilized the qrCodeGenerator.ts file to print the output of the final matrix in the console log. I utilized a screenshot that I marked up in my iPad to successfully place the bits after plotting the phases visually in the component.",
    mediaType: "gallery",
    mediaContent: [
      {
        src: "/images/qr-code/practice-board.jpg",
        alt: "QR code implemented with Go pieces on the board",
        caption: "The 'practice' board, with intial patterns and markings for zero-indexed columns and rows."
      },
      {
        src: "/images/qr-code/log-print-out.jpg",
        alt: "Console log printout of the QR code matrix",
        caption: "Console log output used as a reference for placing the Go pieces"
      }
    ],
    mediaCaption: "Physical implementation process"
  },
  {
    title: "Web App Development",
    description: "Developing the web app to visualize the QR encoding process. Critical to this process was visualizing the phases of bit encoding. This helped ensure the physical implementation was successful. The component and it's function were used to visualize the phases preceeding the final code. For more details visit Marshal QR Code: A Visual Journey",
    links: [
      {
        text: "Marshal QR Code: A Visual Journey",
        url: "/marshal-qr/work/qr-code-component",
        isExternal: false
      }
    ],
    mediaType: "code",
    mediaContent: `// Define the data and error correction codewords (from the Python functions)
const dataCW = [64, 119, 119, 119, 46, 115, 113, 117, 97, 108, 111, 111, 46, 99, 111, 109];
const ecCW = [196, 35, 39, 119, 235, 215, 231, 226, 93, 23];

// Helper function to create a 25x25 matrix filled with false values
export function createEmptyMatrix(): boolean[][] {
  return Array(25).fill(null).map(() => Array(25).fill(false));
}

// Helper function to check if a module is a data module
function isDataModule(row: number, col: number, size: number): boolean {
  // Check if the module is in a finder pattern or separator
  if ((row < 9 && col < 9) || // Top-left finder pattern and separator
      (row < 9 && col >= size - 8) || // Top-right finder pattern and separator
      (row >= size - 8 && col < 9)) { // Bottom-left finder pattern and separator
    return false;
  }
  
  // Check if the module is in the alignment pattern
  if (row >= 16 && row <= 20 && col >= 16 && col <= 20) {
    return false;
  }
  
  // Check if the module is in a timing pattern
  if (row === 6 || col === 6) {
    return false;
  }
  
  // Check if the module is the dark module
  if (row === 8 && col === 17) {
    return false;
  }
  
  // Check if the module is in the format information area
  if ((row === 8 && col < 9) || // Horizontal format info (top-left)
      (row < 9 && col === 8) || // Vertical format info (top-left)
      (row === 8 && col >= size - 8) || // Horizontal format info (top-right)
      (row >= size - 7 && col === 8)) { // Vertical format info (bottom-left)
    return false;
  }
  
  return true;
}

// Export phases generation function
export async function generateQRCodePhases(text: string): Promise<boolean[][][]> {
  // Create an empty matrix
  const emptyMatrix = createEmptyMatrix();
  
  // Generate all phases
  const phase1Matrix = addFinderPatterns(emptyMatrix);
  const separatorsMatrix = addSeparators(phase1Matrix);
  const phase2Matrix = addAlignmentPattern(separatorsMatrix);
  const phase3Matrix = addTimingPatterns(phase2Matrix);
  const darkModuleMatrix = addDarkModule(phase3Matrix);
  const phase6Matrix = addModeAndCharCount(darkModuleMatrix);
  const phase7Matrix = addDataAndErrorCorrection(phase6Matrix);
  const phase8Matrix = addErrorCorrection(phase7Matrix);
  const phase9Matrix = addRemainderPadding(phase8Matrix);
  const maskedMatrix = applyMask(phase9Matrix);
  const finalMatrix = addFormatInfo(maskedMatrix);
  
  // Return all matrices for visualization
  return [
    phase1Matrix,
    separatorsMatrix,
    phase2Matrix,
    phase3Matrix,
    darkModuleMatrix,
    phase6Matrix,
    phase7Matrix,
    phase8Matrix,
    phase9Matrix,
    maskedMatrix,
    finalMatrix
  ];
}`,
    mediaLanguage: "typescript",
    mediaCaption: "Key parts of the QR code generator implementation"
  }
];

// Example placeholder images for the gallery
const projectImages = [
  {
    src: "/images/placeholder-1.jpg",
    alt: "QR Code Board Design",
    caption: "Initial design sketch for the QR code board"
  },
  {
    src: "/images/placeholder-2.jpg",
    alt: "CNC Routing Process",
    caption: "The CNC router creating the board"
  },
  {
    src: "/images/placeholder-3.jpg",
    alt: "Completed Board",
    caption: "The completed Go board ready for QR code implementation"
  },
  {
    src: "/images/placeholder-4.jpg",
    alt: "QR Code Assembly",
    caption: "Placing the Go pieces to form the QR code"
  },
  {
    src: "/images/qr-code/marshal-with-final-board-pc.jpg",
    alt: "Marshal with the completed QR code board"
  }
];

export default async function QRCodeOverviewPage() {
  // Fetch QR encoding phases from the database
  let phases: Phase[] = [];
  try {
    const fetchedPhases = await getQREncodingPhases();
    if (fetchedPhases && fetchedPhases.length > 0) {
      phases = fetchedPhases;
    } else {
      console.log("No phases found in database, using fallback data");
      phases = createMockPhases();
    }
  } catch (error) {
    console.error('Error fetching QR encoding phases:', error);
    // Use fallback data if database fetch fails
    phases = createMockPhases();
  }

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4">
        <section className="py-12">
          <h1 className="text-4xl font-bold mb-6">Marshal QR Code: Project Overview</h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl">
            A Physical QR Code Built on a Go Board
          </p>
          
          {/* Project Overview - Updated to match screenshot with image placement */}
          <div className="bg-gray-800 rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <p className="text-gray-300 mb-4">
                  This project is a cross-disciplinary endeavor to showcase my proficiency in design, computing, and solving complex problems. 
                  I created a custom 25x25 matrix board using a CNC router, then implemented the QR 
                  code using encoding algorithms from scratch gaining an understanding of how data is represented in the matrix.
                </p>
                <p className="text-gray-300">
                  Once I had a grasp on the theory behind the data encoding process using Python, 
                  I created a functional QR code that can be scanned with any smartphone or QR code scanner. This 
                  physical-digital fusion piece demonstrates the QR encoding process via a Next.js component that references data created by a 
                  function that mirrors the phases of the encoding process and seeds that data to Neon. 
                  The function operates around the data and EC keywords that are necessary for Reed-Solomon error correction.
                </p>
              </div>
              <div className="md:w-1/3 bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Marshal with the physical Go board QR code</p>
                  {projectImages && projectImages.length > 0 ? (
                    <img 
                      src="/images/qr-code/marshal-with-final-board-pc.jpg" 
                      alt="Completed QR code board" 
                      className="mt-2 rounded-md max-h-48 mx-auto object-contain" 
                    />
                  ) : (
                    <div className="mt-2 h-32 w-full bg-gray-600 rounded-md flex items-center justify-center">
                      <span className="text-gray-400">Board image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Intro - Why This Project? */}
          <div className="bg-gray-800 rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-semibold mb-4">Why We Design</h2>
            <p className="text-gray-300">
              I believe that at the heart of design is creating for people first. Building with unselfish intent produces the best designs. This project is a testament to that philosophy, using the QR code as a symbol of this idea.
            </p>
          </div>
          
          {/* The Project */}
          <div className="bg-gray-800 rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-semibold mb-4">The Objective</h2>
            <p className="text-gray-300">
              Create a physical representation of a QR code built on a custom-made go board. The board required is 27"x27" to provide a border for the "quiet zone" and thus was built using a CNC router. The QR code required is a version 2 code, which means it is 25x25 modules. The QR code encodes the URL "http://squaloo.com/marshal-qrcode" using byte encoding with a medium error correction level.
            </p>
          </div>
          
          {/* The Process */}
          <div className="bg-gray-800 rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-semibold mb-4">The Process</h2>
            <p className="text-gray-300 mb-6">
              The process of creating this QR code was a journey of learning and discovery. I started by learning about the basics of QR codes and how they work. I then used Python to generate the QR code data sequence and error correction codewords. Next, I designed the physical board and had it made by Mahesh, a local business owner with a CNC router. Finally, I encoded the data onto the board using black and white go pieces with the help of visualizations from a Next.js component that uses Drizzle and Neon to house data.
            </p>
            
            <h3 className="text-xl font-medium mb-4">Timeline:</h3>
            <Timeline events={timelineEvents} />
          </div>
          
          {/* The Why - Updated with image in original alignment but no border */}
          <div className="bg-gray-800 rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-semibold mb-4">The Why</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <p className="text-gray-300 mb-4">
                  I was inspired to create this project after watching a video by Veritasium featuring Masahiro Hara, the inventor of the QR code. In the video, Hara mentions that he did not leverage the patent for the QR code, which allowed it to be proliferated. This resonated with me because of the impact his design has had as a result of that decision.
                </p>
                <p className="text-gray-300">
                  The QR code represents a perfect blend of utility and design, solving a real problem while being accessible to everyone. This philosophy of creating with unselfish intent is at the heart of my approach to design and technology.
                </p>
              </div>
              <div className="md:w-1/3 flex items-center justify-center">
                <img 
                  src="/images/qr-code/masahiro-hara.png" 
                  alt="Masahiro Hara, inventor of the QR code" 
                  className="rounded-md max-h-60 object-contain" 
                />
              </div>
            </div>
          </div>
          
          {/* The Outcome */}
          <div className="bg-gray-800 rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-semibold mb-4">The Outcome</h2>
            <p className="text-gray-300">
              This project was a challenging but rewarding experience. I learned a lot about QR codes, computer science, and the design process. I also had the opportunity to collaborate with a local business owner and learn about CNC routing. Most importantly, I created a project and piece that reflects my design philosophy and my passion for learning.
            </p>
          </div>
          
          {/* The Next Steps */}
          <div className="bg-gray-800 rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-semibold mb-4">The Next Steps</h2>
            <p className="text-gray-300 mb-4">
              I plan to continue to expand on my current work with the QR component and DB set up to make this an interactive lesson to engage w/ computing concepts making the creation of a physical board optional. As well as create more projects that combine physical and digital elements. I'm also excited to share my learnings with others and inspire them to create their own projects.
            </p>
          </div>
          
          {/* Interactive QR Encoding Process */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Interactive QR Encoding Process</h2>
            <p className="text-gray-300 mb-6">
              Key to undesrstanding the QR code is visualizing the phases data is encoded. To help myself in the physical implementation, I created this component that uses a Typescript function to seed a DB with the specific data from my URL. Navigate through the different phases of QR code encoding to see how the matrix is built up layer by layer. Each phase represents a specific step in the encoding process.
            </p>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <Suspense fallback={<div className="flex items-center justify-center h-96">
                <p className="text-gray-300">Loading encoding phases...</p>
              </div>}>
                <GoQRMatrix phases={phases} initialPhase={0} />
              </Suspense>
            </div>
          </div>
          
          {/* The QR Encoding Process */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">The QR Encoding Process</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">1. Finder Patterns</h3>
                <p className="text-gray-300">
                  QR codes start with three finder patterns in the corners. These distinctive square patterns help QR readers locate and orient the code correctly. Each finder pattern consists of a 7×7 module with a 3×3 black square inside a 5×5 white square inside a 7×7 black square.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">2. Separators</h3>
                <p className="text-gray-300">
                  Separators are one-module wide white strips that surround the finder patterns. They help distinguish the finder patterns from the rest of the QR code, making it easier for scanners to identify the positioning markers without interference from adjacent modules.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">3. Alignment Patterns</h3>
                <p className="text-gray-300">
                  Alignment patterns help QR readers maintain orientation, especially for larger codes or when the code is distorted. For a version 2 QR code (25×25), there's one alignment pattern located at position (18,18), consisting of a 5×5 module with a single black module in the center.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">4. Timing Patterns</h3>
                <p className="text-gray-300">
                  Timing patterns are alternating black and white modules that run horizontally and vertically between the finder patterns. They help the QR reader determine the positioning of each cell in the code, especially when the QR code is distorted or at an angle.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">5. Dark Module</h3>
                <p className="text-gray-300">
                  The dark module is a single black module that is always placed at the coordinates (8, 4×version+9). For a version 2 QR code, this is position (8, 17). This module is always black and serves as a fixed reference point for the QR code reader.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">6. Mode & Character Count</h3>
                <p className="text-gray-300">
                  The mode indicator (4 bits) specifies how the data is encoded (numeric, alphanumeric, byte, or kanji). The character count indicator (8 bits for version 2) tells the reader how many characters are encoded in the QR code, helping it properly parse the data.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">7. Data Encoding</h3>
                <p className="text-gray-300">
                  The actual data is encoded into the QR code following a specific zigzag pattern, starting from the bottom-right corner. The data is first converted to a bit stream according to the encoding mode, with each character represented by a specific bit sequence.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">8. Error Correction</h3>
                <p className="text-gray-300">
                  Reed-Solomon error correction codes are added to ensure the QR code can be read even if parts are damaged or obscured. The level of error correction (L, M, Q, H) determines how much of the QR code can be damaged while still being readable.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">9. Remainder Padding</h3>
                <p className="text-gray-300">
                  If there's remaining space in the QR code after the data and error correction bits, padding bits are added to fill the space. These follow specific patterns (11101100 and 00010001 alternating) to ensure the QR code has a balanced distribution of black and white modules.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">10. Masking</h3>
                <p className="text-gray-300">
                  A mask pattern is applied to ensure there aren't too many adjacent same-colored cells, which could confuse QR readers. Eight different mask patterns are evaluated, and the one that produces the best result according to specific penalty rules is chosen.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">11. Format Information</h3>
                <p className="text-gray-300">
                  Format information is encoded near the finder patterns and contains data about the error correction level and mask pattern used in the QR code. This 15-bit sequence is protected by its own error correction and is placed in two locations for redundancy.
                </p>
              </div>
            </div>
          </div>
          
          {/* Challenges and Learnings */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Challenges and Learnings</h2>
            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-gray-300 mb-4">
                Implementing a QR code from scratch presented several challenges:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                <li>Understanding the complex QR code specification and encoding rules</li>
                <li>Correctly implementing the Reed-Solomon error correction algorithm</li>
                <li>Ensuring proper placement of the dark module and format information in code for virtual display of bit encoding process</li>
                <li>Testing different mask patterns to find the optimal one</li>
                <li>Translating the digital implementation to a physical board with precise measurements</li>
              </ul>
              <p className="text-gray-300">
                Through this project, I gained a deep understanding of how QR codes and computing work at a fundamental level. I learned about binary encoding, error correction algorithms, and the importance of visual patterns in machine-readable codes. The physical implementation added an extra dimension to the learning experience, requiring precision in both the digital algorithm and the physical construction. It also was critical as a visual reference when writing and revising code for the QR code component.
              </p>
            </div>
          </div>
          
          {/* Learn More */}
          <div className="bg-gray-800 rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-semibold mb-4">Learn More</h2>
            <p className="text-gray-300 mb-6">
              Interested in learning more about QR codes or seeing the code behind this project? Check out these resources:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/marshal-qr/work/qr-code-component" className="bg-gray-700 hover:bg-gray-600 transition-colors p-4 rounded-lg block">
                <h3 className="text-lg font-medium mb-2">QR Code Component</h3>
                <p className="text-gray-400">See the interactive QR code component and explore the code behind it.</p>
              </Link>
              
              <Link href="https://www.thonky.com/qr-code-tutorial/" className="bg-gray-700 hover:bg-gray-600 transition-colors p-4 rounded-lg block" target="_blank" rel="noopener noreferrer">
                <h3 className="text-lg font-medium mb-2">QR Code Tutorial</h3>
                <p className="text-gray-400">A comprehensive tutorial on how QR codes work and how to generate them.</p>
              </Link>
              
              <Link href="https://github.com/nayuki/QR-Code-generator" className="bg-gray-700 hover:bg-gray-600 transition-colors p-4 rounded-lg block" target="_blank" rel="noopener noreferrer">
                <h3 className="text-lg font-medium mb-2">QR Code Generator Library</h3>
                <p className="text-gray-400">An open-source QR code generator library with implementations in multiple languages.</p>
              </Link>
              
              <Link href="https://www.youtube.com/watch?v=w5ebcowAJD8" className="bg-gray-700 hover:bg-gray-600 transition-colors p-4 rounded-lg block" target="_blank" rel="noopener noreferrer">
                <h3 className="text-lg font-medium mb-2">Veritasium QR Code Video</h3>
                <p className="text-gray-400">The video that inspired this project, featuring the inventor of the QR code.</p>
              </Link>
            </div>
          </div>
          
          {/* Get in Touch */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Let's Connect</h2>
            <p className="text-gray-200 mb-6 max-w-2xl">
              I'm always eager to collaborate on exciting projects and explore new opportunities. Feel free to reach out to me via email or connect with me on LinkedIn or GitHub.
            </p>
            <div className="flex gap-4">
              <a href="mailto:marshal.aldophjr@gmail.com" className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-medium">
                Email
              </a>
              <a href="https://linkedin.com/in/marshalaldoph/" className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
                LinkedIn
              </a>
              <a href="https://github.com/marshal2093" className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
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