import { useMemo } from "react";

interface PriceChartProps {
  data: number[];
  isPositive: boolean;
  timeFilter: string;
}

const PriceChart = ({ data, isPositive, timeFilter }: PriceChartProps) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate some placeholder data if real data is not available
      const length = timeFilter === "24h" ? 24 : timeFilter === "7d" ? 7 : timeFilter === "14d" ? 14 : 30;
      return Array.from({ length }, (_, i) => 50 + Math.random() * 10 * Math.sin(i / (length / 5)));
    }
    
    // Filter data based on time filter
    const filterMap: Record<string, number> = {
      "24h": 24,
      "7d": 168, // 7 * 24
      "14d": 336, // 14 * 24
      "30d": 720, // 30 * 24
    };
    
    const pointsToTake = filterMap[timeFilter] || 24;
    const step = Math.max(1, Math.floor(data.length / pointsToTake));
    
    return data.filter((_, i) => i % step === 0).slice(0, pointsToTake);
  }, [data, timeFilter]);
  
  // Normalize data for the SVG viewBox
  const normalizedData = useMemo(() => {
    if (!chartData.length) return "";
    
    const min = Math.min(...chartData);
    const max = Math.max(...chartData);
    const range = max - min || 1;
    
    // Scale points to fit in the 0-60 range for height
    const points = chartData.map((price, i) => {
      const x = (i / (chartData.length - 1)) * 200;
      const y = 60 - ((price - min) / range) * 50;
      return `${x},${y}`;
    });
    
    return `M${points.join(" L")}`;
  }, [chartData]);
  
  const color = isPositive ? "#10B981" : "#EF4444"; // Success green or error red
  
  return (
    <svg viewBox="0 0 200 60" className="w-full h-full">
      <path
        d={normalizedData}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
};

export default PriceChart;
