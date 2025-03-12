import Link from 'next/link';
import Image from 'next/image';

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  href: string;
}

export default function ProjectCard({ title, description, tags, imageUrl, href }: ProjectCardProps) {
  return (
    <Link href={href} className="block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition">
      <div className="relative w-full h-48 overflow-hidden">
        <Image 
          src={imageUrl} 
          alt={title}
          width={500}
          height={300}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
} 