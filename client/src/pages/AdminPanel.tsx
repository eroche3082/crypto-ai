import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DownloadCloud, 
  FileSpreadsheet, 
  Filter, 
  Search, 
  Mail, 
  UserPlus,
  CheckCircle, 
  Clock, 
  AlertCircle,
  X
} from "lucide-react";
import Header from "@/components/Header";
import { apiRequest } from "@/lib/queryClient";

interface OnboardingProfile {
  id: number;
  name: string;
  email: string;
  unique_code: string;
  user_category: string;
  onboarding_completed: boolean;
  created_at: string;
  timezone: string;
  status?: string;
}

const AdminPanel = () => {
  const [onboardingProfiles, setOnboardingProfiles] = useState<OnboardingProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProfiles, setSelectedProfiles] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch onboarding profiles
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest("GET", "/api/admin/onboarding-profiles");
        const data = await response.json();
        
        if (data.success) {
          // Add demo status for visual representation
          const profilesWithStatus = data.profiles.map((profile: OnboardingProfile) => ({
            ...profile,
            status: Math.random() > 0.7 ? "converted" : Math.random() > 0.5 ? "contacted" : "new"
          }));
          setOnboardingProfiles(profilesWithStatus);
        } else {
          throw new Error(data.error || "Failed to fetch profiles");
        }
      } catch (error) {
        console.error("Error fetching onboarding profiles:", error);
        // For demo purposes, generate some sample data
        const sampleData = generateSampleData();
        setOnboardingProfiles(sampleData);
        toast({
          title: "Could not connect to server",
          description: "Using demo data for preview purposes",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [toast]);

  // Generate some sample data for demo purposes
  const generateSampleData = (): OnboardingProfile[] => {
    const categories = ["BEGINNER", "INTER", "EXPERT", "VIP"];
    const statuses = ["new", "contacted", "converted"];
    
    return Array.from({ length: 20 }).map((_, i) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const randomNum = Math.floor(Math.random() * 10000);
      
      return {
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        unique_code: `CRYPTO-${category}-${randomNum}`,
        user_category: category,
        onboarding_completed: true,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        timezone: "UTC",
        status
      };
    });
  };

  // Filter and search profiles
  const filteredProfiles = onboardingProfiles.filter(profile => {
    const matchesCategory = filterCategory === "all" || profile.user_category === filterCategory;
    const matchesSearch = searchQuery === "" || 
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      profile.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      profile.unique_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Toggle selection of a profile
  const toggleProfileSelection = (id: number) => {
    setSelectedProfiles(prev => 
      prev.includes(id) 
        ? prev.filter(profileId => profileId !== id)
        : [...prev, id]
    );
  };

  // Select all profiles
  const selectAllProfiles = () => {
    if (selectedProfiles.length === filteredProfiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(filteredProfiles.map(profile => profile.id));
    }
  };

  // Export profiles to CSV
  const exportToCSV = () => {
    // Get the profiles to export (selected or all if none selected)
    const profilesToExport = selectedProfiles.length > 0 
      ? filteredProfiles.filter(profile => selectedProfiles.includes(profile.id))
      : filteredProfiles;
    
    // Create CSV content
    const headers = ["ID", "Name", "Email", "Access Code", "Category", "Status", "Created At"];
    const csvContent = [
      headers.join(","),
      ...profilesToExport.map(profile => [
        profile.id,
        `"${profile.name}"`,
        `"${profile.email}"`,
        profile.unique_code,
        profile.user_category,
        profile.status,
        new Date(profile.created_at).toLocaleDateString()
      ].join(","))
    ].join("\n");
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `onboarding-profiles-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export complete",
      description: `Exported ${profilesToExport.length} profiles to CSV`,
    });
  };

  // Send emails to selected profiles
  const sendEmails = async () => {
    // Get the profiles to send emails to (selected or all if none selected)
    const profilesToEmail = selectedProfiles.length > 0 
      ? filteredProfiles.filter(profile => selectedProfiles.includes(profile.id))
      : filteredProfiles;
    
    if (profilesToEmail.length === 0) {
      toast({
        title: "No profiles selected",
        description: "Please select at least one profile to send emails to.",
        variant: "destructive"
      });
      return;
    }
    
    // Format recipients for the API
    const recipients = profilesToEmail.map(profile => ({
      name: profile.name,
      email: profile.email,
      code: profile.unique_code
    }));
    
    // Show loading toast
    toast({
      title: "Preparing to send emails",
      description: `Sending to ${recipients.length} recipients...`,
    });
    
    try {
      // Send newsletter campaign via API
      const response = await apiRequest("POST", "/api/email/send-newsletter", {
        recipients,
        subject: "Your CryptoBot Access Code",
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4f46e5; margin-bottom: 10px;">CryptoBot</h1>
              <p style="color: #6b7280; font-size: 16px;">Your AI-powered crypto assistant</p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin-bottom: 10px;">Hello {{name}},</p>
              <p style="margin-bottom: 15px;">Thank you for completing the onboarding process with CryptoBot. Your personalized dashboard is ready!</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 6px; text-align: center; border: 2px solid #4f46e5; margin-bottom: 15px;">
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Your Unique Access Code</p>
                <p style="font-size: 18px; font-weight: bold; color: #4f46e5; font-family: monospace;">{{code}}</p>
              </div>
              
              <p style="margin-bottom: 10px;">This code gives you access to personalized features based on your profile.</p>
              <p style="margin-bottom: 20px;">You can use it to log in to your dashboard at any time.</p>
              
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://cryptobot.ai/dashboard" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Access Your Dashboard</a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
              <p>© 2025 CryptoBot. All rights reserved.</p>
              <p>If you didn't request this email, please ignore it.</p>
            </div>
          </div>
        `,
        category: "access_code"
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Emails sent successfully",
          description: data.message,
        });
      } else {
        throw new Error(data.error || "Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        title: "Failed to send emails",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"><Clock size={12} className="mr-1" /> New</span>;
      case "contacted":
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"><AlertCircle size={12} className="mr-1" /> Contacted</span>;
      case "converted":
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"><CheckCircle size={12} className="mr-1" /> Converted</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  // Get category badge style
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "BEGINNER":
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Beginner</span>;
      case "INTER":
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Intermediate</span>;
      case "EXPERT":
        return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Expert</span>;
      case "VIP":
        return <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">VIP</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{category}</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="onboarding" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="onboarding">Onboarding Leads</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="onboarding">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Profiles</CardTitle>
                <CardDescription>
                  View and manage user onboarding data captured through the Universal Onboarding System.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters and controls */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                  <div className="flex flex-1 gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email or code..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="w-[180px]">
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <span>{filterCategory === "all" ? "All Categories" : filterCategory}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTER">Intermediate</SelectItem>
                          <SelectItem value="EXPERT">Expert</SelectItem>
                          <SelectItem value="VIP">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToCSV}
                      className="flex items-center gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Export CSV</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={sendEmails}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Send Email</span>
                    </Button>
                  </div>
                </div>
                
                {/* Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30px]">
                          <input
                            type="checkbox"
                            checked={selectedProfiles.length > 0 && selectedProfiles.length === filteredProfiles.length}
                            onChange={selectAllProfiles}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Access Code</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10">
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                              <span>Loading profiles...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredProfiles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10">
                            <div className="flex flex-col items-center gap-2">
                              <UserPlus className="h-8 w-8 text-muted-foreground" />
                              <span>No profiles match your filter criteria</span>
                              <Button 
                                variant="link" 
                                onClick={() => {
                                  setFilterCategory("all");
                                  setSearchQuery("");
                                }}
                              >
                                Clear filters
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProfiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedProfiles.includes(profile.id)}
                                onChange={() => toggleProfileSelection(profile.id)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell>{profile.name}</TableCell>
                            <TableCell>{profile.email}</TableCell>
                            <TableCell>
                              <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">
                                {profile.unique_code}
                              </span>
                            </TableCell>
                            <TableCell>{getCategoryBadge(profile.user_category)}</TableCell>
                            <TableCell>{getStatusBadge(profile.status || "new")}</TableCell>
                            <TableCell>{formatDate(profile.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon">
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination (simplified for demo) */}
                <div className="flex items-center justify-between py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <strong>{filteredProfiles.length}</strong> of <strong>{onboardingProfiles.length}</strong> profiles
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" disabled>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  User engagement analytics and onboarding metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {/* Total Users Card */}
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Users</h3>
                    <p className="text-3xl font-bold">{onboardingProfiles.length}</p>
                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <span>↑ 12%</span>
                      <span className="text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  
                  {/* User Categories Card */}
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">User Categories</h3>
                    <div className="mt-2 space-y-2">
                      {['BEGINNER', 'INTER', 'EXPERT', 'VIP'].map(category => {
                        const count = onboardingProfiles.filter(p => p.user_category === category).length;
                        const percentage = onboardingProfiles.length ? Math.round((count / onboardingProfiles.length) * 100) : 0;
                        return (
                          <div key={category} className="flex items-center gap-2">
                            <div className="text-xs font-medium w-20">{category}:</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  category === 'BEGINNER' ? 'bg-green-500' : 
                                  category === 'INTER' ? 'bg-blue-500' :
                                  category === 'EXPERT' ? 'bg-purple-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs w-10 text-right">{count}</div>
                            <div className="text-xs w-12 text-right text-muted-foreground">{percentage}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* User Status Card */}
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">User Status</h3>
                    <div className="mt-2 space-y-2">
                      {['new', 'contacted', 'converted'].map(status => {
                        const count = onboardingProfiles.filter(p => p.status === status).length;
                        const percentage = onboardingProfiles.length ? Math.round((count / onboardingProfiles.length) * 100) : 0;
                        return (
                          <div key={status} className="flex items-center gap-2">
                            <div className="text-xs font-medium w-20 capitalize">{status}:</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  status === 'new' ? 'bg-blue-500' : 
                                  status === 'contacted' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs w-10 text-right">{count}</div>
                            <div className="text-xs w-12 text-right text-muted-foreground">{percentage}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Onboarding Metrics */}
                <div className="bg-white p-4 rounded-lg border shadow-sm mb-8">
                  <h3 className="text-sm font-medium mb-4">Onboarding Conversion</h3>
                  
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div className="text-xs inline-block py-1 px-2 rounded-full bg-blue-100 text-blue-800">
                        Chatbot Opens
                      </div>
                      <div className="text-xs font-semibold inline-block text-blue-800">
                        100%
                      </div>
                    </div>
                    <div className="flex items-center mb-6">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">250</span>
                    </div>
                    
                    <div className="flex mb-2 items-center justify-between">
                      <div className="text-xs inline-block py-1 px-2 rounded-full bg-yellow-100 text-yellow-800">
                        Started Onboarding
                      </div>
                      <div className="text-xs font-semibold inline-block text-yellow-800">
                        72%
                      </div>
                    </div>
                    <div className="flex items-center mb-6">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "72%" }}></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">180</span>
                    </div>
                    
                    <div className="flex mb-2 items-center justify-between">
                      <div className="text-xs inline-block py-1 px-2 rounded-full bg-green-100 text-green-800">
                        Completed & Code Generated
                      </div>
                      <div className="text-xs font-semibold inline-block text-green-800">
                        {Math.round((onboardingProfiles.length / 250) * 100)}%
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(onboardingProfiles.length / 250) * 100}%` }}></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">{onboardingProfiles.length}</span>
                    </div>
                  </div>
                </div>
                
                {/* Date Distribution */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-medium mb-4">User Registration Timeline</h3>
                  
                  <div className="flex items-end space-x-2 h-40">
                    {Array.from({ length: 14 }).map((_, index) => {
                      const height = Math.max(10, Math.floor(Math.random() * 100));
                      const date = new Date();
                      date.setDate(date.getDate() - (13 - index));
                      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      
                      return (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div className="w-full bg-indigo-100 rounded-t" style={{ height: `${height}%` }}></div>
                          <div className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                            {formattedDate}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure the admin panel and onboarding system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Email Integration</h3>
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="email-service">Email Service</Label>
                        <Select defaultValue="firebase">
                          <SelectTrigger id="email-service">
                            <SelectValue placeholder="Select email service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="firebase">Firebase Email</SelectItem>
                            <SelectItem value="hubspot">HubSpot</SelectItem>
                            <SelectItem value="mailerlite">MailerLite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input id="api-key" placeholder="Enter API key" type="password" />
                      </div>
                      <Button variant="outline" className="w-full">Connect Email Service</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Onboarding Settings</h3>
                    <div className="grid gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-send welcome email</Label>
                          <p className="text-sm text-muted-foreground">Send welcome email when user completes onboarding</p>
                        </div>
                        <div className="flex items-center h-6">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Generate QR codes</Label>
                          <p className="text-sm text-muted-foreground">Automatically generate QR codes for access codes</p>
                        </div>
                        <div className="flex items-center h-6">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Store analytics data</Label>
                          <p className="text-sm text-muted-foreground">Track user engagement with onboarding process</p>
                        </div>
                        <div className="flex items-center h-6">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;