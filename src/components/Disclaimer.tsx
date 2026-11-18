import React from "react";
import { Info } from "lucide-react";

export interface DisclaimerProps {
  readonly language?: "en" | "hi";
}

export function Disclaimer({ language = "en" }: DisclaimerProps): React.JSX.Element {
  const text =
    language === "hi"
      ? "चिकित्सा अस्वीकरण: यह सेवा केवल जागरूकता और सामान्य मार्गदर्शन के लिए है। यह पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है। सांस लेने में गंभीर तकलीफ होने पर तुरंत चिकित्सक से संपर्क करें।"
      : "Medical Disclaimer: SmogShield provides environmental recommendations and risk modeling for informational purposes only. It is not clinical medical advice. Individuals with acute respiratory distress, severe asthma, or cardiovascular symptoms must seek immediate professional healthcare.";

  return (
    <aside
      aria-label="Medical disclaimer"
      className="my-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <Info
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400"
        aria-hidden="true"
      />
      <p className="leading-relaxed">{text}</p>
    </aside>
  );
}
