import { useState, useEffect } from "react";
import { useCryptoData } from "./useCryptoData";

interface PortfolioAsset {
  symbol: string;
  amount: number;
  buyPrice?: number;
  buyDate?: string;
}

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const { data: cryptoData } = useCryptoData({});
  
  // Load portfolio from localStorage on initialization
  useEffect(() => {
    const savedPortfolio = localStorage.getItem("cryptopulse-portfolio");
    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio));
      } catch (error) {
        console.error("Error parsing saved portfolio:", error);
      }
    }
  }, []);
  
  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cryptopulse-portfolio", JSON.stringify(portfolio));
  }, [portfolio]);
  
  const addAsset = (symbol: string, amount: number, buyPrice?: number) => {
    // Check if asset already exists in portfolio
    const existingAssetIndex = portfolio.findIndex(asset => asset.symbol === symbol);
    
    if (existingAssetIndex !== -1) {
      // Update existing asset
      const updatedPortfolio = [...portfolio];
      updatedPortfolio[existingAssetIndex] = {
        ...updatedPortfolio[existingAssetIndex],
        amount: updatedPortfolio[existingAssetIndex].amount + amount,
      };
      setPortfolio(updatedPortfolio);
    } else {
      // Add new asset
      setPortfolio([
        ...portfolio,
        {
          symbol,
          amount,
          buyPrice: buyPrice || cryptoData?.find(c => c.symbol === symbol)?.current_price,
          buyDate: new Date().toISOString(),
        },
      ]);
    }
  };
  
  const removeAsset = (symbol: string) => {
    setPortfolio(portfolio.filter(asset => asset.symbol !== symbol));
  };
  
  const updateAsset = (symbol: string, amount: number) => {
    setPortfolio(
      portfolio.map(asset => {
        if (asset.symbol === symbol) {
          return { ...asset, amount };
        }
        return asset;
      })
    );
  };
  
  // Calculate total portfolio value
  const portfolioValue = portfolio.reduce((total, asset) => {
    const crypto = cryptoData?.find(c => c.symbol === asset.symbol);
    if (crypto) {
      return total + (crypto.current_price * asset.amount);
    }
    return total;
  }, 0);
  
  // Calculate portfolio ROI
  const portfolioROI = (() => {
    const initialInvestment = portfolio.reduce((total, asset) => {
      if (asset.buyPrice) {
        return total + (asset.buyPrice * asset.amount);
      }
      return total;
    }, 0);
    
    if (initialInvestment <= 0) return 0;
    
    return ((portfolioValue - initialInvestment) / initialInvestment) * 100;
  })();
  
  return {
    portfolio,
    addAsset,
    removeAsset,
    updateAsset,
    portfolioValue,
    portfolioROI,
  };
};
