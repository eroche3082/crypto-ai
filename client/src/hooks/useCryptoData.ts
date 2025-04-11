import { useQuery } from "@tanstack/react-query";
import { cryptoApi, CryptoData } from "../lib/cryptoApi";

interface UseCryptoDataParams {
  timeFilter?: string;
  limit?: number;
}

export const useCryptoData = ({ timeFilter = "24h", limit = 20 }: UseCryptoDataParams = {}) => {
  return useQuery<CryptoData[]>({
    queryKey: ["cryptoData", timeFilter, limit],
    queryFn: async (): Promise<CryptoData[]> => {
      try {
        // Convert timeFilter string to API parameters
        const includeParams = [];
        if (timeFilter === "24h" || timeFilter === "all") {
          includeParams.push("price_change_percentage_24h");
        }
        if (timeFilter === "7d" || timeFilter === "all") {
          includeParams.push("price_change_percentage_7d");
        }
        if (timeFilter === "14d" || timeFilter === "all") {
          includeParams.push("price_change_percentage_14d");
        }
        if (timeFilter === "30d" || timeFilter === "all") {
          includeParams.push("price_change_percentage_30d");
        }
        
        const data = await cryptoApi.getMarketData({
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: limit,
          page: 1,
          sparkline: true,
          price_change_percentage: includeParams.join(","),
        });
        
        return data;
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        throw error;
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });
};
