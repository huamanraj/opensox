"use client";

import { motion } from "framer-motion";
import { CornerDownRight, Target } from "lucide-react";
import Link from "next/link";
import { ActiveTag } from "@/components/ui/ActiveTag";

const opensoxFeatures = [
  {
    id: 1,
    title: "Opensox Advanced search tool",
    description:
      "One and only tool in the market that let you find open source with blizzing speed and scary accuracy. It will have:",
    features: [
      "Faster and accurate search of projects",
      "Higher accuracy (so that you exactly land on your dream open source project)",
      "Advanced filters like, GSOC, YC, funding, hire contributors, trending, niche (like AI, Core ML, Web3, MERN), bounties, and many more.",
    ],
  },
  {
    id: 2,
    title: "OX Newsletter",
    description:
      "A newsletter that keeps you ahead in open source world. It will cover:",
    features: [
      "Jobs/internships in opensource projects/companies",
      "Funding news",
      "What's trending in open source ecosystem",
      "Upcoming trends",
      "Tips to ace in open source",
      "What's happening in open source companies?",
    ],
  },
  {
    id: 3,
    title: "30 days Opensox challenge sheet",
    description: [
      "A comprehensive sheet of 30+ modules along with detailed videos to give you a clear path to start rocking in open source.",
      "It will contain videos, resouces and hand made docs.",
      <>
        In each of the 30 steps, you will learn, then apply, If stuck,
        we&apos;ll help and then we&apos;ll do an accountability check.{" "}
        <Link
          href="https://www.youtube.com/playlist?list=PLiWTvT-J4wHhDh-Mngogynfusor-694G-"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-brand-purple-light"
        >
          Check here.
        </Link>
      </>,
    ],
    features: [],
  },
];

const whySub = [
  {
    content:
      "Currently, Opensox 2.0 is in progress (70% done) so till the launch, we are offering Pro plan at a discounted price - $49 for the whole year",
  },
  {
    content:
      "This offer is only available for the first 1000 (64 slots booked) users",
  },
  {
    content:
      "After the launch, this $49 offer be removed and Opensox Pro will be around ~ $120 for whole year ($10/mo.)",
  },
  {
    content: "The price of the dollar is constantly increasing.",
  },
];

export const PricingFeaturesSection = () => {
  return (
    <>
      <div className=" py-8 border-b border-[#252525]">
        <h2 className="text-center text-3xl tracking-tight font-medium">
          What is Opensox 2.0?
        </h2>
      </div>
      <div className=" w-full h-full flex flex-col gap-6  border-b border-[#252525]">
        <ul className="flex flex-col lg:flex-row [&>li]:w-full  [&>li]:p-6 divide-y lg:divide-y-0 lg:divide-x divide-[#252525] h-full ">
          {opensoxFeatures.map((feature, index) => {
            // render first item (LCP element) immediately without animation
            const isLCPElement = index === 0;

            if (isLCPElement) {
              return (
                <li key={index} className="flex flex-col gap-4 w-full flex-1">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex gap-4 items-center">
                      <div className="text-6xl font-mono font-semibold text-transparent bg-clip-text bg-gradient-to-b from-[#a472ea] to-[#341e7b]">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-medium">
                          {feature.title}
                        </h3>
                        {feature.title === "OX Newsletter" && (
                          <ActiveTag text="completed" />
                        )}
                      </div>
                    </div>
                    {Array.isArray(feature.description) ? (
                      <div className="font-medium">
                        {feature.description.map((sentence, sentenceIndex) => (
                          <p key={sentenceIndex} className="mb-2">
                            {sentence}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium">{feature.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 w-full h-full">
                    <ul className="flex flex-col gap-3 w-full h-full pb-8">
                      {feature.features.map((feature, featureIndex) => {
                        return (
                          <li
                            key={featureIndex}
                            className="font-medium text-sm flex items-center gap-4"
                          >
                            <CornerDownRight className="size-4 flex-shrink-0 text-[#a472ea]" />
                            {feature}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            }

            return (
              <motion.li
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: 0.2 + (index - 1) * 0.05,
                }}
                key={index}
                className="flex flex-col gap-4 w-full flex-1"
              >
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex gap-4 items-center">
                    <div className="text-6xl font-mono font-semibold text-transparent bg-clip-text bg-gradient-to-b from-[#a472ea] to-[#341e7b]">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-medium">{feature.title}</h3>
                      {feature.title === "OX Newsletter" && (
                        <ActiveTag text="completed" />
                      )}
                    </div>
                  </div>
                  {Array.isArray(feature.description) ? (
                    <div className="font-medium">
                      {feature.description.map((sentence, sentenceIndex) => (
                        <p key={sentenceIndex} className="mb-2">
                          {sentence}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="font-medium">{feature.description}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 w-full h-full">
                  <ul className="flex flex-col gap-3 w-full h-full pb-8">
                    {feature.features.map((feature, featureIndex) => {
                      return (
                        <li
                          key={featureIndex}
                          className="font-medium text-sm flex items-center gap-4"
                        >
                          <CornerDownRight className="size-4 flex-shrink-0 text-[#a472ea]" />
                          {feature}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export const PricingWhySubscribeSection = () => {
  return (
    <>
      <div className="py-8 border-b border-[#252525]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
            delay: 0.15,
          }}
          className="text-center text-3xl tracking-tight font-medium"
        >
          Why should you subscribe to Opensox Pro now?
        </motion.h2>
      </div>
      <div className="w-full border-b border-[#252525]">
        <div className="w-full max-w-2xl mx-auto border-b lg:border-b-0 lg:border-x border-[#252525] p-6 font-medium space-y-2 ">
          {whySub.map((sub, index) => {
            return (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: 0.2 + index * 0.05,
                }}
                key={index}
                className="flex items-center gap-4"
              >
                <Target className="size-5 flex-shrink-0 text-[#a472ea]" />
                {sub.content}
              </motion.p>
            );
          })}
        </div>
      </div>
    </>
  );
};
