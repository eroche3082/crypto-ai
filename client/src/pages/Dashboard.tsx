import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCryptoData } from "@/hooks/useCryptoData";
import CryptoCard from "@/components/CryptoCard";
import Header from "@/components/Header";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CryptoData } from "@/lib/cryptoApi";

const Dashboard = () => {
  const { t } = useTranslation();
  const [timeFilter, setTimeFilter] = useState("24h");
  const { data, isLoading, error, refetch } = useCryptoData({ timeFilter });
  
  const handleTimeFilterChange = (filter: string) => {
    setTimeFilter(filter);
  };
  
  return (
    <div className="flex flex-col h-full overflow-auto pb-8">
      <Header />
      
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("dashboard.subtitle", "Track prices, trends, and news in real-time")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => refetch()}
              title={t("common.refresh")}
            >
              <RefreshCw size={20} />
            </Button>
            <span className="text-xs text-muted-foreground">
              {t("dashboard.lastUpdated", "Last updated")}: {t("dashboard.justNow", "Just now")}
            </span>
          </div>
        </div>
        
        {/* Market Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">{t("dashboard.marketOverview", "Market Overview")}</h2>
          
          <div className="flex gap-2 mb-4">
            <Button 
              variant={timeFilter === "24h" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleTimeFilterChange("24h")}
            >
              24h
            </Button>
            <Button 
              variant={timeFilter === "7d" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleTimeFilterChange("7d")}
            >
              7d
            </Button>
            <Button 
              variant={timeFilter === "1m" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleTimeFilterChange("1m")}
            >
              1m
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-card rounded-lg p-4 h-[140px] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-8 text-error">
              <p className="text-lg mb-2">{t("dashboard.error", "Error loading data")}</p>
              <p className="text-sm">{String(error)}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data?.slice(0, 8).map((crypto: CryptoData) => (
                <CryptoCard 
                  key={crypto.id} 
                  crypto={crypto} 
                  timeFilter={timeFilter}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Featured Chart */}
        {data && data.length > 0 && (
          <div className="bg-card rounded-lg p-4 mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                <span>{data[0].symbol.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{data[0].name} <span className="text-muted-foreground text-sm">{data[0].symbol.toUpperCase()}</span></h3>
                <div className="flex items-center">
                  <span className="text-xl font-bold">${data[0].current_price.toLocaleString()}</span>
                  <span 
                    className={`ml-2 text-sm ${data[0].price_change_percentage_24h >= 0 ? 'text-success' : 'text-error'}`}
                  >
                    {data[0].price_change_percentage_24h >= 0 ? '+' : ''}{data[0].price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm">1D</Button>
              <Button variant="outline" size="sm">1W</Button>
              <Button variant="outline" size="sm">1M</Button>
              <Button variant="outline" size="sm">3M</Button>
              <Button variant="outline" size="sm">1Y</Button>
              <Button variant="outline" size="sm">All</Button>
            </div>
            
            <div className="h-64 bg-secondary/50 rounded-lg mb-4 flex items-center justify-center">
              <p className="text-muted-foreground">Chart visualization would be displayed here</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                <p className="font-semibold">${data[0].market_cap?.toLocaleString()}</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Volume (24h)</p>
                <p className="font-semibold">${data[0].total_volume?.toLocaleString()}</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">High (24h)</p>
                <p className="font-semibold">${data[0].high_24h?.toLocaleString()}</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Low (24h)</p>
                <p className="font-semibold">${data[0].low_24h?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Latest News */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">{t("news.title", "Latest Crypto News")}</h2>
            <Button variant="link" className="text-primary">
              {t("news.viewAll", "View All")}
            </Button>
          </div>
          
          <div className="bg-card rounded-lg p-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-secondary rounded-lg flex-shrink-0"></div>
              <div>
                <h3 className="font-medium mb-1">XRP Price Eyes $2.0 Breakout—Can It Hold and Ignite a Bullish Surge?</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  XRP price started a fresh increase above the $1.850 resistance. The price is now consolidating
                  and must settle above $2.00 for more gains.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">newsbtc • 4/10/2025</span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">AI Summary</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Currency Converter */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">{t("converter.title", "Currency Converter")}</h2>
          </div>
          
          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center justify-center h-28">
              <p className="text-muted-foreground">Currency converter would be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
