import React from 'react';
import TwitterSentimentAnalysis from '@/components/TwitterSentimentAnalysis';
import { useTranslation } from "react-i18next";

const TwitterSentiment: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <div className="bg-background border-b border-border px-4 py-3">
        <h1 className="text-xl font-semibold">{t("twitterSentiment.title", "Twitter/X Sentiment")}</h1>
        <p className="text-sm text-muted-foreground">{t("twitterSentiment.subtitle", "Real-time sentiment analysis of social media for cryptocurrencies")}</p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <TwitterSentimentAnalysis />
      </div>
    </div>
  );
};

export default TwitterSentiment;