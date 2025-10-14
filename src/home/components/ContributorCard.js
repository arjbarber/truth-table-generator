import { Github, Linkedin, Globe } from "lucide-react";

const ContributorCard = ({ contributor }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur shadow-sm hover:bg-white/10 transition">
      <div className="flex items-start gap-4">
        <img
          src={contributor.avatar}
          alt={`${contributor.name} avatar`}
          className="h-14 w-14 rounded-full ring-2 ring-white/10 object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold leading-tight">{contributor.name}</h3>
              <p className="text-sm text-white/70">{contributor.role}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-white/75">{contributor.bio}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            {contributor.links.github && (
              <a href={contributor.links.github} className="inline-flex items-center gap-2 hover:text-white/90" rel="noopener noreferrer" target="_blank">
                <Github className="h-4 w-4" /> GitHub
              </a>
            )}
            {contributor.links.linkedin && (
              <a href={contributor.links.linkedin} className="inline-flex items-center gap-2 hover:text-white/90" rel="noopener noreferrer" target="_blank">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            )}
            {contributor.links.website && (
              <a href={contributor.links.website} className="inline-flex items-center gap-2 hover:text-white/90" rel="noopener noreferrer" target="_blank">
                <Globe className="h-4 w-4" /> Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContributorCard;