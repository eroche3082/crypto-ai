import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, AlertCircle, CreditCard, Wallet, DollarSign, Bitcoin } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import QrCodeDisplay from './QrCodeDisplay';

interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  icon: string;
  description: string;
  currencies: string[];
  processingFee: string;
  processingTime?: string;
  availability: string;
  instructions?: boolean;
}

interface PaymentMethodSelectorProps {
  accessCode: string;
  levelId: string;
  onPaymentComplete: (success: boolean, paymentInfo?: any) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ 
  accessCode, 
  levelId, 
  onPaymentComplete 
}) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [verificationInProgress, setVerificationInProgress] = useState<boolean>(false);

  // Fetch available payment methods
  const { data: paymentMethods, isLoading, error } = useQuery({
    queryKey: ['/api/payment/methods'],
    retry: 2
  });

  // Handle method selection
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setPaymentData(null);
    
    // Set default currency based on selected method
    if (paymentMethods) {
      const method = paymentMethods.paymentMethods.find((m: PaymentMethod) => m.id === methodId);
      if (method && method.currencies.length > 0) {
        setSelectedCurrency(method.currencies[0]);
      }
    }
  };

  // Initialize payment based on selected method
  const initializePayment = async () => {
    if (!selectedMethod || !accessCode || !levelId) {
      toast({
        title: "Missing Information",
        description: "Please select a payment method to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      let endpoint;
      let paymentInfo;

      switch (selectedMethod) {
        case 'STRIPE':
          window.location.href = `/dashboard/checkout?code=${accessCode}&level=${levelId}`;
          return;
        
        case 'PAYPAL':
          endpoint = '/api/payment/paypal/init';
          paymentInfo = { accessCode, levelId, currency: selectedCurrency || 'USD' };
          break;
        
        case 'CRYPTO':
          endpoint = '/api/payment/crypto/init';
          paymentInfo = { accessCode, levelId, currency: selectedCurrency || 'BTC' };
          break;
        
        case 'BANK_TRANSFER':
          endpoint = '/api/payment/bank-transfer/instructions';
          paymentInfo = { accessCode, levelId, currency: selectedCurrency || 'USD' };
          break;
        
        default:
          toast({
            title: "Payment Method Not Supported",
            description: "This payment method is not yet supported.",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentInfo)
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const data = await response.json();
      setPaymentData(data);
      
      // Handle redirect for PayPal
      if (selectedMethod === 'PAYPAL' && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: "There was a problem initializing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Verify crypto payment
  const verifyCryptoPayment = async () => {
    if (!paymentData?.paymentId) return;
    
    setVerificationInProgress(true);
    
    try {
      const response = await fetch('/api/payment/crypto/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId: paymentData.paymentId,
          accessCode: accessCode,
          levelId: levelId
        })
      });

      const result = await response.json();
      
      if (result.success && result.verified) {
        toast({
          title: "Payment Verified",
          description: "Your payment has been successfully verified.",
          variant: "default"
        });
        onPaymentComplete(true, result);
      } else {
        toast({
          title: "Verification Failed",
          description: "We couldn't verify your payment. Please try again or contact support.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: "There was a problem verifying your payment.",
        variant: "destructive"
      });
    } finally {
      setVerificationInProgress(false);
    }
  };

  // Render icon for payment method
  const renderPaymentIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card':
        return <CreditCard className="h-6 w-6 mr-2" />;
      case 'paypal':
        return <DollarSign className="h-6 w-6 mr-2" />;
      case 'bitcoin':
        return <Bitcoin className="h-6 w-6 mr-2" />;
      case 'bank':
        return <Wallet className="h-6 w-6 mr-2" />;
      default:
        return <CreditCard className="h-6 w-6 mr-2" />;
    }
  };

  // Render payment method options
  const renderPaymentMethods = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading payment options...</span>
        </div>
      );
    }

    if (error || !paymentMethods) {
      return (
        <div className="flex flex-col items-center p-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <h3 className="text-lg font-semibold">Error Loading Payment Methods</h3>
          <p className="text-muted-foreground">Please try refreshing the page or contact support.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
        {paymentMethods.paymentMethods.map((method: PaymentMethod) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all hover:shadow-md ${selectedMethod === method.id ? 'border-primary' : ''}`}
            onClick={() => handleMethodSelect(method.id)}
          >
            <CardHeader className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {renderPaymentIcon(method.icon)}
                  <CardTitle className="text-base">{method.name}</CardTitle>
                </div>
                {selectedMethod === method.id && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardDescription className="text-xs mt-1">
                Provider: {method.provider}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm mb-2">{method.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {method.currencies.slice(0, 3).map(currency => (
                  <Badge key={currency} variant="outline" className="text-xs">
                    {currency}
                  </Badge>
                ))}
                {method.currencies.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{method.currencies.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 text-xs text-muted-foreground flex justify-between">
              <span>Fee: {method.processingFee}</span>
              <span>{method.processingTime || 'Immediate'}</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Render payment details after selection
  const renderPaymentDetails = () => {
    if (!paymentData) return null;

    switch (selectedMethod) {
      case 'CRYPTO':
        return (
          <Card className="my-4">
            <CardHeader>
              <CardTitle>Crypto Payment Details</CardTitle>
              <CardDescription>
                Send exactly {paymentData.paymentAmount} {paymentData.currency} to the following address
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <QrCodeDisplay 
                qrCodeUrl={paymentData.qrCodeUrl} 
                paymentAddress={paymentData.paymentAddress}
                size={200}
              />
              <div className="mt-4 p-3 bg-muted rounded-md w-full overflow-x-auto">
                <code className="text-sm font-mono break-all">
                  {paymentData.paymentAddress}
                </code>
              </div>
              <div className="text-sm text-muted-foreground mt-4 text-center">
                <p>Payment will expire in {Math.floor(paymentData.expiresIn / 60)} minutes</p>
                <p className="font-semibold mt-2">After sending payment, click "Verify Payment" below</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={verifyCryptoPayment} 
                disabled={verificationInProgress}
                className="w-full"
              >
                {verificationInProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Payment
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 'BANK_TRANSFER':
        return (
          <Card className="my-4">
            <CardHeader>
              <CardTitle>Bank Transfer Instructions</CardTitle>
              <CardDescription>
                Please use the following information to complete your bank transfer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-semibold">Bank:</div>
                  <div className="text-sm">{paymentData.bankName}</div>
                  
                  <div className="text-sm font-semibold">Account Name:</div>
                  <div className="text-sm">{paymentData.accountName}</div>
                  
                  <div className="text-sm font-semibold">Account Number:</div>
                  <div className="text-sm font-mono">{paymentData.accountNumber}</div>
                  
                  <div className="text-sm font-semibold">Routing Number:</div>
                  <div className="text-sm font-mono">{paymentData.routingNumber}</div>
                  
                  <div className="text-sm font-semibold">SWIFT Code:</div>
                  <div className="text-sm font-mono">{paymentData.swiftCode}</div>
                  
                  <div className="text-sm font-semibold">Reference Code:</div>
                  <div className="text-sm font-mono font-bold">{paymentData.referenceCode}</div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Important Instructions:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {paymentData.instructions.map((instruction: string, index: number) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.print()}>
                Print Instructions
              </Button>
              <Button onClick={() => onPaymentComplete(true, { method: 'BANK_TRANSFER', referenceCode: paymentData.referenceCode })}>
                I've Completed the Transfer
              </Button>
            </CardFooter>
          </Card>
        );
      
      default:
        return null;
    }
  };

  // Render currency selection for methods that support multiple currencies
  const renderCurrencySelector = () => {
    if (!selectedMethod || !paymentMethods) return null;
    
    const method = paymentMethods.paymentMethods.find((m: PaymentMethod) => m.id === selectedMethod);
    if (!method || method.currencies.length <= 1) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-2">Select Currency:</h3>
        <div className="flex flex-wrap gap-2">
          {method.currencies.map((currency: string) => (
            <Badge 
              key={currency}
              variant={selectedCurrency === currency ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCurrency(currency)}
            >
              {currency}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Select Payment Method</h2>
      
      <Tabs defaultValue="payment-methods" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="payment-details" disabled={!selectedMethod}>Payment Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payment-methods" className="py-4">
          {renderPaymentMethods()}
          {renderCurrencySelector()}
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={initializePayment} 
              disabled={!selectedMethod || isProcessing}
              className="min-w-[120px]"
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="payment-details">
          {renderPaymentDetails()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentMethodSelector;