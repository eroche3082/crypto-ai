import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const SubscriptionPlans = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "free",
      name: t("subscriptions.free.title", "Free"),
      price: "$0",
      period: t("subscriptions.period.monthly", "monthly"),
      description: t("subscriptions.free.description", "Basic access to cryptocurrency data and minimal portfolio tracking."),
      features: [
        t("subscriptions.free.feature1", "Real-time cryptocurrency prices"),
        t("subscriptions.free.feature2", "Basic portfolio tracking"),
        t("subscriptions.free.feature3", "Limited market insights"),
        t("subscriptions.free.feature4", "5 watchlist items")
      ],
      limitations: [
        t("subscriptions.free.limitation1", "No AI analysis"),
        t("subscriptions.free.limitation2", "Limited API access"),
        t("subscriptions.free.limitation3", "Basic alerts only")
      ],
      cta: t("subscriptions.free.cta", "Current Plan"),
      disabled: true,
      highlight: false,
      accessCategory: "BEGINNER"
    },
    {
      id: "trader",
      name: t("subscriptions.trader.title", "Trader"),
      price: "$9.99",
      period: t("subscriptions.period.monthly", "monthly"),
      description: t("subscriptions.trader.description", "Essential tools for active cryptocurrency traders with enhanced analytics."),
      features: [
        t("subscriptions.trader.feature1", "All Free features"),
        t("subscriptions.trader.feature2", "Advanced portfolio tracking"),
        t("subscriptions.trader.feature3", "Trading signals and alerts"),
        t("subscriptions.trader.feature4", "25 watchlist items"),
        t("subscriptions.trader.feature5", "Tax reporting tools")
      ],
      limitations: [
        t("subscriptions.trader.limitation1", "Limited AI analysis"),
        t("subscriptions.trader.limitation2", "Standard API access")
      ],
      cta: t("subscriptions.trader.cta", "Upgrade Now"),
      disabled: false,
      highlight: false,
      accessCategory: "TRADER"
    },
    {
      id: "pro",
      name: t("subscriptions.pro.title", "Pro"),
      price: "$29.99",
      period: t("subscriptions.period.monthly", "monthly"),
      description: t("subscriptions.pro.description", "Professional-grade crypto analysis with full AI capabilities and advanced tools."),
      features: [
        t("subscriptions.pro.feature1", "All Trader features"),
        t("subscriptions.pro.feature2", "Unlimited watchlist items"),
        t("subscriptions.pro.feature3", "Full AI market analysis"),
        t("subscriptions.pro.feature4", "Social sentiment analysis"),
        t("subscriptions.pro.feature5", "Portfolio optimization AI"),
        t("subscriptions.pro.feature6", "Premium API access"),
        t("subscriptions.pro.feature7", "Priority support via contact@socialbrands.ai")
      ],
      limitations: [],
      cta: t("subscriptions.pro.cta", "Upgrade Now"),
      disabled: false,
      highlight: true,
      accessCategory: "INVESTOR"
    },
    {
      id: "vip",
      name: t("subscriptions.vip.title", "VIP"),
      price: "$99.99",
      period: t("subscriptions.period.monthly", "monthly"),
      description: t("subscriptions.vip.description", "Elite access with personalized insights, early features, and exclusive content."),
      features: [
        t("subscriptions.vip.feature1", "All Pro features"),
        t("subscriptions.vip.feature2", "Personalized AI assistant"),
        t("subscriptions.vip.feature3", "Early access to new features"),
        t("subscriptions.vip.feature4", "Exclusive weekly insights"),
        t("subscriptions.vip.feature5", "One-on-one consultation"),
        t("subscriptions.vip.feature6", "Custom research reports"),
        t("subscriptions.vip.feature7", "Direct developer access")
      ],
      limitations: [],
      cta: t("subscriptions.vip.cta", "Upgrade Now"),
      disabled: false,
      highlight: false,
      accessCategory: "VIP"
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    
    // Show toast notification
    toast({
      title: t("subscriptions.selected", "Plan selected"),
      description: t("subscriptions.proceedToCheckout", "Please proceed to checkout to upgrade your subscription."),
    });
  };

  const handleUpgrade = (planId: string, accessCategory: string) => {
    // This would redirect to a payment page in a real implementation
    // For now, just generate a mock access code and show a notification
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const accessCode = `CRYPTO-${accessCategory}-${randomCode}`;
    
    localStorage.setItem('accessCode', accessCode);
    
    toast({
      title: t("subscriptions.upgradeInitiated", "Upgrade initiated"),
      description: t("subscriptions.redirectingToPayment", "Redirecting to payment gateway..."),
    });
    
    // After a short delay, redirect to a payment confirmation page
    setTimeout(() => {
      window.location.href = `/payment-success?plan=${planId}&accessCode=${accessCode}`;
    }, 1500);
  };

  return (
    <div className="container py-8 px-4 mx-auto max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">{t("subscriptions.title", "CryptoBot Subscription Plans")}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("subscriptions.subtitle", "Choose the plan that best fits your crypto journey. Upgrade anytime to unlock more powerful features.")}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`flex flex-col h-full border-2 ${plan.highlight ? 'border-primary shadow-lg' : 'border-border'}`}
          >
            <CardHeader className={`${plan.highlight ? 'bg-primary/10' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <CardTitle>{plan.name}</CardTitle>
                {plan.highlight && (
                  <Badge variant="default">{t("subscriptions.popular", "Popular")}</Badge>
                )}
              </div>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="ml-1 text-muted-foreground">/{plan.period}</span>
              </div>
              <CardDescription className="mt-3">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={`feature-${index}`} className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                {plan.limitations.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-border">
                    {plan.limitations.map((limitation, index) => (
                      <div key={`limitation-${index}`} className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                variant={plan.highlight ? "default" : "outline"} 
                className="w-full"
                disabled={plan.disabled}
                onClick={() => handleUpgrade(plan.id, plan.accessCategory)}
              >
                {plan.cta}
              </Button>
              
              {plan.disabled && (
                <p className="text-xs text-muted-foreground text-center">{t("subscriptions.currentPlan", "This is your current plan")}</p>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="bg-card/50 rounded-lg border border-border p-6 mb-12">
        <h2 className="text-xl font-semibold mb-4">{t("subscriptions.faq.title", "Frequently Asked Questions")}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">{t("subscriptions.faq.q1", "Can I upgrade or downgrade my plan later?")}</h3>
            <p className="text-muted-foreground">{t("subscriptions.faq.a1", "Yes, you can change your subscription at any time. When upgrading, you'll be charged the prorated amount for the remainder of your billing cycle. When downgrading, the new rate will apply at the start of your next billing cycle.")}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">{t("subscriptions.faq.q2", "How do access codes work with subscriptions?")}</h3>
            <p className="text-muted-foreground">{t("subscriptions.faq.a2", "When you subscribe to a plan, you'll receive a unique access code that unlocks features corresponding to your subscription level. This code can be used to access your subscription across devices.")}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">{t("subscriptions.faq.q3", "Is there a refund policy?")}</h3>
            <p className="text-muted-foreground">{t("subscriptions.faq.a3", "We offer a 14-day money-back guarantee on all paid subscriptions. If you're not satisfied with your experience, contact us at contact@socialbrands.ai within 14 days of your purchase.")}</p>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Button variant="outline" asChild>
          <Link href="/">{t("common.backToDashboard", "Back to Dashboard")}</Link>
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionPlans;