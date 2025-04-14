import { PageHeader } from "@/components/PageHeader";
import { Image } from "lucide-react";
import NFTCollectionAnalyzer from "@/components/NFTCollectionAnalyzer";

export default function NFTExplorerPage() {
  return (
    <div className="container py-6 space-y-6 max-w-6xl">
      <PageHeader 
        title="NFT Collection Evaluator" 
        description="Analyze, evaluate, and get insights about NFT collections using AI-powered analytics and market data." 
        icon={<Image size={24} />}
      />
      
      <div className="grid gap-6">
        <NFTCollectionAnalyzer />
      </div>
    </div>
  );
}