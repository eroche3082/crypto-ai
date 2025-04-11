import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePortfolio } from "../hooks/usePortfolio";
import { useCryptoData } from "../hooks/useCryptoData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddAssetDialogProps {
  onAdd: (symbol: string, amount: number) => void;
  availableCryptos: Array<{ symbol: string; name: string }>;
}

const AddAssetDialog = ({ onAdd, availableCryptos }: AddAssetDialogProps) => {
  const { t } = useTranslation();
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  
  const handleAdd = () => {
    if (selectedCrypto && amount && Number(amount) > 0) {
      onAdd(selectedCrypto, Number(amount));
      setSelectedCrypto("");
      setAmount("");
      setOpen(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="mb-4">
          <span className="material-icons text-sm mr-1">add</span>
          {t("portfolio.addAsset")}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-secondary text-lightText border-gray-700">
        <DialogHeader>
          <DialogTitle>{t("portfolio.addNewAsset")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label className="text-sm mb-1 block">{t("portfolio.selectCrypto")}</label>
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger>
                <SelectValue placeholder={t("portfolio.selectCrypto")} />
              </SelectTrigger>
              <SelectContent>
                {availableCryptos.map((crypto) => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    {crypto.name} ({crypto.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm mb-1 block">{t("portfolio.amount")}</label>
            <Input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.0001"
              min="0"
            />
          </div>
          <Button onClick={handleAdd}>
            {t("portfolio.add")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PortfolioSimulator = () => {
  const { t } = useTranslation();
  const { portfolio, addAsset, removeAsset, portfolioValue, portfolioROI } = usePortfolio();
  const { data: cryptoData } = useCryptoData({});
  const [timeframe, setTimeframe] = useState("1d");
  const [showPortfolioDistribution, setShowPortfolioDistribution] = useState(true);
  
  const getAssetValue = (symbol: string, amount: number) => {
    const crypto = cryptoData?.find(c => c.symbol === symbol);
    return crypto ? crypto.current_price * amount : 0;
  };
  
  const getPercentChange = (symbol: string) => {
    const crypto = cryptoData?.find(c => c.symbol === symbol);
    return crypto ? crypto.price_change_percentage_24h : 0;
  };
  
  // Calculate portfolio distribution percentages
  const portfolioDistribution = portfolio.map(asset => {
    const value = getAssetValue(asset.symbol, asset.amount);
    const percentage = portfolioValue > 0 ? (value / portfolioValue) * 100 : 0;
    return {
      ...asset,
      value,
      percentage
    };
  }).sort((a, b) => b.percentage - a.percentage);
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t("portfolio.title", "Portfolio Simulator")}</h2>
          <p className="text-sm text-gray-400">{t("portfolio.subtitle", "Track and simulate your crypto investments")}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">${portfolioValue.toLocaleString()}</p>
          <p className={`text-sm ${portfolioROI >= 0 ? 'text-emerald-500' : 'text-rose-500'} font-medium`}>
            {portfolioROI >= 0 ? '+' : ''}{portfolioROI.toFixed(2)}% ROI
          </p>
        </div>
      </div>
      
      <div className="bg-secondary/50 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant={timeframe === "1d" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setTimeframe("1d")}
            >
              24H
            </Button>
            <Button 
              variant={timeframe === "7d" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setTimeframe("7d")}
            >
              7D
            </Button>
            <Button 
              variant={timeframe === "30d" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setTimeframe("30d")}
            >
              30D
            </Button>
            <Button 
              variant={timeframe === "1y" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setTimeframe("1y")}
            >
              1Y
            </Button>
          </div>
          
          <AddAssetDialog 
            onAdd={addAsset}
            availableCryptos={cryptoData?.map(c => ({ symbol: c.symbol, name: c.name })) || []}
          />
        </div>
      </div>
      
      {/* Portfolio stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">{t("portfolio.totalAssets", "Total Assets")}</p>
          <p className="text-2xl font-semibold">{portfolio.length}</p>
        </div>
        
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">{t("portfolio.bestPerformer", "Best Performer")}</p>
          {portfolio.length > 0 ? (
            <div className="flex items-center">
              <p className="text-xl font-semibold mr-2">
                {portfolio.reduce((best, current) => {
                  const bestChange = getPercentChange(best.symbol);
                  const currentChange = getPercentChange(current.symbol);
                  return currentChange > bestChange ? current : best;
                }, portfolio[0]).symbol}
              </p>
              <p className="text-emerald-500">
                +{Math.max(...portfolio.map(asset => getPercentChange(asset.symbol))).toFixed(2)}%
              </p>
            </div>
          ) : (
            <p className="text-lg">-</p>
          )}
        </div>
        
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">{t("portfolio.worstPerformer", "Worst Performer")}</p>
          {portfolio.length > 0 ? (
            <div className="flex items-center">
              <p className="text-xl font-semibold mr-2">
                {portfolio.reduce((worst, current) => {
                  const worstChange = getPercentChange(worst.symbol);
                  const currentChange = getPercentChange(current.symbol);
                  return currentChange < worstChange ? current : worst;
                }, portfolio[0]).symbol}
              </p>
              <p className="text-rose-500">
                {Math.min(...portfolio.map(asset => getPercentChange(asset.symbol))).toFixed(2)}%
              </p>
            </div>
          ) : (
            <p className="text-lg">-</p>
          )}
        </div>
      </div>
      
      {/* Tabs for different views */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            className={showPortfolioDistribution ? "border-b-2 border-primary rounded-none" : ""}
            onClick={() => setShowPortfolioDistribution(true)}
          >
            {t("portfolio.assets", "Assets")}
          </Button>
          <Button
            variant="ghost"
            className={!showPortfolioDistribution ? "border-b-2 border-primary rounded-none" : ""}
            onClick={() => setShowPortfolioDistribution(false)}
          >
            {t("portfolio.distribution", "Distribution")}
          </Button>
        </div>
      </div>
      
      {portfolio.length === 0 ? (
        <div className="bg-secondary rounded-lg p-8 text-center">
          <span className="material-icons text-4xl text-gray-500 mb-2">account_balance_wallet</span>
          <h3 className="text-lg font-medium mb-2">{t("portfolio.empty", "Your portfolio is empty")}</h3>
          <p className="text-sm text-gray-400 mb-4">{t("portfolio.emptyDesc", "Add some crypto assets to start tracking your portfolio")}</p>
        </div>
      ) : showPortfolioDistribution ? (
        <div className="grid gap-4">
          {portfolio.map((asset) => (
            <div key={asset.symbol} className="bg-secondary rounded-lg p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                  <span className="material-icons">toll</span>
                </div>
                <div>
                  <h3 className="font-medium">{asset.symbol.toUpperCase()}</h3>
                  <p className="text-xs text-gray-400">{asset.amount.toFixed(6)} {asset.symbol.toUpperCase()}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <p className="font-medium">${getAssetValue(asset.symbol, asset.amount).toLocaleString()}</p>
                <div className={`text-xs ${getPercentChange(asset.symbol) >= 0 ? 'text-emerald-500' : 'text-rose-500'} flex items-center`}>
                  <span className="material-icons text-xs mr-1">
                    {getPercentChange(asset.symbol) >= 0 ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                  {getPercentChange(asset.symbol) >= 0 ? '+' : ''}{getPercentChange(asset.symbol).toFixed(2)}%
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAsset(asset.symbol)}
                className="text-gray-400 hover:text-error"
              >
                <span className="material-icons">delete</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-secondary rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">{t("portfolio.portfolioDistribution", "Portfolio Distribution")}</h3>
          
          <div className="mb-6">
            {portfolioDistribution.map((asset) => (
              <div key={asset.symbol} className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{asset.symbol.toUpperCase()}</span>
                  <span className="text-sm">{asset.percentage.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${asset.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {portfolioDistribution.slice(0, 4).map((asset) => (
              <div key={`dist-${asset.symbol}`} className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400">{asset.symbol.toUpperCase()}</p>
                <p className="text-lg font-medium">{asset.percentage.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioSimulator;
