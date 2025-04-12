import React, { useState } from 'react';
import WalletMessagingComponent from '@/components/wallet/WalletMessaging';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Shield, CheckCircle, LockKeyhole, MessageCircle } from 'lucide-react';

export default function WalletMessagingPage() {
  const { toast } = useToast();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  
  // Function to simulate wallet connection
  const connectWallet = () => {
    if (walletAddress && walletAddress.length > 10) {
      setWalletConnected(true);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
      });
    } else {
      toast({
        title: "Invalid Wallet Address",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      });
    }
  };
  
  // Use demo address if needed
  const useDemoAddress = () => {
    const demoAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
    setWalletAddress(demoAddress);
    setWalletConnected(true);
    toast({
      title: "Demo Mode Activated",
      description: "Using demo wallet for testing",
    });
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockKeyhole className="h-5 w-5" />
                Encrypted Wallet Messaging
              </CardTitle>
              <CardDescription>
                Send secure encrypted messages directly between wallet addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!walletConnected ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Wallet Address</label>
                    <Input 
                      placeholder="Enter your wallet address (0x...)" 
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onClick={connectWallet} className="w-full">
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={useDemoAddress} 
                      className="w-full"
                    >
                      Use Demo Wallet
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div className="overflow-hidden">
                      <p className="font-medium text-sm">Connected Wallet</p>
                      <p className="text-xs text-muted-foreground truncate">{walletAddress}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Active</span>
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setWalletConnected(false)}
                    className="w-full"
                  >
                    Disconnect
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">End-to-End Encryption</p>
                  <p className="text-xs text-muted-foreground">All messages are encrypted using PGP</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">On-Chain Verification</p>
                  <p className="text-xs text-muted-foreground">Verify the identity of senders through blockchain</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">No Data Storage</p>
                  <p className="text-xs text-muted-foreground">Messages are stored only on your device</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="messaging" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="messaging">
                <MessageCircle className="mr-2 h-4 w-4" />
                Messaging
              </TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="messaging" className="pt-4">
              <WalletMessagingComponent 
                userWalletAddress={walletConnected ? walletAddress : undefined}
                onConnect={() => setShowDemo(true)}
              />
              
              {showDemo && !walletConnected && (
                <div className="mt-4 p-4 border rounded-lg bg-muted">
                  <h3 className="font-medium mb-2">Want to try a demo?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect a wallet address to test the messaging feature
                  </p>
                  <Button onClick={useDemoAddress}>
                    Use Demo Wallet
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="about" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>About Wallet-to-Wallet Messaging</CardTitle>
                  <CardDescription>
                    A secure way to communicate directly with other wallet addresses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    The Wallet-to-Wallet Messaging system enables direct, secure communication between cryptocurrency wallets.
                    This feature allows you to send encrypted messages to any wallet address without revealing your personal information.
                  </p>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Key Features:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>End-to-end encryption using PGP</li>
                      <li>Verify sender identity through wallet signatures</li>
                      <li>Works across multiple blockchain networks</li>
                      <li>No need for phone numbers or email addresses</li>
                      <li>Message delivery confirmation</li>
                      <li>Supports text, future support for file transfers</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">How It Works:</h3>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Connect your wallet to the platform</li>
                      <li>Enter the recipient's wallet address or select from contacts</li>
                      <li>Compose your message</li>
                      <li>The message is encrypted with the recipient's public key</li>
                      <li>Only the recipient can decrypt the message using their private key</li>
                    </ol>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm italic">
                      "Wallet-to-Wallet Messaging represents the future of Web3 communication, enabling trustless and private conversations between blockchain users."
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}