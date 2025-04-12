import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCheck, Clock, User, Wallet } from 'lucide-react';

interface Message {
  id: number;
  senderId: string;
  recipientId: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
  encryptionType?: string;
  metadata?: any;
}

interface Contact {
  address: string;
  name?: string;
  avatar?: string;
}

interface WalletMessagingProps {
  userWalletAddress?: string;
  onConnect?: () => void;
}

const WalletMessaging: React.FC<WalletMessagingProps> = ({ 
  userWalletAddress, 
  onConnect 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactAddress, setNewContactAddress] = useState('');
  const [newContactName, setNewContactName] = useState('');

  // If wallet is not connected, show connect prompt
  if (!userWalletAddress) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Wallet-to-Wallet Messaging</CardTitle>
          <CardDescription>Connect your wallet to send secure messages to other wallet addresses</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-center mb-4">You need to connect a wallet to use the messaging feature</p>
          <Button onClick={onConnect}>Connect Wallet</Button>
        </CardContent>
      </Card>
    );
  }

  // Fetch messages for the current conversation
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['wallet-messages', userWalletAddress, activeContact?.address],
    queryFn: async () => {
      if (!activeContact?.address) return [];
      
      const response = await apiRequest(
        'GET', 
        `/api/wallet/messages/conversation/${userWalletAddress}/${activeContact.address}`
      );
      
      return await response.json();
    },
    enabled: !!userWalletAddress && !!activeContact?.address
  });

  // Fetch all contacts (addresses user has communicated with)
  useEffect(() => {
    if (userWalletAddress) {
      // In a real app, we would fetch contacts from the API
      // For demo purposes, we'll add some sample contacts
      setContacts([
        { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', name: 'Vitalik.eth' },
        { address: '0x1A1zQzJpm1F3gRyzz05JbmJbT6iZ2qbEhY', name: 'Satoshi' },
        { address: '3xNHQZ3yzYKcTnEaC1Ahw85ZRWPfcMH6r', name: 'Charlie.sol' }
      ]);
    }
  }, [userWalletAddress]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { senderId: string; recipientId: string; content: string }) => {
      const response = await apiRequest('POST', '/api/wallet/messages', messageData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been encrypted and sent securely",
      });
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['wallet-messages', userWalletAddress, activeContact?.address] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleSend = () => {
    if (!messageText.trim() || !activeContact) return;
    
    sendMessageMutation.mutate({
      senderId: userWalletAddress,
      recipientId: activeContact.address,
      content: messageText
    });
  };

  const handleAddContact = () => {
    if (!newContactAddress.trim()) return;
    
    setContacts([...contacts, {
      address: newContactAddress,
      name: newContactName || newContactAddress.substring(0, 6) + '...' + newContactAddress.substring(newContactAddress.length - 4)
    }]);
    
    setNewContactAddress('');
    setNewContactName('');
    setShowAddContact(false);
  };

  function getMessageTime(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Wallet Messaging</CardTitle>
        <CardDescription>Send encrypted messages directly to other wallets</CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-grow p-0 overflow-hidden">
        {/* Contacts sidebar */}
        <div className="w-1/3 border-r p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Contacts</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAddContact(!showAddContact)}
            >
              {showAddContact ? 'Cancel' : 'Add'}
            </Button>
          </div>
          
          {showAddContact && (
            <div className="p-2 bg-muted rounded-md mb-2">
              <Input 
                placeholder="Wallet address" 
                value={newContactAddress}
                onChange={(e) => setNewContactAddress(e.target.value)}
                className="mb-2"
              />
              <Input 
                placeholder="Contact name (optional)" 
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="mb-2"
              />
              <Button size="sm" onClick={handleAddContact}>Save Contact</Button>
            </div>
          )}
          
          <ScrollArea className="h-[calc(100%-50px)]">
            {contacts.map((contact) => (
              <div 
                key={contact.address}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent",
                  activeContact?.address === contact.address && "bg-accent"
                )}
                onClick={() => setActiveContact(contact)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{contact.name?.[0] || 'W'}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{contact.name || contact.address.substring(0, 8)}</p>
                  <p className="text-xs text-muted-foreground truncate">{contact.address}</p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
        
        {/* Chat area */}
        <div className="w-2/3 flex flex-col">
          {activeContact ? (
            <>
              <div className="p-3 border-b flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{activeContact.name?.[0] || 'W'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{activeContact.name}</p>
                  <p className="text-xs text-muted-foreground">{activeContact.address}</p>
                </div>
              </div>
              
              <ScrollArea className="flex-grow p-3">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground">
                    <Wallet className="h-10 w-10 mb-2" />
                    <p>No messages yet</p>
                    <p className="text-sm">Send your first encrypted message</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((message: Message) => (
                      <div 
                        key={message.id}
                        className={cn(
                          "max-w-[80%] rounded-lg p-3",
                          message.senderId === userWalletAddress 
                            ? "ml-auto bg-primary text-primary-foreground" 
                            : "bg-muted"
                        )}
                      >
                        <p>{message.content}</p>
                        <div className={cn(
                          "flex items-center gap-1 text-xs mt-1",
                          message.senderId === userWalletAddress 
                            ? "text-primary-foreground/80" 
                            : "text-muted-foreground"
                        )}>
                          <span>{getMessageTime(message.timestamp)}</span>
                          {message.senderId === userWalletAddress && (
                            <span className="ml-1">
                              {message.status === 'read' ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : message.status === 'delivered' ? (
                                <CheckCheck className="h-3 w-3 opacity-50" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Type a message..."
                    className="min-h-[60px] resize-none"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSend}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center mt-2">
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Encrypted
                  </Badge>
                  <p className="text-xs text-muted-foreground ml-auto">
                    Messages are encrypted end-to-end
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-center p-4">
              <User className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="font-medium text-lg mb-2">Select a contact</h3>
              <p className="text-muted-foreground max-w-md">
                Choose a contact from the list or add a new one to start messaging
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletMessaging;