import React from 'react';
import Header from '@/components/Header';
import TwitterSentimentAnalysis from '@/components/TwitterSentimentAnalysis';
import { useTranslation } from "react-i18next";

const TwitterSentiment: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <Header title={t("twitterSentiment.title", "Twitter/X Sentiment")} 
              subtitle={t("twitterSentiment.subtitle", "Análisis en tiempo real del sentimiento en redes sociales para criptomonedas")} />
      <div className="flex-1 overflow-auto p-4">
        <TwitterSentimentAnalysis />
      </div>
    </div>
  );
};

export default TwitterSentiment;