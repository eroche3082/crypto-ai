import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, LockOpen, PiggyBank, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PaymentMethodSelector from '@/components/PaymentMethodSelector';
import { useQuery } from '@tanstack/react-query';

const MultiPaymentPage: React.FC = () => {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [, params] = useRoute('/dashboard/payment/:levelId');
  const levelId = params?.levelId || '';
  const queryParams = new URLSearchParams(location.split('?')[1] || '');
  const accessCode = queryParams.get('code') || '';
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Fetch level details
  const { data: levelData, isLoading: loadingLevel } = useQuery({
    queryKey: ['/api/access-code/levels', accessCode],
    enabled: !!accessCode,
    queryFn: async () => {
      const response = await fetch(`/api/access-code/levels?code=${accessCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch level details');
      }
      return response.json();
    }
  });

  useEffect(() => {
    // Validate that we have the required parameters
    if (!accessCode) {
      toast({
        title: "Missing Access Code",
        description: "Please return to the dashboard and try again.",
        variant: "destructive"
      });
    }
  }, [accessCode, toast]);
  
  // Handle successful payment completion
  const handlePaymentComplete = (success: boolean, result?: any) => {
    if (success) {
      setPaymentComplete(true);
      setPaymentResult(result);
      setShowConfetti(true);
      
      // Trigger animation celebration
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  };
  
  // Get the current level being purchased
  const getCurrentLevel = () => {
    if (!levelData || !levelData.levels) return null;
    return levelData.levels.find((level: any) => level.id === levelId);
  };
  
  const currentLevel = getCurrentLevel();
  
  // Render level features
  const renderLevelFeatures = (features: string[]) => {
    return (
      <ul className="mt-2 space-y-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Shield className="h-4 w-4 mr-1.5 mt-0.5 text-primary" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    );
  };
  
  // Return to dashboard
  const returnToDashboard = () => {
    navigate(`/dashboard?code=${accessCode}`);
  };
  
  // Render payment completion screen
  const renderPaymentComplete = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto p-4"
      >
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <LockOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center text-xl">Level Unlocked!</CardTitle>
            <CardDescription className="text-center">
              {currentLevel ? currentLevel.name : 'Premium'} access has been activated
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              Your payment has been processed successfully. Your account has been upgraded with all the new features.
            </p>
            
            {paymentResult?.transactionHash && (
              <div className="bg-muted p-3 rounded-md my-3 text-xs font-mono break-all">
                {paymentResult.transactionHash}
              </div>
            )}
            
            <div className="mt-4 p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <PiggyBank className="h-4 w-4 mr-1.5" />
                Unlock Benefits
              </h4>
              {currentLevel && currentLevel.features && (
                renderLevelFeatures(currentLevel.features)
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={returnToDashboard}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };
  
  // Main render
  if (paymentComplete) {
    return renderPaymentComplete();
  }
  
  if (loadingLevel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading payment options...</p>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={returnToDashboard} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-2xl font-bold mb-1">Unlock {currentLevel?.name || 'Premium'} Access</h1>
        <p className="text-muted-foreground mb-6">
          Choose your preferred payment method to continue
        </p>
        
        {currentLevel && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {currentLevel.name} - {currentLevel.price_formatted}
              </CardTitle>
              <CardDescription>
                {currentLevel.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-sm font-semibold mb-2">Included Features:</h3>
              {renderLevelFeatures(currentLevel.features || [])}
            </CardContent>
          </Card>
        )}
        
        {/* Payment Method Selector */}
        <PaymentMethodSelector 
          accessCode={accessCode}
          levelId={levelId}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </div>
  );
};

export default MultiPaymentPage;