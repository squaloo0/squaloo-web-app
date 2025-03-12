import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CodeBlock from '../../components/CodeBlock';
import Link from 'next/link';

export default function PythonUtilitiesPage() {

  const qrByteEncodingCode = `def analyze_byte_encoding(text):
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

# Test with the URL - using lowercase as shown in the screenshot
url = "www.squaloo.com/marshal-qr"
data_codewords = analyze_byte_encoding(url)`;

  // QR Data Analysis
  const qrDataAnalysisCode = `def analyze_alphanumeric_encoding(text):
    # Alphanumeric character set mapping
    char_map = {
        '0':0, '1':1, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9,
        'A':10, 'B':11, 'C':12, 'D':13, 'E':14, 'F':15, 'G':16, 'H':17, 'I':18,
        'J':19, 'K':20, 'L':21, 'M':22, 'N':23, 'O':24, 'P':25, 'Q':26, 'R':27,
        'S':28, 'T':29, 'U':30, 'V':31, 'W':32, 'X':33, 'Y':34, 'Z':35,
        ' ':36, '$':37, '%':38, '*':39, '+':40, '-':41, '.':42, '/':43, ':':44
    }
    
    print(f"Analyzing text: {text}")
    print(f"Length: {len(text)} characters")
    
    # Check if all characters are in the alphanumeric set
    valid = all(c in char_map for c in text)
    print(f"All characters valid for alphanumeric encoding: {valid}")
    
    if not valid:
        invalid_chars = [c for c in text if c not in char_map]
        print(f"Invalid characters: {invalid_chars}")
        return
    
    # Encode the data
    encoded_pairs = []
    binary_result = ""
    total_bits = 0
    
    for i in range(0, len(text), 2):
        if i+1 < len(text):
            # Pair of characters
            char1, char2 = text[i], text[i+1]
            value = char_map[char1] * 45 + char_map[char2]
            binary = format(value, '011b')
            encoded_pairs.append((f"{char1}{char2}", value, binary))
            binary_result += binary + " "
            total_bits += 11
        else:
            # Single character (if text length is odd)
            char = text[i]
            value = char_map[char]
            binary = format(value, '06b')
            encoded_pairs.append((char, value, binary))
            binary_result += binary + " "
            total_bits += 6
    
    # Print encoding details
    print("\\nEncoding Details:")
    for pair, value, binary in encoded_pairs:
        print(f"'{pair}' -> {value} -> {binary}")
    
    print(f"\\nTotal encoded bits: {total_bits}")
    print(f"Binary encoding: {binary_result}")
    
    # Calculate data codewords
    data_codewords = []
    binary_string = binary_result.replace(" ", "")
    
    # Add mode indicator (0010 for alphanumeric)
    mode_indicator = "0010"
    
    # Add character count (9 bits for version 2 QR code with alphanumeric data)
    char_count = format(len(text), '09b')
    
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
url = "WWW.SQUALOO.COM/MARSHAL-QR"
data_codewords = analyze_alphanumeric_encoding(url)`;

  // QR Error Correction
  const qrErrorCorrectionCode = `def generate_gf_tables():
    """
    Generates log and antilog tables for GF(256)
    Using primitive polynomial x^8 + x^4 + x^3 + x^2 + 1 (285 in decimal)
    """
    gf_exp = [0] * 512  # antilog table - extended to handle cyclic nature
    gf_log = [0] * 256  # log table
    
    # Initialize tables
    x = 1
    for power in range(256):
        gf_exp[power] = x
        # Generate log table
        if power < 255:  # log of 0 is undefined
            gf_log[x] = power
            
        # Multiply by x (2)
        x = x << 1  # multiply by 2
        # If overflow, XOR with 285 (our primitive polynomial)
        if x & 0x100:  # if x >= 256
            x = (x ^ 285) & 0xFF
            
    # Make exp table cyclic
    for i in range(255, 512):
        gf_exp[i] = gf_exp[i - 255]
    
    return gf_log, gf_exp

def gf_multiply(x, y, gf_log, gf_exp):
    """
    Multiplies two numbers in GF(256)
    Uses log and antilog tables for efficient multiplication
    """
    if x == 0 or y == 0:
        return 0
    # Sum the logarithms and take antilog
    return gf_exp[(gf_log[x] + gf_log[y]) % 255]

def calculate_error_correction(data_codewords):
    """
    Calculates error correction codewords for given data
    """
    # First, generate our GF(256) tables
    gf_log, gf_exp = generate_gf_tables()
    
    # Generator polynomial coefficients for 10 error correction codewords (for version 2-M)
    generator = [
        1,      # x^10
        251,    # x^9
        67,     # x^8
        46,     # x^7
        61,     # x^6
        118,    # x^5
        70,     # x^4
        64,     # x^3
        94,     # x^2
        32,     # x^1
        45      # x^0
    ]
    
    # Create a working array with space for the division
    working = list(data_codewords)
    # Add zeros for the error correction codewords
    working.extend([0] * (len(generator) - 1))
    
    # Perform polynomial division
    for i in range(len(data_codewords)):
        if working[i] != 0:
            multiplier = working[i]
            for j in range(len(generator)):
                working[i + j] ^= gf_multiply(generator[j], multiplier, gf_log, gf_exp)
    
    # The error correction codewords are the remainder
    ec_codewords = working[-len(generator) + 1:]
    
    print("Error correction codewords:")
    for i, cw in enumerate(ec_codewords):
        print(f"EC Codeword {i+1}: {cw} ({format(cw, '08b')})")
    
    return ec_codewords

# Import the data codewords from the byte encoding function
# This is just a placeholder - you'll need to run the byte encoding function first
# and copy the actual data codewords here
from qr_byte_encoding import analyze_byte_encoding
url = "www.squaloo.com/marshal-qr"
data_codewords = analyze_byte_encoding(url)
ec_codewords = calculate_error_correction(data_codewords)`;

  // QR Final Message
  const qrFinalMessageCode = `def structure_final_message(data_codewords, ec_codewords):
    """
    Structures the final message by interleaving data and error correction codewords
    """
    # For version 2-M, we don't need interleaving as there's only one block
    final_message = data_codewords + ec_codewords
    
    # Convert to binary for visualization
    binary_message = []
    for cw in final_message:
        binary = format(cw, '08b')
        binary_message.append(binary)
    
    print("Final message structure:")
    print(f"Data codewords: {len(data_codewords)}")
    print(f"Error correction codewords: {len(ec_codewords)}")
    print(f"Total codewords: {len(final_message)}")
    
    print("\\nFinal message (codewords):")
    for i, cw in enumerate(final_message):
        section = "Data" if i < len(data_codewords) else "EC"
        print(f"{i+1:2d}. [{section}] {cw:3d} ({format(cw, '08b')})")
    
    # Convert to bit stream for placement in QR code
    bit_stream = ""
    for cw in final_message:
        bit_stream += format(cw, '08b')
    
    print(f"\\nTotal bits in final message: {len(bit_stream)}")
    
    return final_message, bit_stream

# Import the data and EC codewords
# This is just a placeholder - you'll need to run the previous functions first
# and copy the actual codewords here
from qr_byte_encoding import analyze_byte_encoding
from qr_error_correction import calculate_error_correction

url = "www.squaloo.com/marshal-qr"
data_codewords = analyze_byte_encoding(url)
ec_codewords = calculate_error_correction(data_codewords)
final_message, bit_stream = structure_final_message(data_codewords, ec_codewords)

# Data codewords for "www.squaloo.com/marshal-qr" in byte mode
data_codewords = [64, 119, 119, 119, 46, 115, 113, 117, 97, 108, 111, 111, 46, 99, 111, 109]

# Error correction codewords
ec_codewords = [196, 35, 39, 119, 235, 215, 231, 226, 93, 23]`;

  // QR Code Generator TypeScript - renamed to tsGeneratorCode to fix the error
  const tsGeneratorCode = `// QR Code Generator Utility
// This file contains functions to generate the QR code matrices for each phase

// First, install the qrcode package and its types
// npm install qrcode @types/qrcode

// Import the QRCode library for debugging
import QRCode from 'qrcode';

// Define the QR code phases with updated descriptions
export const qrCodePhases = [
    {
      name: "Finder Patterns",
      description: "The three finder patterns in the corners help QR readers locate and orient the code.",
      order: 1
    },
    {
      name: "Separators",
      description: "White separators around the finder patterns help distinguish them from the data.",
      order: 2
    },
    {
      name: "Alignment Pattern",
      description: "The alignment pattern helps QR readers maintain orientation on larger codes.",
      order: 3
    },
    {
      name: "Timing Patterns",
      description: "Alternating black and white modules that help determine the size of modules in the code.",
      order: 4
    },
    {
      name: "Dark Module",
      description: "A single black module that is always present at a specific position (17,8) [zero-indexed] in the QR code specification.",
      order: 5
    },
    {
      name: "Mode & Character Count",
      description: "Mode indicator (0100 for byte mode) and character count (00010111 for 23 characters).",
      order: 6
    },
    {
      name: "Data Encoding",
      description: "The byte encoding of the URL 'www.squaloo.com/marshal-qr' with padding.",
      order: 7
    },
    {
      name: "Error Correction",
      description: "Reed-Solomon error correction codewords that allow the QR code to be read even if partially damaged.",
      order: 8
    },
    {
      name: "Remainder Padding",
      description: "Padding bits added to fill the remaining data capacity of the QR code.",
      order: 9
    },
    {
      name: "Masked QR Code",
      description: "Mask pattern 3 applied to ensure optimal scanning by creating a balanced distribution of black and white modules.",
      order: 10
    },
    {
      name: "Final QR Code",
      description: "The complete QR code with format information added, ready to be scanned.",
      order: 11
    }
];

// Define the data and error correction codewords (from the Python functions)
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
}`;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <section className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">QR Code Python Utilities</h1>
          
          {/* Project Overview */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Project Overview</h2>
            <p className="text-gray-300 mb-6">
              These Python utilities were developed to understand and implement the QR code encoding process from scratch. 
              Each utility handles a specific part of the QR code generation pipeline, from data encoding to error correction.
            </p>
            <p className="text-gray-300 mb-6">
              The code is designed to be educational, with detailed comments and print statements that explain each step of the process.
              These utilities were used to generate the data for the interactive QR code visualization in the Marshal QR project.
            </p>
          </div>
          
          {/* QR Byte Encoding Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">QR Code Byte Encoding</h2>
            <p className="text-gray-300 mb-6">
              This utility handles the byte encoding mode for QR codes, which can encode any 8-bit data including URLs, text, and binary data.
            </p>
            
            <CodeBlock 
              code={qrByteEncodingCode} 
              language="python" 
              title="qr_byte_encoding.py"
            />
          </div>
          
          {/* QR Data Analysis Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">QR Code Alphanumeric Analysis</h2>
            <p className="text-gray-300 mb-6">
              This utility handles the alphanumeric encoding mode for QR codes, which is more efficient for uppercase letters, numbers, and some special characters.
            </p>
            
            <CodeBlock 
              code={qrDataAnalysisCode} 
              language="python" 
              title="qr_data_analysis.py"
            />
          </div>
          
          {/* QR Error Correction Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">QR Code Error Correction</h2>
            <p className="text-gray-300 mb-6">
              This utility implements Reed-Solomon error correction for QR codes, allowing them to be read even when partially damaged or obscured.
            </p>
            
            <CodeBlock 
              code={qrErrorCorrectionCode} 
              language="python" 
              title="qr_error_correction.py"
            />
          </div>
          
          {/* QR Final Message Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">QR Code Message Structure</h2>
            <p className="text-gray-300 mb-6">
              This utility combines data and error correction codewords into the final message structure that will be placed in the QR code matrix.
            </p>
            
            <CodeBlock 
              code={qrFinalMessageCode} 
              language="python" 
              title="qr_final_message.py"
            />
          </div>
          
          {/* QR Code Generator TypeScript Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">QR Code Generator (TypeScript)</h2>
            <p className="text-gray-300 mb-6">
              This TypeScript implementation uses the data from the Python utilities to generate and visualize the QR code matrix through various encoding phases.
            </p>
            
            <CodeBlock 
              code={tsGeneratorCode} 
              language="typescript" 
              title="qrCodeGenerator.ts"
            />
            
            <div className="mt-8 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-medium mb-4">QR Code Visualization</h3>
                  <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                    <div className="w-full h-auto rounded-lg overflow-hidden">
                      <img 
                        src="/images/qr-code/component-screenshot.jpg" 
                        alt="QR Code Component Visualization" 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-300 text-sm">
                      Interactive visualization showing the QR code encoding phases. See the complete component in action by clicking the "View QR Code Component" button below.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="bg-gray-800 p-6 rounded-lg h-full">
                  <h3 className="text-xl font-medium mb-4">Implementation Notes</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2"></span>
                      <span>Implements Reed-Solomon error correction to allow QR codes to be read even when partially damaged</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2"></span>
                      <span>Supports both byte and alphanumeric encoding modes for optimal data efficiency</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2"></span>
                      <span>Provides detailed visualization of each encoding phase for educational purposes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2"></span>
                      <span>Includes Galois Field mathematics for precise error correction calculations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Explore More</h2>
            <p className="text-gray-200 mb-6 max-w-2xl">
              Interested in seeing how these utilities were used in the Marshal QR project? Check out the detailed walkthrough of the QR code component implementation.
            </p>
            <Link href="/marshal-qr/work/qr-code-component" className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-medium inline-flex items-center">
              View QR Code Component
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 