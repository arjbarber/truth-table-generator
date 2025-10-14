import NavBar from "../NavBar";
import { Link } from "react-router-dom";
import { Users, Wrench } from "lucide-react";
import { CONTRIBUTORS } from "./contributors";
import { TOOLS } from "./tools";
import ToolCard from "./components/ToolCard";
import ContributorCard from "./components/ContributorCard";

const HomePage = () => {
  const jumpTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <>
        <div id="NavBar">
            <NavBar />
        </div>
        <div className="min-h-[calc(100dvh-4rem)] bg-gray-800 text-white">
          <section className="relative isolate">
              <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
                <div className="flex flex-col items-start gap-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                    Welcome to the <span className="text-blue-400">COMP 283</span> Tool
                    </h1>
                    <p className="max-w-2xl text-base md:text-lg text-white/80">
                    A small hub of projects and tools.
                    Open source.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                    <Link
                        to="/truth-table"
                        className="rounded-2xl bg-blue-500/90 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-500/20 transition"
                    >
                        Launch Truth Table
                    </Link>
                    <a
                        href="#tools" onClick={jumpTo('tools')}
                        className="rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-semibold transition"
                    >
                        Browse Tools
                    </a>
                    <a
                        href="#contributors" onClick={jumpTo('contributors')}
                        className="rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-semibold transition"
                    >
                        Meet Contributors
                    </a>
                    </div>
                </div>
              </div>

              
          </section>

          {/* Tools */}
          <section id="tools" className="border-t border-white/10 bg-gray-800/30">
              <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
                <div className="mb-8 flex items-center gap-3">
                    <Wrench className="h-6 w-6 text-blue-400" aria-hidden />
                    <h2 className="text-2xl md:text-3xl font-bold">Tools</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {TOOLS.map((tool) => (
                    <ToolCard key={tool.title} tool={tool} />
                    ))}
                </div>
              </div>
          </section>

          {/* Contributors */}
          <section id="contributors" className="border-t border-white/10">
              <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
                <div className="mb-8 flex items-center gap-3">
                    <Users className="h-6 w-6 text-blue-400" aria-hidden />
                    <h2 className="text-2xl md:text-3xl font-bold">Contributors</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {CONTRIBUTORS.map((c) => (
                    <ContributorCard key={c.name} contributor={c} />
                    ))}
                </div>
              </div>
          </section>
        </div>
    </>
);
}

export default HomePage;