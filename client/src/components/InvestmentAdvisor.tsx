import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  Brain, Coins, TrendingUp, Clock, BarChart4, 
  Shield, CircleDollarSign, ArrowRight, Briefcase, 
  PieChart as PieChartIcon, Lock, Leaf, Sparkles, InfoIcon, RefreshCw
} from "lucide-react";
import { useGemini } from "@/contexts/GeminiContext";
import { useToast } from "@/hooks/use-toast";

// Define investment profile schema
const investmentProfileSchema = z.object({
  riskTolerance: z.enum(["conservative", "moderate", "aggressive", "very_aggressive"]),
  investmentHorizon: z.enum(["short_term", "medium_term", "long_term", "very_long_term"]),
  initialInvestment: z.number().min(0),
  monthlyContribution: z.number().min(0),
  investmentPurpose: z.enum(["capital_preservation", "balanced_growth", "wealth_accumulation", "risk_taking"]),
  ageBracket: z.enum(["under_30", "30_to_45", "46_to_60", "over_60"]),
  incomeStability: z.enum(["unstable", "somewhat_stable", "stable", "very_stable"]),
  financialKnowledge: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  interestCategories: z.array(z.string()).min(1, "Select at least one category"),
  taxes: z.enum(["low", "medium", "high"]),
  retirementFocus: z.boolean().default(false),
  esgPreference: z.boolean().default(false),
});

// TS type from schema
type InvestmentProfile = z.infer<typeof investmentProfileSchema>;

// Define strategy result interface
interface InvestmentStrategy {
  allocationPercentages: {
    [key: string]: number;
  };
  expectedReturns: {
    conservative: number;
    expected: number;
    optimistic: number;
  };
  projections: Array<{
    year: number;
    conservative: number;
    expected: number;
    optimistic: number;
  }>;
  riskLevel: number;
  recommendations: Array<{
    category: string;
    tokens: Array<{
      symbol: string;
      name: string;
      percentage: number;
      rationale: string;
    }>;
  }>;
  geminiAnalysis: string;
}

