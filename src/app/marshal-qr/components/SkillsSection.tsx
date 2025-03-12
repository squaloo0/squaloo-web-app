interface Skill {
  name: string;
  level: number; // 1-5
}

export default function SkillsSection() {
  const skills: Skill[] = [
    { name: "JavaScript", level: 5 },
    { name: "React", level: 5 },
    { name: "TypeScript", level: 4 },
    { name: "Next.js", level: 4 },
    { name: "Tailwind CSS", level: 5 },
    { name: "Node.js", level: 3 },
    { name: "UI/UX Design", level: 4 },
    { name: "Responsive Design", level: 5 },
  ];

  return (
    <section id="skills" className="py-12">
      <h2 className="text-2xl font-bold mb-8">Skills & Expertise</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{skill.name}</span>
              <span className="text-sm text-gray-400">{skill.level}/5</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${(skill.level / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 