"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { LocationSearch } from "./LocationSearch";
import {
  BUDGET_OPTIONS,
  COMMUTE_OPTIONS,
  COOKING_OPTIONS,
  HEATING_OPTIONS,
  INITIAL_FORM_STATE,
  type ProfileFormState,
  PURIFIER_OPTIONS,
  toProfileInput,
  VENTILATION_OPTIONS,
} from "./profileFormOptions";
import type { ProfileInput } from "@/schemas/profile";

export interface ProfileFormProps {
  readonly onSubmit: (profile: ProfileInput) => void;
  readonly isLoading?: boolean;
  readonly language?: "en" | "hi";
}

type StateUpdater = <K extends keyof ProfileFormState>(key: K, val: ProfileFormState[K]) => void;

function CheckboxCard({
  label,
  checked,
  onChange,
}: {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (v: boolean) => void;
}): React.JSX.Element {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
      />
      <span className="text-sm text-slate-800 dark:text-slate-200">{label}</span>
    </label>
  );
}

function VulnerabilitiesFieldset({
  isHindi,
  state,
  update,
}: {
  readonly isHindi: boolean;
  readonly state: ProfileFormState;
  readonly update: StateUpdater;
}): React.JSX.Element {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {isHindi ? "संवेदनशील सदस्य (Vulnerable Members)" : "Vulnerable Household Members"}
      </legend>
      <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CheckboxCard label="Children (< 14 yrs)" checked={state.hasChildren} onChange={(v) => update("hasChildren", v)} />
        <CheckboxCard label="Elderly (> 65 yrs)" checked={state.hasElderly} onChange={(v) => update("hasElderly", v)} />
        <CheckboxCard label="Expectant Mother" checked={state.hasPregnancy} onChange={(v) => update("hasPregnancy", v)} />
        <CheckboxCard label="Asthma / COPD History" checked={state.hasRespiratory} onChange={(v) => update("hasRespiratory", v)} />
      </div>
    </fieldset>
  );
}

function RoutineFieldset({
  isHindi,
  state,
  update,
}: {
  readonly isHindi: boolean;
  readonly state: ProfileFormState;
  readonly update: StateUpdater;
}): React.JSX.Element {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {isHindi ? "दैनिक बाहरी गतिविधियाँ" : "Outdoor Routines & Habits"}
      </legend>
      <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <CheckboxCard label="School Run" checked={state.schoolRun} onChange={(v) => update("schoolRun", v)} />
        <CheckboxCard label="Morning Walk" checked={state.morningWalk} onChange={(v) => update("morningWalk", v)} />
        <CheckboxCard label="Outdoor Exercise" checked={state.exercise} onChange={(v) => update("exercise", v)} />
      </div>
    </fieldset>
  );
}

function CommuteAndCookingGrid({
  state,
  update,
}: {
  readonly state: ProfileFormState;
  readonly update: StateUpdater;
}): React.JSX.Element {
  return (
    <>
      <Select
        label="Primary Commute Mode"
        value={state.commuteMode}
        onChange={(e) => update("commuteMode", e.target.value as ProfileInput["commuteMode"])}
        options={COMMUTE_OPTIONS}
      />
      <Select
        label="Cooking Fuel"
        value={state.cookingFuel}
        onChange={(e) => update("cookingFuel", e.target.value as ProfileInput["cookingFuel"])}
        options={COOKING_OPTIONS}
      />
      <Select
        label="Heating Method"
        value={state.heatingMethod}
        onChange={(e) => update("heatingMethod", e.target.value as NonNullable<ProfileInput["heatingMethod"]>)}
        options={HEATING_OPTIONS}
      />
    </>
  );
}

function PurifierAndBudgetGrid({
  state,
  update,
}: {
  readonly state: ProfileFormState;
  readonly update: StateUpdater;
}): React.JSX.Element {
  return (
    <>
      <Select
        label="Air Purifier Status"
        value={state.ownsPurifier}
        onChange={(e) => update("ownsPurifier", e.target.value as ProfileInput["ownsPurifier"])}
        options={PURIFIER_OPTIONS}
      />
      <Select
        label="Ventilation Routine"
        value={state.ventilation}
        onChange={(e) => update("ventilation", e.target.value as ProfileInput["ventilationHabit"])}
        options={VENTILATION_OPTIONS}
      />
      <Select
        label="Budget Flexibility"
        value={state.budget}
        onChange={(e) => update("budget", e.target.value as ProfileInput["budgetLevel"])}
        options={BUDGET_OPTIONS}
      />
    </>
  );
}

function FormHeader({ isHindi }: { readonly isHindi: boolean }): React.JSX.Element {
  return (
    <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {isHindi ? "पारिवारिक प्रोफ़ाइल व जीवनशैली" : "Household & Lifestyle Profile"}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {isHindi
          ? "सटीक सुरक्षा योजना और व्यक्तिगत जोखिम स्तर प्राप्त करने के लिए विवरण भरें।"
          : "Customize low-emission routines and exposure modeling tailored to your household."}
      </p>
    </div>
  );
}

export function ProfileForm({
  onSubmit,
  isLoading = false,
  language = "en",
}: ProfileFormProps): React.JSX.Element {
  const isHindi = language === "hi";
  const [state, setState] = useState<ProfileFormState>(INITIAL_FORM_STATE);
  const update: StateUpdater = (key, val) => setState((prev) => ({ ...prev, [key]: val }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(toProfileInput(state, language));
      }}
      aria-label="Household Air Quality Profile"
      className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <FormHeader isHindi={isHindi} />
      <LocationSearch initialLocationName={state.location.name} onSelectLocation={(l) => update("location", l)} />
      <VulnerabilitiesFieldset isHindi={isHindi} state={state} update={update} />
      <RoutineFieldset isHindi={isHindi} state={state} update={update} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <CommuteAndCookingGrid state={state} update={update} />
        <PurifierAndBudgetGrid state={state} update={update} />
      </div>
      <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
        <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
        {isHindi ? "योजना तैयार करें" : "Generate Action Plan"}
      </Button>
    </form>
  );
}
