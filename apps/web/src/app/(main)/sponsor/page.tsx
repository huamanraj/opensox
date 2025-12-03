import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/landing-sections/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PrimaryButton from "@/components/ui/custom-button";

export const metadata: Metadata = {
  title: "Sponsor OpenSox - Reach Developers & Open Source Enthusiasts",
  description:
    "Get your brand in front of thousands of developers, open source contributors, and tech enthusiasts by sponsoring OpenSox.",
};

const SponsorPage = () => {
  return (
    <>
      <main className="min-h-screen bg-black text-white pt-32 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Sponsor OpenSox
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              Reach thousands of developers building the next generation of web
              applications. Get your brand in front of our growing community of
              creators and innovators.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-12 md:gap-24 mb-32 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                10K+
              </div>
              <div className="text-sm md:text-base text-neutral-500 font-medium uppercase tracking-wider">
                Monthly unique visitors
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                50K+
              </div>
              <div className="text-sm md:text-base text-neutral-500 font-medium uppercase tracking-wider">
                Monthly page views
              </div>
            </div>
          </div>

          {/* Sponsor Slots Section */}
          <div className="w-full max-w-6xl mx-auto mb-40 bg-[#0A0A0A] rounded-[32px] p-8 md:p-12 border border-neutral-900">
            <p className="text-neutral-400 mb-8 text-lg font-medium">
              Sponsors will be listed below the hero section on homepage.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-[16/10] w-full rounded-2xl border border-dashed border-neutral-800/60 bg-neutral-900/20 flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-20 h-12 rounded bg-neutral-800/50" />
                  <span className="text-neutral-600 text-sm font-medium">
                    Your logo here
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Why Sponsor Section */}
          <div className="w-full max-w-6xl mx-auto mb-32">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
              Why sponsor OpenSox?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Reach Top Talent",
                  description:
                    "Connect with skilled developers, open source contributors, and tech enthusiasts who are actively building and learning.",
                },
                {
                  title: "Brand Visibility",
                  description:
                    "Increase your brand's visibility within the tech community. Your logo will be prominently displayed to thousands of visitors.",
                },
                {
                  title: "Support Open Source",
                  description:
                    "Show your commitment to the open source ecosystem by supporting the tools and resources that developers rely on.",
                },
              ].map((card, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-3xl bg-black border border-neutral-800 p-8 h-[300px] group"
                >
                  {/* Grid Pattern */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `linear-gradient(#555 1px, transparent 1px), linear-gradient(90deg, #555 1px, transparent 1px)`,
                      backgroundSize: "30px 30px",
                      maskImage:
                        "linear-gradient(to bottom right, black 40%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom right, black 40%, transparent 100%)",
                    }}
                  />

                  {/* Random highlighted squares decoration */}
                  <div className="absolute top-0 right-0 p-10 opacity-20">
                    <div className="w-8 h-8 bg-neutral-600 absolute top-8 right-20" />
                    <div className="w-8 h-8 bg-neutral-700 absolute top-24 right-8" />
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {card.title}
                    </h3>
                    <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="w-full max-w-3xl mx-auto mb-32">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem
                value="item-1"
                className="border border-neutral-800 rounded-xl px-6 bg-neutral-900/30"
              >
                <AccordionTrigger className="text-lg font-medium hover:no-underline hover:text-green-400 transition-colors py-6">
                  How long does the sponsorship last?
                </AccordionTrigger>
                <AccordionContent className="text-neutral-400 text-base pb-6">
                  Sponsorships are billed monthly. You can cancel your
                  subscription at any time, and your logo will remain on the
                  site until the end of your billing period.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-2"
                className="border border-neutral-800 rounded-xl px-6 bg-neutral-900/30"
              >
                <AccordionTrigger className="text-lg font-medium hover:no-underline hover:text-green-400 transition-colors py-6">
                  What logo formats do you accept?
                </AccordionTrigger>
                <AccordionContent className="text-neutral-400 text-base pb-6">
                  We accept SVG, PNG, and JPG formats. SVG is preferred for the
                  best quality on all screen sizes. If providing a PNG or JPG,
                  please ensure it is high resolution (at least 500px wide).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-3"
                className="border border-neutral-800 rounded-xl px-6 bg-neutral-900/30"
              >
                <AccordionTrigger className="text-lg font-medium hover:no-underline hover:text-green-400 transition-colors py-6">
                  When will my sponsorship go live?
                </AccordionTrigger>
                <AccordionContent className="text-neutral-400 text-base pb-6">
                  Your sponsorship will typically go live within 2-3 business
                  days after we receive your payment and logo assets. We will
                  notify you via email once it is up.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-4"
                className="border border-neutral-800 rounded-xl px-6 bg-neutral-900/30"
              >
                <AccordionTrigger className="text-lg font-medium hover:no-underline hover:text-green-400 transition-colors py-6">
                  Can I update my link or logo?
                </AccordionTrigger>
                <AccordionContent className="text-neutral-400 text-base pb-6">
                  Yes, absolutely. If you rebrand or want to change the
                  destination URL, just reach out to our support team, and we
                  will update it for you.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          {/* CTA Section */}
          <div className="w-full max-w-5xl mx-auto py-20 px-4 md:px-0">
            <div className="relative">
              {/* Dotted Lines Effect */}
              <div className="absolute inset-0 pointer-events-none z-20">
                {/* Horizontal Lines */}
                <div
                  className="absolute top-0 left-[-10%] right-[-10%] h-px border-t border-dashed border-neutral-700"
                  style={{
                    maskImage:
                      "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                  }}
                />
                <div
                  className="absolute bottom-0 left-[-10%] right-[-10%] h-px border-t border-dashed border-neutral-700"
                  style={{
                    maskImage:
                      "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                  }}
                />
                {/* Vertical Lines */}
                <div
                  className="absolute left-0 top-[-20%] bottom-[-20%] w-px border-l border-dashed border-neutral-700"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
                  }}
                />
                <div
                  className="absolute right-0 top-[-20%] bottom-[-20%] w-px border-l border-dashed border-neutral-700"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
                  }}
                />
              </div>

              <div className="relative bg-[#0A0A0A] p-8 md:p-16 text-center overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/20 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white leading-tight">
                      Ready to reach{" "}
                      <span className="text-white">
                        thousands of developers?
                      </span>
                    </h2>
                    <p className="text-lg md:text-xl lg:text-2xl text-neutral-400 font-medium max-w-2xl mx-auto leading-tight">
                      Get your <span className="text-green-500">brand</span> in
                      front of our growing{" "}
                      <span className="text-green-500">community</span>.
                    </p>
                  </div>

                  <div className="pt-2 w-full flex justify-center">
                    <Link
                      href="mailto:hi@opensox.ai"
                      className="w-full sm:w-auto"
                    >
                      <PrimaryButton classname="rounded-xl w-full sm:w-auto text-sm sm:text-base py-4 px-8">
                        Become a Sponsor — $500/mo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </PrimaryButton>
                    </Link>
                  </div>

                  <p className="text-neutral-500 text-xs md:text-sm mt-6">
                    Your sponsorship will be live within 2-3 business days after
                    payment and logo submission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SponsorPage;
