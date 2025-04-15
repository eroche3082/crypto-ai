import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const pricingPlans = [
    {
      name: "Free",
      description: "Basic crypto tracking and education",
      price: {
        monthly: 0,
        annual: 0
      },
      features: [
        "Real-time price tracking for popular cryptocurrencies",
        "Basic portfolio tracking",
        "Limited market news",
        "Educational content",
        "Basic market charts"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      description: "Advanced tools for active traders",
      price: {
        monthly: 19.99,
        annual: 199.99
      },
      features: [
        "All Free features",
        "Enhanced portfolio analytics",
        "Full crypto market access",
        "Advanced charting tools",
        "Price alerts",
        "Social sentiment analysis",
        "NFT basic tracking"
      ],
      cta: "Upgrade to Pro",
      popular: true
    },
    {
      name: "Enterprise",
      description: "Complete solution for serious investors",
      price: {
        monthly: 49.99,
        annual: 499.99
      },
      features: [
        "All Pro features",
        "AI-powered investment advice",
        "Advanced NFT portfolio analysis",
        "Tax reporting tools",
        "Priority customer support",
        "API access",
        "Multi-wallet support",
        "Custom alerts and reports"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Transparent Pricing for Every Crypto Investor</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Choose the perfect plan to accelerate your crypto journey.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <Tabs defaultValue="monthly" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="monthly" 
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger 
              value="annual" 
              onClick={() => setBillingCycle("annual")}
            >
              Annual <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">Save 20%</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg' : ''}`}
          >
            <CardHeader>
              {plan.popular && (
                <div className="mb-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary w-fit">
                  Most Popular
                </div>
              )}
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold">${billingCycle === "monthly" ? plan.price.monthly : plan.price.annual}</span>
                {plan.price.monthly > 0 && (
                  <span className="text-muted-foreground">/{billingCycle === "monthly" ? 'month' : 'year'}</span>
                )}
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className="w-full"
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold">Need a custom solution?</h2>
        <p className="mt-4 text-muted-foreground">
          Contact our team for enterprise pricing and custom features tailored to your investment strategy.
        </p>
        <Button className="mt-6">Contact Us</Button>
      </div>
    </div>
  );
};

export default PricingPage;