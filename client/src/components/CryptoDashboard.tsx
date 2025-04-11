import { useState } from "react";
import { useTranslation } from "react-i18next";
import CryptoCard from "./CryptoCard";
import { useCryptoData } from "../hooks/useCryptoData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CryptoDashboard = () => {
  const { t } = useTranslation();
  const [timeFilter, setTimeFilter] = useState("24h");
  const { data, isLoading, error } = useCryptoData({ timeFilter });
  
  if (isLoading) {
    return (
      <div className="p-4 flex flex-col gap-4 overflow-auto scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-secondary rounded-lg p-4 shadow animate-pulse h-52"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-error">
        <span className="material-icons text-4xl">error_outline</span>
        <p className="mt-2">{t("dashboard.error")}</p>
        <p className="text-sm text-gray-400">{String(error)}</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 flex flex-col gap-4 overflow-auto scrollbar-hide">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("dashboard.title")}</h2>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder={t("dashboard.timeFilter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24h</SelectItem>
            <SelectItem value="7d">7d</SelectItem>
            <SelectItem value="14d">14d</SelectItem>
            <SelectItem value="30d">30d</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.map((crypto) => (
          <CryptoCard 
            key={crypto.id} 
            crypto={crypto} 
            timeFilter={timeFilter}
          />
        ))}
      </div>
    </div>
  );
};

export default CryptoDashboard;