const InvestmentAdvisor: React.FC = () => {
  const { t } = useTranslation();
  const { generateResponse } = useGemini();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [strategy, setStrategy] = useState<InvestmentStrategy | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(100 / 5); // 5 steps in total
  const [activeTab, setActiveTab] = useState("allocation");

  // Initialize form with defaults
  const form = useForm<InvestmentProfile>({
    resolver: zodResolver(investmentProfileSchema),
    defaultValues: {
      riskTolerance: "moderate",
      investmentHorizon: "medium_term",
      initialInvestment: 10000,
      monthlyContribution: 500,
      investmentPurpose: "balanced_growth",
      ageBracket: "30_to_45",
      incomeStability: "stable",
      financialKnowledge: "intermediate",
      interestCategories: ["defi", "large_cap"],
      taxes: "medium",
      retirementFocus: false,
      esgPreference: false,
    },
  });

  // Update progress bar when step changes
  useEffect(() => {
    setProgressPercentage((currentStep / 5) * 100);
  }, [currentStep]);

  // Risk tolerance mapping
  const riskToleranceOptions = [
    { value: "conservative", label: t("investmentAdvisor.conservative", "Conservative"), 
      description: t("investmentAdvisor.conservativeDesc", "Minimal risk, capital preservation focus") },
    { value: "moderate", label: t("investmentAdvisor.moderate", "Moderate"), 
      description: t("investmentAdvisor.moderateDesc", "Balanced approach with moderate growth") },
    { value: "aggressive", label: t("investmentAdvisor.aggressive", "Aggressive"), 
      description: t("investmentAdvisor.aggressiveDesc", "Focused on growth, willing to accept volatility") },
    { value: "very_aggressive", label: t("investmentAdvisor.veryAggressive", "Very Aggressive"), 
      description: t("investmentAdvisor.veryAggressiveDesc", "Maximum growth potential, high volatility tolerance") },
  ];

  // Investment horizon mapping
  const horizonOptions = [
    { value: "short_term", label: t("investmentAdvisor.shortTerm", "Short Term (< 2 years)") },
    { value: "medium_term", label: t("investmentAdvisor.mediumTerm", "Medium Term (2-5 years)") },
    { value: "long_term", label: t("investmentAdvisor.longTerm", "Long Term (5-10 years)") },
    { value: "very_long_term", label: t("investmentAdvisor.veryLongTerm", "Very Long Term (10+ years)") },
  ];

  // Investment purpose mapping
  const purposeOptions = [
    { value: "capital_preservation", label: t("investmentAdvisor.capitalPreservation", "Capital Preservation") },
    { value: "balanced_growth", label: t("investmentAdvisor.balancedGrowth", "Balanced Growth") },
    { value: "wealth_accumulation", label: t("investmentAdvisor.wealthAccumulation", "Wealth Accumulation") },
    { value: "risk_taking", label: t("investmentAdvisor.riskTaking", "High Risk, High Reward") },
  ];

  // Age bracket mapping
  const ageOptions = [
    { value: "under_30", label: t("investmentAdvisor.under30", "Under 30") },
    { value: "30_to_45", label: t("investmentAdvisor.30to45", "30 to 45") },
    { value: "46_to_60", label: t("investmentAdvisor.46to60", "46 to 60") },
    { value: "over_60", label: t("investmentAdvisor.over60", "Over 60") },
  ];

  // Income stability mapping
  const incomeOptions = [
    { value: "unstable", label: t("investmentAdvisor.unstable", "Unstable/Variable") },
    { value: "somewhat_stable", label: t("investmentAdvisor.somewhatStable", "Somewhat Stable") },
    { value: "stable", label: t("investmentAdvisor.stable", "Stable") },
    { value: "very_stable", label: t("investmentAdvisor.veryStable", "Very Stable") },
  ];

  // Financial knowledge mapping
  const knowledgeOptions = [
    { value: "beginner", label: t("investmentAdvisor.beginner", "Beginner") },
    { value: "intermediate", label: t("investmentAdvisor.intermediate", "Intermediate") },
    { value: "advanced", label: t("investmentAdvisor.advanced", "Advanced") },
    { value: "expert", label: t("investmentAdvisor.expert", "Expert") },
  ];

  // Interest categories mapping
  const categoryOptions = [
    { id: "large_cap", label: t("investmentAdvisor.largeCap", "Large Cap (BTC, ETH)") },
    { id: "mid_cap", label: t("investmentAdvisor.midCap", "Mid Cap Altcoins") },
    { id: "small_cap", label: t("investmentAdvisor.smallCap", "Small Cap / New Projects") },
    { id: "defi", label: t("investmentAdvisor.defi", "DeFi Protocols") },
    { id: "nft", label: t("investmentAdvisor.nft", "NFTs & Gaming") },
    { id: "staking", label: t("investmentAdvisor.staking", "Staking & Yield") },
    { id: "meme", label: t("investmentAdvisor.meme", "Meme Coins") },
    { id: "esg", label: t("investmentAdvisor.esg", "ESG / Sustainable") },
    { id: "metaverse", label: t("investmentAdvisor.metaverse", "Metaverse / Virtual Worlds") },
  ];

  // Tax environment mapping
  const taxOptions = [
    { value: "low", label: t("investmentAdvisor.lowTax", "Low Tax Environment") },
    { value: "medium", label: t("investmentAdvisor.mediumTax", "Medium Tax Environment") },
    { value: "high", label: t("investmentAdvisor.highTax", "High Tax Environment") },
  ];

  // Generate portfolio strategy based on profile
  const generateInvestmentStrategy = async (profile: InvestmentProfile) => {
    setLoadingStrategy(true);

    try {
      // Create prompt for Gemini API
      const prompt = `Create a detailed cryptocurrency investment strategy based on the following investor profile:
      - Risk Tolerance: ${profile.riskTolerance}
      - Investment Horizon: ${profile.investmentHorizon}
      - Initial Investment: $${profile.initialInvestment}
      - Monthly Contribution: $${profile.monthlyContribution}
      - Investment Purpose: ${profile.investmentPurpose}
      - Age Bracket: ${profile.ageBracket}
      - Income Stability: ${profile.incomeStability}
      - Financial Knowledge: ${profile.financialKnowledge}
      - Interest Categories: ${profile.interestCategories.join(", ")}
      - Tax Environment: ${profile.taxes}
      - Retirement Focus: ${profile.retirementFocus ? "Yes" : "No"}
      - ESG Preference: ${profile.esgPreference ? "Yes" : "No"}
      
      Return your response as a detailed JSON object with the following structure:
      {
        "allocationPercentages": { "category1": percentage, "category2": percentage, ... },
        "expectedReturns": { "conservative": number, "expected": number, "optimistic": number },
        "projections": [{ "year": 1, "conservative": value, "expected": value, "optimistic": value }, ...],
        "riskLevel": number (1-10),
        "recommendations": [
          { 
            "category": "categoryName", 
            "tokens": [
              { "symbol": "symbol", "name": "name", "percentage": number, "rationale": "short explanation" }
            ]
          }
        ],
        "geminiAnalysis": "detailed text explanation of the strategy"
      }
      
      Guidelines:
      - Include at least 5 years of projections with compounded returns
      - Allocate percentages across Bitcoin (BTC), Ethereum (ETH), and at least 3-5 other cryptocurrencies
      - Base allocations on risk profile, with more conservative profiles having higher BTC/ETH percentages
      - Include specific token recommendations based on their interest categories
      - Consider tax implications in your recommendations
      - Use realistic return projections based on historical crypto market performance
      - Provide a detailed explanation in the geminiAnalysis field
      
      IMPORTANT: Return only the valid JSON with no additional text or formatting. Ensure all fields match the structure exactly.`;

      // Use Gemini to generate strategy
      const emptyMessages: any[] = []; // No chat history needed for this query
      const response = await generateResponse(prompt, emptyMessages);
      
      try {
        // Parse the response (extract JSON if text wrapped)
        const jsonResponseMatch = response.match(/```json\n([\s\S]*)\n```/) || 
                               response.match(/```\n([\s\S]*)\n```/) ||
                               response.match(/{[\s\S]*}/);
                               
        const jsonText = jsonResponseMatch ? jsonResponseMatch[0].replace(/```json\n|```\n|```/g, '') : response;
        const parsedStrategy: InvestmentStrategy = JSON.parse(jsonText);
        
        // Validate the structure
        if (!parsedStrategy.allocationPercentages || 
            !parsedStrategy.expectedReturns || 
            !parsedStrategy.projections || 
            !parsedStrategy.recommendations) {
          throw new Error("Invalid strategy structure returned from AI");
        }
        
        setStrategy(parsedStrategy);
        setActiveTab("allocation"); // Reset to first tab
        setCurrentStep(5); // Move to the strategy display step
        
        toast({
          title: t("investmentAdvisor.strategyReady", "Investment Strategy Ready"),
          description: t("investmentAdvisor.strategyReadyDesc", "Your personalized investment strategy has been generated."),
        });
      } catch (parseError) {
        console.error("Error parsing Gemini strategy response:", parseError);
        console.log("Raw response:", response);
        
        toast({
          variant: "destructive",
          title: t("investmentAdvisor.parsingError", "Processing Error"),
          description: t("investmentAdvisor.parsingErrorDesc", "Could not process the AI response. Please try again later."),
        });
      }
    } catch (error) {
      console.error("Error generating investment strategy:", error);
      
      toast({
        variant: "destructive",
        title: t("investmentAdvisor.generationError", "Generation Error"),
        description: t("investmentAdvisor.generationErrorDesc", "An error occurred while generating your investment strategy."),
      });
    } finally {
      setLoadingStrategy(false);
    }
  };

  // Handle form submission
  const onSubmit = (data: InvestmentProfile) => {
    console.log("Investment profile submitted:", data);
    generateInvestmentStrategy(data);
  };

  // Navigation buttons
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 4) {
      form.handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Reset the form and start over
  const resetForm = () => {
    form.reset();
    setCurrentStep(1);
    setStrategy(null);
  };

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  // Display allocation chart
  const renderAllocationChart = () => {
    if (!strategy) return null;
    
    const data = Object.entries(strategy.allocationPercentages).map(([name, value]) => ({
      name,
      value
    }));
    
    const COLORS = [
      '#FF8042', '#0088FE', '#00C49F', '#FFBB28', 
      '#FF00FF', '#36A2EB', '#8884D8', '#4BC0C0', 
      '#FF6384', '#C9CB3F'
    ];
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
          <Legend />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    );
  };

  // Display projection chart
  const renderProjectionChart = () => {
    if (!strategy) return null;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={strategy.projections}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(value) => `$${(value / 1000)}k`} />
          <Tooltip formatter={(value) => [formatCurrency(value as number), 'Portfolio Value']} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="conservative" 
            stackId="1"
            stroke="#8884d8" 
            fill="#8884d880" 
            name={t("investmentAdvisor.conservative", "Conservative")} 
          />
          <Area 
            type="monotone" 
            dataKey="expected" 
            stackId="2"
            stroke="#82ca9d" 
            fill="#82ca9d80" 
            name={t("investmentAdvisor.expected", "Expected")} 
          />
          <Area 
            type="monotone" 
            dataKey="optimistic" 
            stackId="3"
            stroke="#ffc658" 
            fill="#ffc65880" 
            name={t("investmentAdvisor.optimistic", "Optimistic")} 
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // Render the appropriate step content
  const renderStepContent = () => {
    // If strategy is generated, show result
    if (currentStep === 5 && strategy) {
      return (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{t("investmentAdvisor.yourStrategy", "Your Personalized Strategy")}</CardTitle>
                <CardDescription>
                  {t("investmentAdvisor.riskLevelDesc", "Risk Level")}: 
                  <Badge className="ml-2" variant={
                    strategy.riskLevel <= 3 ? "outline" : 
                    strategy.riskLevel <= 6 ? "secondary" : 
                    "default"
                  }>
                    {strategy.riskLevel}/10
                  </Badge>
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetForm}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                {t("investmentAdvisor.startOver", "Start Over")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="allocation">
                  <BarChart4 className="h-4 w-4 mr-2" />
                  {t("investmentAdvisor.allocation", "Allocation")}
                </TabsTrigger>
                <TabsTrigger value="projections">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t("investmentAdvisor.projections", "Projections")}
                </TabsTrigger>
                <TabsTrigger value="recommendations">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("investmentAdvisor.recommendations", "Recommendations")}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="allocation" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("investmentAdvisor.assetAllocation", "Asset Allocation")}
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(strategy.allocationPercentages).map(([category, percentage]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("investmentAdvisor.expectedReturns", "Expected Returns")}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-muted/50">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm">
                          {t("investmentAdvisor.conservative", "Conservative")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">
                          {strategy.expectedReturns.conservative}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/10 border-primary/20">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm">
                          {t("investmentAdvisor.expected", "Expected")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold text-primary">
                          {strategy.expectedReturns.expected}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm">
                          {t("investmentAdvisor.optimistic", "Optimistic")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">
                          {strategy.expectedReturns.optimistic}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="projections" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("investmentAdvisor.portfolioProjections", "Portfolio Projections")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("investmentAdvisor.projectionsDesc", "Estimated portfolio value over time based on your investment profile.")}
                  </p>
                  {renderProjectionChart()}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">{t("investmentAdvisor.year", "Year")}</th>
                        <th className="text-right py-2">{t("investmentAdvisor.conservative", "Conservative")}</th>
                        <th className="text-right py-2">{t("investmentAdvisor.expected", "Expected")}</th>
                        <th className="text-right py-2">{t("investmentAdvisor.optimistic", "Optimistic")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {strategy.projections.map((year) => (
                        <tr key={year.year} className="border-b">
                          <td className="py-2">{year.year}</td>
                          <td className="text-right py-2">{formatCurrency(year.conservative)}</td>
                          <td className="text-right py-2 font-medium">{formatCurrency(year.expected)}</td>
                          <td className="text-right py-2">{formatCurrency(year.optimistic)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("investmentAdvisor.specificRecommendations", "Specific Recommendations")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("investmentAdvisor.recommendationsDesc", "Suggested tokens based on your investment profile and market conditions.")}
                  </p>
                  
                  {strategy.recommendations.map((category) => (
                    <div key={category.category} className="mb-6">
                      <h4 className="text-md font-medium mb-2 flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {category.category}
                        </Badge>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.tokens.map((token) => (
                          <Card key={token.symbol} className="overflow-hidden">
                            <div className="flex p-4">
                              <div className="flex-1">
                                <h5 className="font-medium">{token.name} <span className="text-sm text-muted-foreground">({token.symbol})</span></h5>
                                <p className="text-sm text-muted-foreground mt-1">{token.rationale}</p>
                              </div>
                              <div className="ml-4">
                                <Badge>{token.percentage}%</Badge>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Card className="bg-muted/40 mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">{t("investmentAdvisor.analysis", "Strategy Analysis")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-line">{strategy.geminiAnalysis}</p>
                  </CardContent>
                </Card>
                
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 mt-4">
                  <div className="flex">
                    <InfoIcon className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">
                        {t("investmentAdvisor.disclaimer", "Important Disclaimer")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("investmentAdvisor.disclaimerText", "This is an AI-generated investment strategy for educational purposes only. It does not constitute financial advice. Always do your own research and consider consulting with a qualified financial advisor before making investment decisions.")}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button onClick={resetForm} className="w-full">
              {t("investmentAdvisor.createNewStrategy", "Create a New Strategy")}
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // Otherwise show the questions
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {t("investmentAdvisor.step1Title", "Investment Goals & Risk Profile")}
            </h2>
            
            <FormField
              control={form.control}
              name="riskTolerance"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>{t("investmentAdvisor.riskToleranceLabel", "What is your risk tolerance?")}</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {riskToleranceOptions.map((option) => (
                      <Card 
                        key={option.value}
                        className={`cursor-pointer transition-all ${field.value === option.value ? "border-primary" : "hover:border-primary/50"}`}
                        onClick={() => form.setValue("riskTolerance", option.value as any)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem 
                              id={`risk-${option.value}`} 
                              value={option.value} 
                              checked={field.value === option.value}
                              className="mt-1"
                            />
                            <div>
                              <label 
                                htmlFor={`risk-${option.value}`}
                                className="font-medium block mb-1"
                              >
                                {option.label}
                              </label>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="investmentHorizon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("investmentAdvisor.investmentHorizonLabel", "How long do you plan to invest?")}
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("investmentAdvisor.selectHorizon", "Select investment horizon")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {horizonOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="investmentPurpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("investmentAdvisor.investmentPurposeLabel", "What is your primary investment goal?")}
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("investmentAdvisor.selectPurpose", "Select investment purpose")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {purposeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {t("investmentAdvisor.step2Title", "Investment Amount & Contribution")}
            </h2>
            
            <FormField
              control={form.control}
              name="initialInvestment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("investmentAdvisor.initialInvestmentLabel", "Initial investment amount (USD)")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input 
                        type="number" 
                        min={0}
                        className="pl-7"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t("investmentAdvisor.initialInvestmentDesc", "The amount you plan to invest initially.")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="monthlyContribution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("investmentAdvisor.monthlyContributionLabel", "Monthly contribution (USD)")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input 
                        type="number" 
                        min={0}
                        className="pl-7"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t("investmentAdvisor.monthlyContributionDesc", "Amount you plan to invest each month. Can be zero.")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="retirementFocus"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {t("investmentAdvisor.retirementFocusLabel", "Retirement Focus")}
                    </FormLabel>
                    <FormDescription>
                      {t("investmentAdvisor.retirementFocusDesc", "This investment is primarily for retirement.")}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {t("investmentAdvisor.step3Title", "Personal Information")}
            </h2>
            
            <FormField
              control={form.control}
              name="ageBracket"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("investmentAdvisor.ageBracketLabel", "Age bracket")}
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("investmentAdvisor.selectAge", "Select age bracket")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="incomeStability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("investmentAdvisor.incomeStabilityLabel", "Income stability")}
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("investmentAdvisor.selectIncomeStability", "Select income stability")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {incomeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("investmentAdvisor.incomeStabilityDesc", "How stable and predictable is your income.")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="financialKnowledge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("investmentAdvisor.financialKnowledgeLabel", "Cryptocurrency knowledge")}
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("investmentAdvisor.selectKnowledge", "Select knowledge level")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {knowledgeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("investmentAdvisor.financialKnowledgeDesc", "Your knowledge of cryptocurrency investments.")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {t("investmentAdvisor.step4Title", "Investment Preferences")}
            </h2>
            
            <FormField
              control={form.control}
              name="interestCategories"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      {t("investmentAdvisor.interestCategoriesLabel", "Investment interests")}
                    </FormLabel>
                    <FormDescription>
                      {t("investmentAdvisor.interestCategoriesDesc", "Select all areas that interest you.")}
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categoryOptions.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="interestCategories"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="taxes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("investmentAdvisor.taxesLabel", "Tax environment")}
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("investmentAdvisor.selectTaxes", "Select tax environment")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taxOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("investmentAdvisor.taxesDesc", "The tax environment you are investing in.")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="esgPreference"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {t("investmentAdvisor.esgPreferenceLabel", "ESG Focus")}
                    </FormLabel>
                    <FormDescription>
                      {t("investmentAdvisor.esgPreferenceDesc", "Prioritize environmentally and socially responsible investments.")}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {t("investmentAdvisor.title", "AI-Powered Investment Advisor")}
        </h1>
        <p className="text-muted-foreground">
          {t("investmentAdvisor.subtitle", "Get personalized cryptocurrency investment recommendations based on your profile")}
        </p>
      </div>
      
      {/* Progress indicator */}
      {currentStep < 5 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {t("investmentAdvisor.step", "Step")} {currentStep} {t("investmentAdvisor.of", "of")} 4
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}
      
      {/* Main content */}
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form className="space-y-6">
              {renderStepContent()}
            </form>
          </Form>
        </CardContent>
        
        {/* Navigation buttons */}
        {currentStep < 5 && (
          <CardFooter className="flex justify-between border-t p-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              {t("investmentAdvisor.previous", "Previous")}
            </Button>
            <Button 
              type="button" 
              onClick={nextStep}
              disabled={loadingStrategy}
            >
              {loadingStrategy ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  {t("investmentAdvisor.generating", "Generating...")}
                </>
              ) : currentStep === 4 ? (
                <>
                  {t("investmentAdvisor.generateStrategy", "Generate Strategy")}
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  {t("investmentAdvisor.next", "Next")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default InvestmentAdvisor;