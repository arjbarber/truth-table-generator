import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const ToolCard = ({ tool }) => {
  return (
    <Link
      to={tool.to}
      className="group relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur hover:bg-white/10 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <div className="mb-3 inline-flex items-center gap-2">
        <span className="rounded-full bg-blue-500/20 text-blue-300 text-xs px-2 py-1">{tool.badge}</span>
      </div>
      <h3 className="text-lg font-semibold leading-tight group-hover:text-blue-300">
        {tool.title}
      </h3>
      <p className="mt-2 text-sm text-white/75">{tool.description}</p>

      <div className="mt-4 inline-flex items-center gap-2 text-sm text-blue-300">
        <ExternalLink className="h-4 w-4" />
        <span>Launch</span>
      </div>

      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-blue-400/40"></div>
    </Link>
  );
}

export default ToolCard;