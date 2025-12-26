"use client";

import { useEffect, useState } from "react";

import { ArrowLeft, CheckCircle2, ExternalLink, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useSubscription } from "@/hooks/useSubscription";
import { trpc } from "@/lib/trpc";

interface SessionTopic {
  id: string;
  timestamp: string;
  topic: string;
  order: number;
}

interface WeeklySession {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  sessionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  topics: SessionTopic[];
}

const SessionCard = ({
  session,
  index,
}: {
  session: WeeklySession;
  index: number;
}): JSX.Element | null => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.open(session.youtubeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Watch session: ${session.title}`}
      className="group relative bg-dash-surface border border-dash-border rounded-xl p-5 cursor-pointer 
                 transition-all duration-300 ease-out
                 hover:border-brand-purple/50 hover:bg-dash-hover hover:shadow-lg hover:shadow-brand-purple/5
                 hover:-translate-y-1 active:scale-[0.98]
                 focus-visible:ring-2 focus-visible:ring-brand-purple/50 focus-visible:outline-none"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Session number badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-purple/10 
                          group-hover:bg-brand-purple/20 transition-colors duration-300"
          >
            <span className="text-brand-purple font-bold text-sm">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="text-text-primary font-semibold text-lg group-hover:text-brand-purple-light transition-colors duration-300">
            {session.title}
          </h3>
        </div>
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-full 
                        bg-brand-purple/10 group-hover:bg-brand-purple transition-all duration-300
                        ${isHovered ? "scale-110" : "scale-100"}`}
        >
          <Play
            className={`w-4 h-4 transition-all duration-300 ${
              isHovered
                ? "text-white translate-x-0.5"
                : "text-brand-purple-light"
            }`}
            fill={isHovered ? "currentColor" : "none"}
          />
        </div>
      </div>

      {/* Topics covered */}
      {session.topics && session.topics.length > 0 && (
        <div className="space-y-2.5 mb-4">
          <p className="text-text-muted text-xs uppercase tracking-wider font-medium">
            Topics Covered
          </p>
          <ul className="space-y-2">
            {session.topics.map((topic) => (
              <li
                key={topic.id}
                className="flex items-start gap-2.5 text-text-secondary text-sm"
              >
                <CheckCircle2
                  className="w-4 h-4 text-brand-purple/70 mt-0.5 flex-shrink-0 
                                         group-hover:text-brand-purple transition-colors duration-300"
                />
                <span className="group-hover:text-text-primary transition-colors duration-300">
                  {topic.timestamp && (
                    <span className="text-text-muted mr-2">[{topic.timestamp}]</span>
                  )}
                  {topic.topic}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Watch now indicator */}
      <div
        className="flex items-center gap-2 text-text-muted text-xs 
                      group-hover:text-brand-purple-light transition-colors duration-300"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>Watch on YouTube</span>
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 
                      transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgb(85 25 247 / 0.05) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};

const ProSessionsPage = (): JSX.Element | null => {
  const { isPaidUser, isLoading: subscriptionLoading } = useSubscription();
  const { data: session, status } = useSession();
  const router = useRouter();

  // fetch sessions from api
  const {
    data: sessions,
    isLoading: sessionsLoading,
    isError: sessionsError,
    error: sessionsErrorData,
  } = (trpc.sessions as any).getAll.useQuery(undefined, {
    enabled: !!session?.user && status === "authenticated" && isPaidUser,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // consider data fresh for 5 minutes
  });

  useEffect(() => {
    if (!subscriptionLoading && !isPaidUser) {
      router.push("/pricing");
    }
  }, [isPaidUser, subscriptionLoading, router]);

  const isLoading = subscriptionLoading || sessionsLoading;
  const hasError = sessionsError;

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-ox-content">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (!isPaidUser) {
    return null;
  }

  if (hasError) {
    return (
      <div className="w-full min-h-full bg-ox-content">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-8 md:mb-12">
            <Link
              href="/dashboard/pro/dashboard"
              className="inline-flex items-center gap-2 text-text-muted hover:text-brand-purple-light 
                         transition-colors duration-200 mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-sm">Back to Pro Dashboard</span>
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <p className="text-text-secondary text-lg">
              Failed to load sessions. Please try again later.
            </p>
            {sessionsErrorData && (
              <p className="text-text-muted text-sm">
                {(sessionsErrorData as any)?.message || "Unknown error"}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-ox-content">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          {/* Back link */}
          <Link
            href="/dashboard/pro/dashboard"
            className="inline-flex items-center gap-2 text-text-muted hover:text-brand-purple-light 
                       transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm">Back to Pro Dashboard</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
              Opensox Pro Sessions
            </h1>
          </div>
          <p className="text-text-secondary text-base md:text-lg max-w-2xl">
            Recordings of Opensox Pro session meetings covering advanced open
            source strategies, real-world examples, and insider tips to
            accelerate your journey.
          </p>
        </div>

        {/* Sessions Grid */}
        {sessions && sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {sessions.map((session: WeeklySession, index: number) => (
              <SessionCard key={session.id} session={session} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <p className="text-text-secondary text-lg">
              No sessions available yet.
            </p>
            <p className="text-text-muted text-sm">
              Check back soon for new session recordings.
            </p>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-text-muted text-sm">
            More sessions coming soon • Stay tuned for updates
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProSessionsPage;
