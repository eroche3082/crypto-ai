import { memo } from "react";
import { useTranslation } from "react-i18next";
import PriceChart from "./PriceChart";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Crypto background colors for icons
const cryptoBgColors: Record<string, string> = {
  BTC: "bg-[#F7931A]/20",  // Bitcoin orange
  ETH: "bg-[#627EEA]/20",  // Ethereum blue
  USDT: "bg-[#26A17B]/20", // Tether green
  XRP: "bg-[#23292F]/20",  // Ripple black
  BNB: "bg-[#F3BA2F]/20",  // Binance yellow
  USDC: "bg-[#2775CA]/20", // USD Coin blue
  SOL: "bg-[#9945FF]/20",  // Solana purple
  DOGE: "bg-[#C2A633]/20", // Dogecoin gold
  ADA: "bg-[#0033AD]/20",  // Cardano blue
  DOT: "bg-[#E6007A]/20",  // Polkadot pink
  // Add more as needed
};

interface CryptoCardProps {
  crypto: {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d?: number;
    price_change_percentage_14d?: number;
    price_change_percentage_30d?: number;
    sparkline_in_7d?: { price: number[] };
  };
  timeFilter: string;
  onClick?: () => void;
  active?: boolean;
}

const CryptoCard = ({ crypto, timeFilter, onClick, active = false }: CryptoCardProps) => {
  const { t } = useTranslation();
  
  const getPercentageChange = () => {
    switch (timeFilter) {
      case "7d":
        return crypto.price_change_percentage_7d || 0;
      case "1m":
      case "30d":
        return crypto.price_change_percentage_30d || 0;
      default:
        return crypto.price_change_percentage_24h || 0;
    }
  };
  
  const percentageChange = getPercentageChange();
  const isPositive = percentageChange >= 0;
  const symbol = crypto.symbol.toUpperCase();
  const bgColor = cryptoBgColors[symbol] || "bg-gray-500/20";
  
  return (
    <div 
      className={cn(
        "crypto-card bg-card rounded-lg p-4 shadow hover:shadow-md transition-all cursor-pointer",
        active && "ring-1 ring-primary"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center mr-3`}>
            <span className="font-semibold text-sm">{symbol.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold">{crypto.name}</h3>
            <p className="text-xs text-muted-foreground">{symbol}</p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-primary transition-colors">
          <Star size={16} />
        </button>
      </div>
      
      <div className="flex justify-between items-end mb-3">
        <div className="text-xl font-bold">${crypto.current_price.toLocaleString()}</div>
        <div 
          className={`text-sm ${isPositive ? 'text-success' : 'text-error'}`}
        >
          {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
        </div>
      </div>
      
      {/* Chart placeholder - in a real application this would be a proper chart component */}
      <div className="h-12 w-full bg-card relative overflow-hidden">
        <div 
          className={`absolute inset-0 ${isPositive ? 'bg-success/10' : 'bg-error/10'} flex items-center justify-center`}
        >
          <div className={`h-px w-full ${isPositive ? 'bg-success/30' : 'bg-error/30'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default memo(CryptoCard);
