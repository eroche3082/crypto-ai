import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Scan } from "lucide-react";
import ChartPatternAnalyzer from "@/components/ChartPatternAnalyzer";

export default function ChartAnalysisPage() {
  return (
    <div className="container py-6 space-y-6 max-w-6xl">
      <PageHeader 
        title="Chart Pattern Recognition" 
        description="Upload cryptocurrency chart images to identify patterns, predict market movements, and get trading insights." 
        icon={<Scan size={24} />}
      />
      
      <div className="grid gap-6">
        <ChartPatternAnalyzer />
      </div>
    </div>
  );
}