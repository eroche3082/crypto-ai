import { useTranslation } from "react-i18next";
import { LineChart, BrainCircuit, Target } from "lucide-react";
import Header from "@/components/Header";
import AIConfiguration from "@/components/AIConfiguration";
import InvestmentAdvisor from "@/components/investment/InvestmentAdvisor";

/**
 * Investment Advisor Page
 * 
 * Provides AI-powered investment recommendations and education
 */
export default function InvestmentAdvisorPage() {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <AIConfiguration />
      <div className="p-4 h-[calc(100vh-132px)] overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit size={24} className="text-primary" />
            {t("investmentAdvisor.title", "Investment Advisor")}
          </h1>
          <p className="text-muted-foreground max-w-[600px]">
            {t("investmentAdvisor.description", "Get personalized investment recommendations, market insights, and educational resources to help you make informed decisions.")}
          </p>
        </div>
        
        <InvestmentAdvisor />
      </div>
    </>
  );
}