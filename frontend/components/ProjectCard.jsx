import Image from 'next/image';
import Link from 'next/link';

export default function ProjectCard({ project }) {
    return (
        <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-container-background hover:shadow-md transition-all duration-200 hover:-translate-y-1">
            {/* Image Section */}
            <div className="w-full h-48 relative">
                <Image
                    src={project.image || "/default-project.jpg"}
                    alt={project.title}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col justify-between h-[280]">
                <div>
                    {/* Category Badge */}
                    <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                        {project.category || "Project"}
                    </span>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{project.title}</h3>

                    {/* Description */}
                    <p className="text-muted-foreground mb-4 line-clamp-3">{project.description}</p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologyUsed?.slice(0, 3).map((tech, index) => (
                            <span key={index} className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground">
                                {tech}
                            </span>
                        ))}
                        {project.technologyUsed?.length > 3 && (
                            <span className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground">
                                +{project.technologyUsed.length - 3} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                        {project.contributors?.join(', ') || 'Anonymous'}
                    </span>
                    <Link
                        href={`/projects/${project._id}`}
                        className="text-sm font-medium text-primary"
                    >
                        View Details →
                    </Link>
                </div>
            </div>
        </div>
    );
}