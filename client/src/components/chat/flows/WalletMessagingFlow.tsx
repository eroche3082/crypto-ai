import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Send, 
  Users, 
  Wallet, 
  Lock,
  Plus,
  Mail
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

/**
 * Wallet Messaging Conversational Flow Component
 * Provides structured chatbot flows for the Wallet Messaging tab
 */
export const WalletMessagingFlow: React.FC = () => {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  // Wallet messaging flow triggers
  const flowTriggers = [
    { 
      name: 'New Message', 
      description: 'Send a wallet-to-wallet message', 
      icon: <MessageSquare className="h-4 w-4" />,
      command: 'compose new wallet message'
    },
    { 
      name: 'Request Payment', 
      description: 'Request crypto payment', 
      icon: <Send className="h-4 w-4" />,
      command: 'create payment request'
    },
    { 
      name: 'Group Message', 
      description: 'Message multiple wallets', 
      icon: <Users className="h-4 w-4" />,
      command: 'create group wallet message'
    },
    { 
      name: 'Connect Wallet', 
      description: 'Connect your crypto wallet', 
      icon: <Wallet className="h-4 w-4" />,
      command: 'connect wallet for messaging'
    },
    { 
      name: 'Encryption Settings', 
      description: 'Manage message encryption', 
      icon: <Lock className="h-4 w-4" />,
      command: 'manage encryption settings'
    }
  ];

  // Handle flow trigger click
  const handleFlowTrigger = (trigger: any) => {
    console.log(`Triggering wallet messaging flow: ${trigger.command}`);
    
    // Save to memory context
    localStorage.setItem('last_wallet_messaging_flow', trigger.name);
    
    // Set selected action for UI feedback
    setSelectedAction(trigger.name);
    
    // Show visual feedback
    toast({
      title: trigger.name,
      description: trigger.description,
    });
    
    // Simulate typing animation with custom event
    document.dispatchEvent(new CustomEvent('chat:new-message', { 
      detail: { message: trigger.command, sender: 'user' } 
    }));
  };

  // Handle wallet address search
  const handleWalletSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress.trim()) return;
    
    console.log(`Searching for wallet: ${walletAddress}`);
    
    // Add to recent contacts
    const recentContacts = JSON.parse(localStorage.getItem('wallet_recent_contacts') || '[]');
    const newContact = {
      address: walletAddress,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('wallet_recent_contacts', 
      JSON.stringify([newContact, ...recentContacts.filter((c: any) => c.address !== walletAddress).slice(0, 4)])
    );
    
    // Show visual feedback
    toast({
      title: "Wallet found",
      description: `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 6)}`,
    });
    
    // Dispatch event to the chatbot
    document.dispatchEvent(new CustomEvent('chat:new-message', { 
      detail: { 
        message: `find wallet ${walletAddress}`, 
        sender: 'user',
        metadata: { walletAddress }
      } 
    }));
    
    // Reset search field
    setWalletAddress('');
  };

  // Generate shortened wallet address display
  const shortenAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Card className="border-border/40 bg-card/30">
      <CardContent className="p-4">
        <div className="mb-3">
          <Badge variant="outline" className="bg-primary/10 text-primary mb-2">
            Wallet Messaging Assistant
          </Badge>
          <p className="text-sm text-muted-foreground">
            Secure wallet-to-wallet communication
          </p>
        </div>
        
        <form onSubmit={handleWalletSearch} className="mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter wallet address (0x...)"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="default" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </form>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {flowTriggers.map((trigger, index) => (
            <Button 
              key={index} 
              variant={selectedAction === trigger.name ? "default" : "outline"}
              className="justify-start h-auto py-2 px-3"
              onClick={() => handleFlowTrigger(trigger)}
            >
              <div className="flex items-start gap-2">
                <div className={`${selectedAction === trigger.name ? 'bg-primary-foreground' : 'bg-primary/10'} p-2 rounded-full`}>
                  {trigger.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium">{trigger.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{trigger.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        {/* Recent contacts section */}
        {(() => {
          const recentContacts = JSON.parse(localStorage.getItem('wallet_recent_contacts') || '[]');
          if (recentContacts.length > 0) {
            return (
              <div className="pt-4 border-t border-border/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Recent Contacts</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => {
                      localStorage.removeItem('wallet_recent_contacts');
                      toast({
                        title: "Contacts cleared",
                        description: "Your recent contacts have been cleared",
                      });
                    }}
                  >
                    Clear
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {recentContacts.map((contact: any, index: number) => (
                    <Button 
                      key={index} 
                      variant="ghost" 
                      className="w-full justify-start h-10 px-3"
                      onClick={() => {
                        setWalletAddress(contact.address);
                        setSelectedAction('New Message');
                        
                        // Show visual feedback
                        toast({
                          title: "Contact selected",
                          description: `Ready to message ${shortenAddress(contact.address)}`,
                        });
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1 rounded-full">
                          <Mail className="h-3 w-3" />
                        </div>
                        <div className="font-mono text-xs">{shortenAddress(contact.address)}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}
      </CardContent>
    </Card>
  );
};

export default WalletMessagingFlow;