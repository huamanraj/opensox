import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Program } from "@/data/oss-programs/types";

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Link
      href={`/dashboard/oss-programs/${program.slug}`}
      className="group block"
    >
      <div className="bg-[#252525] border border-[#333] rounded-xl px-4 py-3 md:px-5 md:py-4 hover:border-[#9455f4]/50 hover:bg-[#2a2a2a] transition-all duration-200 flex items-center justify-between gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm md:text-base font-semibold text-white group-hover:text-[#dcb8ff] transition-colors truncate">
            {program.name}
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5 truncate">
            {program.shortDescription}
          </p>
        </div>

        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Region</p>
            <p className="text-sm text-gray-300 capitalize">{program.region}</p>
          </div>
        </div>

        <div className="flex-shrink-0 text-gray-500 group-hover:text-[#9455f4] transition-all duration-200 group-hover:translate-x-1">
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </div>
      </div>
    </Link>
  );
}
