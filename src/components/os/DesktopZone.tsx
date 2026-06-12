import type { ProjectEntry } from './Desktop';
import FolderIcon from './FolderIcon';

interface DesktopZoneProps {
  label: string;
  projects: ProjectEntry[];
  onOpenProject: (project: ProjectEntry) => void;
  openProjectIds: string[];
}

export default function DesktopZone({ label, projects, onOpenProject, openProjectIds }: DesktopZoneProps) {
  return (
    <div className="h-full flex flex-col">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.1em] mb-2"
        style={{ color: 'var(--os-muted)' }}
      >
        {label}
      </span>
      {projects.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono text-[11px]" style={{ color: 'var(--os-muted)' }}>
            Empty
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 items-start">
          {projects.map((project) => (
            <FolderIcon
              key={project.data.id}
              project={project}
              isOpen={openProjectIds.includes(project.data.id)}
              onOpen={() => onOpenProject(project)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
