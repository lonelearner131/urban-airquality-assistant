"use client";

import React, { useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Disclaimer } from "@/components/Disclaimer";
import { ProfileForm } from "@/components/ProfileForm";
import { AqiSummary } from "@/components/AqiSummary";
import { HourlyChart } from "@/components/HourlyChart";
import { DailyPlan } from "@/components/DailyPlan";
import { IndoorHacks } from "@/components/IndoorHacks";
import { Alternatives } from "@/components/Alternatives";
import { ImpactPanel } from "@/components/ImpactPanel";
import { CommunityActions } from "@/components/CommunityActions";
import { ChatPanel } from "@/components/ChatPanel";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePlan } from "@/hooks/usePlan";
import type { CompletePlan } from "@/schemas/plan";
import type { ProfileInput } from "@/schemas/profile";

function HeroBanner({ language }: { readonly language: "en" | "hi" }): React.JSX.Element {
  return (
    <div className="mx-auto my-2 flex max-w-3xl flex-col gap-2 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
        {language === "hi"
          ? "सर्दियों के गंभीर स्मॉग से अपने परिवार की रक्षा करें"
          : "Protect Your Family from Severe Winter Smog"}
      </h1>
      <p className="text-base text-slate-600 dark:text-slate-300">
        {language === "hi"
          ? "लाइव AQI, वैज्ञानिक घंटे-वार पूर्वानुमान और घरेलू जीवनशैली के आधार पर व्यक्तिगत सुरक्षा योजना।"
          : "Personalized low-emission daily routines, indoor hacks, and quantified impact modeling for smog-affected cities."}
      </p>
    </div>
  );
}

function PlanLoadingSkeleton(): React.JSX.Element {
  return (
    <div aria-live="polite" aria-busy="true" className="mt-6 flex flex-col gap-6">
      <span className="sr-only">Generating personalized air quality plan...</span>
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-60 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

interface DashboardProps {
  readonly plan: CompletePlan;
  readonly language: "en" | "hi";
}

function PlanUpperSection({ plan, language }: DashboardProps): React.JSX.Element {
  return (
    <>
      <AqiSummary
        computedAqi={plan.computedAqi}
        riskAssessment={plan.riskAssessment}
        locationName={plan.locationName}
        isAiGenerated={plan.isAiGenerated}
        language={language}
      />
      <HourlyChart points={plan.hourlyPoints} windows={plan.windows} language={language} />
      <DailyPlan narrative={plan.aiNarrative} language={language} />
      <ImpactPanel
        exposure={plan.exposure}
        impactNarrative={plan.aiNarrative.impactExplainedSimply}
        language={language}
      />
    </>
  );
}

function PlanLowerSection({ plan, language }: DashboardProps): React.JSX.Element {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IndoorHacks
          hacks={plan.aiNarrative.indoorHacksNarrative}
          rules={plan.selectedRules}
          language={language}
        />
        <Alternatives
          alternatives={plan.aiNarrative.sustainableAlternativesNarrative}
          rules={plan.selectedRules}
          language={language}
        />
      </div>
      <CommunityActions
        advisory={plan.aiNarrative.communityAdvisoryNarrative}
        grap={plan.grap}
        locationName={plan.locationName}
        language={language}
      />
      <ChatPanel
        locationName={plan.locationName}
        aqi={plan.computedAqi.value}
        riskTier={plan.riskAssessment.tier}
        summary={plan.aiNarrative.plainSummary}
        language={language}
      />
    </>
  );
}

function PlanResultsDashboard({ plan, language }: DashboardProps): React.JSX.Element {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <PlanUpperSection plan={plan} language={language} />
      <PlanLowerSection plan={plan} language={language} />
    </div>
  );
}

export default function Home(): React.JSX.Element {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const { plan, isLoading, error, fetchPlan } = usePlan();
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleProfileSubmit = async (profile: ProfileInput): Promise<void> => {
    await fetchPlan({ ...profile, preferredLanguage: language });
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header language={language} onLanguageChange={setLanguage} />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8"
      >
        <HeroBanner language={language} />
        <Disclaimer language={language} />
        <ProfileForm onSubmit={handleProfileSubmit} isLoading={isLoading} language={language} />

        {error && (
          <Alert variant="danger" title="Unable to Generate Plan" className="mt-4">
            <p>{error}</p>
          </Alert>
        )}

        {isLoading && <PlanLoadingSkeleton />}

        <div ref={resultsRef} tabIndex={-1} className="outline-none">
          {plan && !isLoading && <PlanResultsDashboard plan={plan} language={language} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
