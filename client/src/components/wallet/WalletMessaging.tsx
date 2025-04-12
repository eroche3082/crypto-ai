import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Lock, Send, Search, Plus, User, CheckCircle2, Clock, X, MessageSquare } from 'lucide-react';

// Define interfaces for messaging components
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

// Demo data for initial UI rendering
const DEMO_CONTACTS: Contact[] = [
  { 
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    name: 'vitalik.eth',
    avatar: 'https://pbs.twimg.com/profile_images/1724435659037376512/cQjwvZGG_400x400.jpg'
  },
  { 
    address: '0x2230A7F7E6Cc8E4a4e9D87853620C5358310bC25',
    name: 'crypto_trader',
  },
  { 
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    name: 'wallet_test',
  },
];

const DEMO_MESSAGES: Message[] = [
  {
    id: 1,
    senderId: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    recipientId: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    content: 'Hello, I wanted to discuss the latest DeFi project.',
    status: 'read',
    timestamp: '2025-04-10T14:22:00Z',
    encryptionType: 'PGP'
  },
  {
    id: 2,
    senderId: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    recipientId: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    content: 'Sure, what aspects are you interested in?',
    status: 'read',
    timestamp: '2025-04-10T14:25:00Z',
    encryptionType: 'PGP'
  },
  {
    id: 3,
    senderId: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    recipientId: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    content: 'I\'m curious about the yield farming opportunities and security audits.',
    status: 'read',
    timestamp: '2025-04-10T14:28:00Z',
    encryptionType: 'PGP'
  },
  {
    id: 4,
    senderId: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    recipientId: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    content: 'They\'ve completed 3 audits with Trail of Bits and Certik. The farming APY ranges from 8-15% depending on the pool.',
    status: 'delivered',
    timestamp: '2025-04-10T14:30:00Z',
    encryptionType: 'PGP'
  },
  {
    id: 5,
    senderId: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    recipientId: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    content: 'That sounds promising. Could you send me the contract address?',
    status: 'sent',
    timestamp: '2025-04-10T14:33:00Z',
    encryptionType: 'PGP'
  }
];

// Main component
const WalletMessaging: React.FC<WalletMessagingProps> = ({ userWalletAddress, onConnect }) => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>(DEMO_CONTACTS);
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newContactAddress, setNewContactAddress] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);

  // Function to get contact name from address
  const getContactName = (address: string): string => {
    const contact = contacts.find(c => c.address === address);
    if (contact?.name) return contact.name;
    return shortenAddress(address);
  };

  // Format wallet addresses for display
  const shortenAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format message time for display
  function getMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Filter contacts by search query
  const filteredContacts = contacts.filter(contact => 
    (contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     contact.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact || !userWalletAddress) return;
    
    const newMsg: Message = {
      id: messages.length + 1,
      senderId: userWalletAddress,
      recipientId: selectedContact.address,
      content: newMessage,
      status: 'sent',
      timestamp: new Date().toISOString(),
      encryptionType: 'PGP'
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    toast({
      title: "Message Sent",
      description: "Your encrypted message has been sent.",
    });
    
    // Simulate message delivery status change
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMsg.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 2000);
  };

  // Add a new contact
  const handleAddContact = () => {
    if (!newContactAddress || newContactAddress.length < 10) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      });
      return;
    }
    
    const newContact: Contact = {
      address: newContactAddress,
      name: newContactName || undefined
    };
    
    setContacts([...contacts, newContact]);
    setNewContactAddress('');
    setNewContactName('');
    setShowAddContact(false);
    
    toast({
      title: "Contact Added",
      description: `Successfully added ${newContactName || shortenAddress(newContactAddress)} to your contacts.`,
    });
  };

  // Effect to trigger onConnect when needed
  useEffect(() => {
    if (!userWalletAddress && onConnect) {
      onConnect();
    }
  }, [userWalletAddress, onConnect]);

  // Show connection prompt if no wallet is connected
  if (!userWalletAddress) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
        <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground mb-4">
          To use the messaging feature, you need to connect your wallet first.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] border border-border rounded-md overflow-hidden bg-card flex">
      {/* Contacts sidebar */}
      <div className="w-1/3 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Contacts</h3>
            <Badge variant="outline" className="ml-auto text-xs">
              {contacts.length}
            </Badge>
          </div>
          
          <div className="relative">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search contacts..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {filteredContacts.map((contact) => (
            <div 
              key={contact.address}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/20 ${
                selectedContact?.address === contact.address ? 'bg-accent/30' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <Avatar className="h-10 w-10">
                {contact.avatar && <AvatarImage src={contact.avatar} />}
                <AvatarFallback className="bg-primary/10 text-primary">
                  {contact.name ? contact.name[0].toUpperCase() : 'W'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {contact.name || shortenAddress(contact.address)}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {shortenAddress(contact.address)}
                </div>
              </div>
            </div>
          ))}
          
          {filteredContacts.length === 0 && !showAddContact && (
            <div className="p-4 text-center text-muted-foreground">
              <p className="mb-2">No contacts found</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddContact(true)}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Contact
              </Button>
            </div>
          )}
          
          {showAddContact && (
            <div className="p-3 border-t border-border">
              <h4 className="font-medium mb-2 flex items-center">
                <Plus className="mr-2 h-4 w-4" /> 
                Add New Contact
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto h-6 w-6" 
                  onClick={() => setShowAddContact(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </h4>
              
              <div className="space-y-2">
                <Input 
                  placeholder="Wallet Address (0x...)" 
                  value={newContactAddress}
                  onChange={(e) => setNewContactAddress(e.target.value)}
                />
                <Input 
                  placeholder="Name (optional)" 
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={handleAddContact}
                  >
                    Add Contact
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-border">
          {!showAddContact && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowAddContact(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Contact
            </Button>
          )}
        </div>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b border-border flex items-center gap-3">
              <Avatar className="h-8 w-8">
                {selectedContact.avatar && <AvatarImage src={selectedContact.avatar} />}
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedContact.name ? selectedContact.name[0].toUpperCase() : 'W'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="font-medium">
                  {selectedContact.name || shortenAddress(selectedContact.address)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {shortenAddress(selectedContact.address)}
                </div>
              </div>
              
              <div className="ml-auto flex items-center">
                <Lock className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-muted-foreground">End-to-End Encrypted</span>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .filter(msg => 
                  (msg.senderId === userWalletAddress && msg.recipientId === selectedContact.address) ||
                  (msg.recipientId === userWalletAddress && msg.senderId === selectedContact.address)
                )
                .map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.senderId === userWalletAddress ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === userWalletAddress 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {getMessageTime(message.timestamp)}
                        </span>
                        
                        {message.senderId === userWalletAddress && (
                          <span>
                            {message.status === 'sent' && (
                              <Clock className="h-3 w-3 opacity-70" />
                            )}
                            {message.status === 'delivered' && (
                              <CheckCircle2 className="h-3 w-3 opacity-70" />
                            )}
                            {message.status === 'read' && (
                              <div className="flex">
                                <CheckCircle2 className="h-3 w-3 opacity-70" />
                                <CheckCircle2 className="h-3 w-3 opacity-70 -ml-1" />
                              </div>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Message input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3 mr-1" />
                <span>Messages are end-to-end encrypted</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Conversation Selected</h3>
            <p className="text-muted-foreground max-w-md mb-4">
              Select a contact from the list or add a new contact to start messaging securely with wallet addresses.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowAddContact(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Contact
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletMessaging;