"use client";

import { useState, useMemo } from "react";
import { Program } from "@/data/oss-programs/types";
import { SearchInput, TagFilter, ProgramCard } from "@/components/oss-programs";

interface ProgramsListProps {
  programs: Program[];
  tags: string[];
}

export default function ProgramsList({ programs, tags }: ProgramsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesSearch =
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => program.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [programs, searchQuery, selectedTags]);

  return (
    <div className="min-h-screen w-full bg-[#1e1e1e] text-white p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-8 mb-12">
          <h1 className="text-4xl font-bold text-white">OSS Programs</h1>

          <div className="flex flex-col md:flex-row gap-4 w-full">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search programs..."
            />
            <TagFilter
              tags={tags}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>
        </div>

        {/* List Section */}
        <div className="flex flex-col gap-2 md:gap-3">
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No programs found matching your criteria.
            </div>
          ) : (
            filteredPrograms.map((program) => (
              <ProgramCard key={program.slug} program={program} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
