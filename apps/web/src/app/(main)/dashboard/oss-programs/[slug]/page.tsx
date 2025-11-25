import { getProgramBySlug, getAllPrograms } from "@/data/oss-programs";
import { notFound } from "next/navigation";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { JSDOM } from  "jsdom"; 
import { ProgramHeader, ProgramMetadata, ProgramSection } from "@/components/oss-programs";
import "./program-styles.css";

export const revalidate = 3600;

export async function generateStaticParams() {
  const programs = getAllPrograms();
  return programs.map((program) => ({
    slug: program.slug,
  }));
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  const renderMarkdown = (markdown: string) => {
    const html = marked.parse(markdown) as string;
    const window = new JSDOM("").window;
    const purify = DOMPurify(window);
    return purify.sanitize(html);
  };

  return (
    <main className="min-h-screen w-full bg-[#1e1e1e] text-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 w-full">
        <ProgramHeader program={program} />
        <ProgramMetadata program={program} />

        <div className="space-y-10">
          {program.sections.map((section) => (
            <ProgramSection
              key={section.id}
              id={section.id}
              title={section.title}
              contentHtml={renderMarkdown(section.bodyMarkdown)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
