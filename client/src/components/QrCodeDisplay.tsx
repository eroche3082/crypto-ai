import React, { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QrCodeDisplayProps {
  qrCodeUrl: string;
  paymentAddress: string;
  size?: number;
  showCopyButton?: boolean;
}

const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  qrCodeUrl,
  paymentAddress,
  size = 200,
  showCopyButton = true
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Handle copying address to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentAddress);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Payment address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy Failed",
        description: "Unable to copy address",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="rounded-lg overflow-hidden border bg-white p-2 shadow-sm"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <img 
          src={qrCodeUrl} 
          alt="Payment QR Code" 
          width={size - 16} 
          height={size - 16}
          className="object-contain"
        />
      </div>
      
      {showCopyButton && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3 text-xs gap-1"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Address</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default QrCodeDisplay;