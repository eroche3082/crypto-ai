import InvestmentAdvisorComponent from "@/components/InvestmentAdvisor";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

export default function InvestmentAdvisor() {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>{t("investmentAdvisor.pageTitle", "Investment Advisor - CryptoBot")}</title>
      </Helmet>
      
      <InvestmentAdvisorComponent />
    </div>
  );
}