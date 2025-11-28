import { notFound } from "next/navigation";
import { getSheetModules } from "@/data/sheet";
import { SheetModuleHeader } from "@/components/sheet/SheetModuleHeader";

interface PageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function SheetModulePage({ params }: PageProps) {
  const { moduleId } = await params;
  const sheetModules = getSheetModules();
  const sheetModule = sheetModules.find((m) => m.id === moduleId);

  if (!sheetModule) {
    notFound();
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .sheet-content {
          color: rgb(225, 225, 225);
          line-height: 1.75;
        }
        .sheet-content p {
          margin-bottom: 1rem;
          color: rgb(225, 225, 225);
        }
        .sheet-content h3 {
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: rgb(148, 85, 244);
        }
        .sheet-content h2 {
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: rgb(255, 255, 255);
        }
        .sheet-content h1 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-size: 1.875rem;
          font-weight: 700;
          color: rgb(255, 255, 255);
        }
        .sheet-content a {
          color: rgb(148, 85, 244);
          text-decoration: underline;
        }
        .sheet-content a:hover {
          color: rgb(168, 105, 255);
        }
        .sheet-content strong {
          font-weight: 600;
          color: rgb(255, 255, 255);
        }
        .sheet-content em {
          font-style: italic;
        }
        .sheet-content ul,
        .sheet-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
          color: rgb(225, 225, 225);
        }
        .sheet-content li {
          margin-bottom: 0.5rem;
        }
        .sheet-content img {
          width: 60%;
          max-width: 60%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.25rem auto;
          display: block;
        }
        .sheet-content blockquote {
          border-left: 2px solid rgb(148, 85, 244);
          padding-left: 1rem;
          font-style: italic;
          color: rgb(209, 209, 209);
          margin: 1rem 0;
        }
        .sheet-content code {
          color: rgb(148, 85, 244);
          background-color: rgb(26, 26, 26);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .sheet-content pre {
          background-color: rgb(26, 26, 26);
          border: 1px solid rgb(37, 37, 37);
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .sheet-content pre code {
          background: none;
          padding: 0;
        }
      `,
        }}
      />
      <div className="min-h-screen bg-surface-primary">
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
          <SheetModuleHeader
            moduleName={sheetModule.name}
            docContent={sheetModule.docContent}
          />
          <article>
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                {sheetModule.name}
              </h1>
              {sheetModule.videoUrl && (
                <div className="mb-6">
                  <a
                    href={sheetModule.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand-purple hover:text-brand-purple-light transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span>watch video</span>
                  </a>
                </div>
              )}
            </header>

            <div
              className="sheet-content"
              dangerouslySetInnerHTML={{ __html: sheetModule.docContent }}
            />
          </article>
        </div>
      </div>
    </>
  );
}
