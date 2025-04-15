import React, { useState, useEffect } from 'react';
import { useUIConfig, UIConfig, VisibleSections } from '@/providers/UIConfigProvider';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, 
  Save, 
  Undo, 
  Image as ImageIcon, 
  Upload, 
  Palette, 
  Type, 
  Layout, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Menu, 
  CheckSquare, 
  X, 
  ArrowLeft
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Font options
const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Playfair Display', label: 'Playfair Display' },
];

// Button shape options
const BUTTON_SHAPE_OPTIONS = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'pill', label: 'Pill' },
];

// Layout options
const LAYOUT_OPTIONS = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

// Form schema for validation
const editorFormSchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Please enter a valid hex color (e.g. #FF0000)',
  }),
  font_family: z.string().min(1, {
    message: 'Please select a font family',
  }),
  layout: z.enum(['dark', 'light']),
  button_shape: z.enum(['rounded', 'square', 'pill']),
  homepage_title: z.string().min(1, {
    message: 'Homepage title is required',
  }),
  homepage_subtitle: z.string().min(1, {
    message: 'Homepage subtitle is required',
  }),
  cta_text: z.string().min(1, {
    message: 'CTA text is required',
  }),
  header_menu: z.array(z.string()).min(1, {
    message: 'At least one menu item is required',
  }),
  visible_sections: z.object({
    chat: z.boolean(),
    features: z.boolean(),
    pricing: z.boolean(),
    news: z.boolean().optional(),
    portfolio: z.boolean().optional(),
  }),
});

// Main Visual Editor Component
const VisualEditor: React.FC = () => {
  const [, setLocation] = useLocation();
  const { config, isLoading, error, updateConfig, uploadImage } = useUIConfig();
  const { toast } = useToast();
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [newMenuItem, setNewMenuItem] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Form setup
  const form = useForm<z.infer<typeof editorFormSchema>>({
    resolver: zodResolver(editorFormSchema),
    defaultValues: {
      primary_color: config.primary_color,
      font_family: config.font_family,
      layout: config.layout,
      button_shape: config.button_shape,
      homepage_title: config.homepage_title,
      homepage_subtitle: config.homepage_subtitle,
      cta_text: config.cta_text,
      header_menu: config.header_menu,
      visible_sections: config.visible_sections,
    },
  });
  
  // Update form values when config changes
  useEffect(() => {
    if (!isLoading && config) {
      form.reset({
        primary_color: config.primary_color,
        font_family: config.font_family,
        layout: config.layout,
        button_shape: config.button_shape,
        homepage_title: config.homepage_title,
        homepage_subtitle: config.homepage_subtitle,
        cta_text: config.cta_text,
        header_menu: config.header_menu,
        visible_sections: config.visible_sections,
      });
      
      setMenuItems(config.header_menu);
      
      // Reset image previews
      if (config.logo_url) {
        setLogoPreview(config.logo_url);
      }
      
      if (config.header_image_url) {
        setHeaderPreview(config.header_image_url);
      }
      
      if (config.background_image_url) {
        setBackgroundPreview(config.background_image_url);
      }
    }
  }, [config, isLoading, form]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof editorFormSchema>) => {
    try {
      setIsSaving(true);
      
      // Upload images if changed
      if (logoFile) {
        await uploadImage('logo', logoFile);
      }
      
      if (headerFile) {
        await uploadImage('header', headerFile);
      }
      
      if (backgroundFile) {
        await uploadImage('background', backgroundFile);
      }
      
      // Update configuration
      await updateConfig({
        ...data,
        header_menu: menuItems,
      });
      
      // Show success toast
      toast({
        title: 'Changes saved',
        description: 'Your changes have been applied to the application.',
      });
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: 'Error saving changes',
        description: 'There was a problem saving your changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle changes to form values
  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };
  
  // Add new menu item
  const addMenuItem = () => {
    if (newMenuItem.trim() !== '' && !menuItems.includes(newMenuItem.trim())) {
      const updatedMenu = [...menuItems, newMenuItem.trim()];
      setMenuItems(updatedMenu);
      setNewMenuItem('');
      setHasUnsavedChanges(true);
    }
  };
  
  // Remove menu item
  const removeMenuItem = (index: number) => {
    const updatedMenu = [...menuItems];
    updatedMenu.splice(index, 1);
    setMenuItems(updatedMenu);
    setHasUnsavedChanges(true);
  };
  
  // Handle image file changes
  const handleFileChange = (type: 'logo' | 'header' | 'background', event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      } else if (type === 'header') {
        setHeaderFile(file);
        setHeaderPreview(URL.createObjectURL(file));
      } else if (type === 'background') {
        setBackgroundFile(file);
        setBackgroundPreview(URL.createObjectURL(file));
      }
      
      setHasUnsavedChanges(true);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium">Loading Visual Editor...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader className="bg-destructive/10">
            <CardTitle className="text-destructive">Error Loading Editor</CardTitle>
            <CardDescription>There was a problem loading the visual editor.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'Could not connect to the configuration service.'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      {/* Header with actions */}
      <header className="border-b sticky top-0 z-50 bg-background">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation('/superadmin')}
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold">Visual Editor</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (confirm('You have unsaved changes. Are you sure you want to exit?')) {
                    setLocation('/superadmin');
                  }
                } else {
                  setLocation('/superadmin');
                }
              }}
            >
              Exit
            </Button>
            
            <Button
              variant="outline"
              onClick={() => form.reset()}
              disabled={!hasUnsavedChanges || isSaving}
            >
              <Undo className="mr-2 h-4 w-4" />
              Reset Changes
            </Button>
            
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!hasUnsavedChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content - side-by-side editor and preview */}
      <div className="container mx-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visual Editor</CardTitle>
              <CardDescription>Customize the appearance and content of your application</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onChange={handleFormChange} className="space-y-8">
                  <Tabs defaultValue="appearance">
                    <TabsList className="grid grid-cols-4 mb-6">
                      <TabsTrigger value="appearance">
                        <Palette className="w-4 h-4 mr-2" />
                        Design
                      </TabsTrigger>
                      <TabsTrigger value="content">
                        <Type className="w-4 h-4 mr-2" />
                        Content
                      </TabsTrigger>
                      <TabsTrigger value="navigation">
                        <Menu className="w-4 h-4 mr-2" />
                        Navigation
                      </TabsTrigger>
                      <TabsTrigger value="sections">
                        <Layout className="w-4 h-4 mr-2" />
                        Sections
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Appearance Tab */}
                    <TabsContent value="appearance" className="space-y-6">
                      <Accordion type="single" collapsible defaultValue="colors">
                        <AccordionItem value="colors">
                          <AccordionTrigger>
                            <div className="flex items-center">
                              <Palette className="w-4 h-4 mr-2" />
                              Colors & Theme
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name="primary_color"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Primary Color</FormLabel>
                                  <div className="flex gap-2">
                                    <div 
                                      className="w-10 h-10 rounded-md border"
                                      style={{ backgroundColor: field.value }}
                                    />
                                    <FormControl>
                                      <Input {...field} placeholder="#000000" />
                                    </FormControl>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="layout"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Theme</FormLabel>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={(value) => field.onChange(value as 'dark' | 'light')}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a theme" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {LAYOUT_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="typography">
                          <AccordionTrigger>
                            <div className="flex items-center">
                              <Type className="w-4 h-4 mr-2" />
                              Typography
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name="font_family"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Font Family</FormLabel>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a font" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {FONT_OPTIONS.map((option) => (
                                        <SelectItem 
                                          key={option.value} 
                                          value={option.value}
                                          style={{ fontFamily: option.value }}
                                        >
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="buttons">
                          <AccordionTrigger>
                            <div className="flex items-center">
                              Button Style
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name="button_shape"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Button Shape</FormLabel>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={(value) => field.onChange(value as 'rounded' | 'square' | 'pill')}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select button shape" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {BUTTON_SHAPE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex gap-2 mt-2">
                              <div 
                                className={`py-2 px-4 bg-primary text-primary-foreground text-sm font-medium ${
                                  form.watch('button_shape') === 'rounded' ? 'rounded-md' : 
                                  form.watch('button_shape') === 'square' ? 'rounded-none' : 'rounded-full'
                                }`}
                              >
                                Button Preview
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="images">
                          <AccordionTrigger>
                            <div className="flex items-center">
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Images
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-6">
                            <div>
                              <Label>Logo</Label>
                              <div className="mt-2">
                                {logoPreview && (
                                  <div className="mb-2 flex flex-col items-center">
                                    <div className="border rounded-md p-2 mb-2 max-w-[200px] max-h-[100px] flex items-center justify-center">
                                      <img 
                                        src={logoPreview} 
                                        alt="Logo preview" 
                                        className="max-w-full max-h-[100px] object-contain"
                                      />
                                    </div>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      className="h-8"
                                      onClick={() => {
                                        setLogoPreview(null);
                                        setLogoFile(null);
                                        setHasUnsavedChanges(true);
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                )}
                                <div className="flex items-center justify-center w-full">
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                      <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        PNG, JPG or SVG (MAX. 2MB)
                                      </p>
                                    </div>
                                    <input 
                                      id="dropzone-file-logo" 
                                      type="file" 
                                      className="hidden"
                                      onChange={(e) => handleFileChange('logo', e)}
                                      accept="image/png, image/jpeg, image/svg+xml"
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <Label>Header Image</Label>
                              <div className="mt-2">
                                {headerPreview && (
                                  <div className="mb-2 flex flex-col items-center">
                                    <div className="border rounded-md p-2 mb-2 w-full h-[120px]">
                                      <img 
                                        src={headerPreview} 
                                        alt="Header preview" 
                                        className="w-full h-full object-cover rounded"
                                      />
                                    </div>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      className="h-8"
                                      onClick={() => {
                                        setHeaderPreview(null);
                                        setHeaderFile(null);
                                        setHasUnsavedChanges(true);
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                )}
                                <div className="flex items-center justify-center w-full">
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                      <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        PNG or JPG (MAX. 2MB)
                                      </p>
                                    </div>
                                    <input 
                                      id="dropzone-file-header" 
                                      type="file" 
                                      className="hidden"
                                      onChange={(e) => handleFileChange('header', e)}
                                      accept="image/png, image/jpeg"
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <Label>Background Image</Label>
                              <div className="mt-2">
                                {backgroundPreview && (
                                  <div className="mb-2 flex flex-col items-center">
                                    <div className="border rounded-md p-2 mb-2 w-full h-[120px]">
                                      <img 
                                        src={backgroundPreview} 
                                        alt="Background preview" 
                                        className="w-full h-full object-cover rounded"
                                      />
                                    </div>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      className="h-8"
                                      onClick={() => {
                                        setBackgroundPreview(null);
                                        setBackgroundFile(null);
                                        setHasUnsavedChanges(true);
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                )}
                                <div className="flex items-center justify-center w-full">
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                      <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        PNG or JPG (MAX. 2MB)
                                      </p>
                                    </div>
                                    <input 
                                      id="dropzone-file-background" 
                                      type="file" 
                                      className="hidden"
                                      onChange={(e) => handleFileChange('background', e)}
                                      accept="image/png, image/jpeg"
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TabsContent>
                    
                    {/* Content Tab */}
                    <TabsContent value="content" className="space-y-6">
                      <h3 className="text-lg font-medium">Homepage Content</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="homepage_title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Homepage Title</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="homepage_subtitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Homepage Subtitle</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cta_text"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Call to Action Text</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Text displayed on the main action button
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    
                    {/* Navigation Tab */}
                    <TabsContent value="navigation" className="space-y-6">
                      <h3 className="text-lg font-medium">Header Menu</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Menu Items</Label>
                          <div className="mt-2 space-y-2">
                            {menuItems.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                <span>{item}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeMenuItem(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            placeholder="New menu item"
                            value={newMenuItem}
                            onChange={(e) => setNewMenuItem(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addMenuItem();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={addMenuItem}
                            disabled={!newMenuItem.trim()}
                          >
                            Add
                          </Button>
                        </div>
                        
                        {menuItems.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            Add at least one menu item to the navigation.
                          </p>
                        )}
                      </div>
                    </TabsContent>
                    
                    {/* Sections Tab */}
                    <TabsContent value="sections" className="space-y-6">
                      <h3 className="text-lg font-medium">Visible Sections</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="visible_sections.chat"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Chat Assistant
                                </FormLabel>
                                <FormDescription>
                                  AI chat interface for user interactions
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="visible_sections.features"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Features Section
                                </FormLabel>
                                <FormDescription>
                                  Highlights of platform capabilities
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="visible_sections.pricing"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Pricing Section
                                </FormLabel>
                                <FormDescription>
                                  Plans and subscription options
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="visible_sections.news"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  News Section
                                </FormLabel>
                                <FormDescription>
                                  Latest cryptocurrency news and updates
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="visible_sections.portfolio"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Portfolio Section
                                </FormLabel>
                                <FormDescription>
                                  User portfolio tracking and management
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Preview panel */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your changes affect the application in real-time</CardDescription>
              </div>
              <div className="flex items-center gap-2 border rounded-md p-1">
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setPreviewDevice('desktop')}
                  className="h-8 w-8"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setPreviewDevice('tablet')}
                  className="h-8 w-8"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setPreviewDevice('mobile')}
                  className="h-8 w-8"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted p-2 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="bg-background rounded px-2 py-1 text-xs">
                    {previewDevice === 'desktop' ? 'Desktop View' : previewDevice === 'tablet' ? 'Tablet View' : 'Mobile View'}
                  </div>
                </div>
                <div 
                  className={`bg-background overflow-hidden ${
                    previewDevice === 'desktop' ? 'w-full' : 
                    previewDevice === 'tablet' ? 'max-w-[768px] mx-auto' : 
                    'max-w-[390px] mx-auto'
                  }`}
                >
                  <ScrollArea className="h-[600px]">
                    <div className="p-4">
                      {/* Preview Header */}
                      <div className="border-b pb-4 mb-6 flex justify-between items-center"
                           style={{ fontFamily: form.watch('font_family') }}>
                        <div className="flex items-center gap-2">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="h-8 object-contain" />
                          ) : (
                            <div className="font-bold text-lg" style={{ color: form.watch('primary_color') }}>
                              CryptoBot
                            </div>
                          )}
                        </div>
                        
                        {/* Navigation */}
                        {previewDevice !== 'mobile' && (
                          <div className="flex items-center gap-6">
                            {menuItems.map((item, index) => (
                              <div key={index} className="text-sm font-medium cursor-pointer hover:text-primary">
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {previewDevice === 'mobile' && (
                          <div className="p-1">
                            <Menu className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      
                      {/* Hero Section */}
                      <div className="py-12 text-center" style={{ fontFamily: form.watch('font_family') }}>
                        {headerPreview && (
                          <div className="mb-8">
                            <img 
                              src={headerPreview} 
                              alt="Header" 
                              className="w-full h-48 object-cover rounded-lg mx-auto"
                            />
                          </div>
                        )}
                        
                        <h1 
                          className="text-4xl font-bold mb-4"
                          style={{ color: form.watch('primary_color') }}
                        >
                          {form.watch('homepage_title')}
                        </h1>
                        
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                          {form.watch('homepage_subtitle')}
                        </p>
                        
                        <button 
                          className={`px-6 py-3 font-medium text-primary-foreground ${
                            form.watch('button_shape') === 'rounded' ? 'rounded-md' : 
                            form.watch('button_shape') === 'square' ? 'rounded-none' : 'rounded-full'
                          }`}
                          style={{ backgroundColor: form.watch('primary_color') }}
                        >
                          {form.watch('cta_text')}
                        </button>
                      </div>
                      
                      {/* Features Section */}
                      {form.watch('visible_sections.features') && (
                        <div className="py-12 border-t">
                          <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: form.watch('font_family') }}>
                            Features
                          </h2>
                          
                          <div className={`grid gap-6 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="border rounded-lg p-6">
                                <div 
                                  className="w-12 h-12 rounded-full mb-4 flex items-center justify-center"
                                  style={{ backgroundColor: `${form.watch('primary_color')}20` }}
                                >
                                  <div className="w-6 h-6" style={{ backgroundColor: form.watch('primary_color') }} />
                                </div>
                                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: form.watch('font_family') }}>
                                  Feature {i + 1}
                                </h3>
                                <p className="text-muted-foreground">
                                  Description for feature {i + 1}. This showcases a key capability of the platform.
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Pricing Section */}
                      {form.watch('visible_sections.pricing') && (
                        <div className="py-12 border-t">
                          <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: form.watch('font_family') }}>
                            Pricing Plans
                          </h2>
                          
                          <div className={`grid gap-6 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                            {['Basic', 'Premium', 'Enterprise'].map((plan, i) => (
                              <div key={i} className={`border rounded-lg p-6 ${i === 1 ? 'border-primary' : ''}`}>
                                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: form.watch('font_family') }}>
                                  {plan}
                                </h3>
                                <div className="text-3xl font-bold mb-4">
                                  ${(i + 1) * 9.99}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                                </div>
                                <ul className="mb-6 space-y-2">
                                  {Array.from({ length: 3 + i }).map((_, j) => (
                                    <li key={j} className="flex items-center">
                                      <CheckSquare 
                                        className="h-4 w-4 mr-2" 
                                        style={{ color: form.watch('primary_color') }}
                                      />
                                      <span>Feature {j + 1}</span>
                                    </li>
                                  ))}
                                </ul>
                                <button 
                                  className={`w-full py-2 ${
                                    form.watch('button_shape') === 'rounded' ? 'rounded-md' : 
                                    form.watch('button_shape') === 'square' ? 'rounded-none' : 'rounded-full'
                                  } ${i === 1 ? 'text-primary-foreground' : 'text-primary border'}`}
                                  style={{ 
                                    backgroundColor: i === 1 ? form.watch('primary_color') : 'transparent',
                                    borderColor: form.watch('primary_color'),
                                    color: i === 1 ? 'white' : form.watch('primary_color')
                                  }}
                                >
                                  {form.watch('cta_text')}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Chat Section */}
                      {form.watch('visible_sections.chat') && (
                        <div className="py-12 border-t">
                          <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: form.watch('font_family') }}>
                            AI Assistant
                          </h2>
                          
                          <div className="max-w-md mx-auto border rounded-lg overflow-hidden">
                            <div 
                              className="p-4 font-medium" 
                              style={{ backgroundColor: form.watch('primary_color'), color: 'white' }}
                            >
                              AI Chat
                            </div>
                            <div className="p-4 bg-background min-h-[200px]">
                              <div className="mb-4 bg-muted p-3 rounded-lg">
                                <p className="text-sm">
                                  Hello! I'm your AI assistant. How can I help you today?
                                </p>
                              </div>
                              <div className="flex gap-2 mt-auto">
                                <Input placeholder="Type your message..." />
                                <Button
                                  className={`${
                                    form.watch('button_shape') === 'rounded' ? 'rounded-md' : 
                                    form.watch('button_shape') === 'square' ? 'rounded-none' : 'rounded-full'
                                  }`}
                                  style={{ backgroundColor: form.watch('primary_color') }}
                                >
                                  Send
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* News Section */}
                      {form.watch('visible_sections.news') && (
                        <div className="py-12 border-t">
                          <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: form.watch('font_family') }}>
                            Crypto News
                          </h2>
                          
                          <div className={`grid gap-6 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="border rounded-lg overflow-hidden">
                                <div className="h-40 bg-muted" />
                                <div className="p-4">
                                  <h3 className="font-bold mb-2" style={{ fontFamily: form.watch('font_family') }}>
                                    Cryptocurrency News Article {i + 1}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    This is a sample news article about cryptocurrency markets and trends.
                                  </p>
                                  <div className="text-xs text-muted-foreground">April 15, 2025</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Portfolio Section */}
                      {form.watch('visible_sections.portfolio') && (
                        <div className="py-12 border-t">
                          <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: form.watch('font_family') }}>
                            Portfolio Tracker
                          </h2>
                          
                          <div className="border rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="font-bold" style={{ fontFamily: form.watch('font_family') }}>
                                Your Assets
                              </h3>
                              <button 
                                className={`px-3 py-1 text-sm ${
                                  form.watch('button_shape') === 'rounded' ? 'rounded-md' : 
                                  form.watch('button_shape') === 'square' ? 'rounded-none' : 'rounded-full'
                                }`}
                                style={{ backgroundColor: form.watch('primary_color'), color: 'white' }}
                              >
                                Add Asset
                              </button>
                            </div>
                            
                            <div className="space-y-4">
                              {['Bitcoin', 'Ethereum', 'Solana'].map((coin, i) => (
                                <div key={i} className="flex justify-between items-center p-3 border rounded">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-8 h-8 rounded-full" 
                                      style={{ backgroundColor: `${form.watch('primary_color')}20` }}
                                    />
                                    <div>
                                      <div className="font-medium">{coin}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {['BTC', 'ETH', 'SOL'][i]}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">${(Math.random() * 10000).toFixed(2)}</div>
                                    <div className={`text-xs ${i % 2 === 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {i % 2 === 0 ? '+' : '-'}{(Math.random() * 10).toFixed(2)}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Footer */}
                      <div className="border-t py-6 mt-12">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                          <div style={{ fontFamily: form.watch('font_family') }}>
                            <div className="font-bold" style={{ color: form.watch('primary_color') }}>
                              CryptoBot
                            </div>
                            <div className="text-sm text-muted-foreground">
                              © 2025 All rights reserved
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {menuItems.slice(0, 3).map((item, index) => (
                              <div key={index} className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-xs text-muted-foreground">
                This is a preview only. Actual appearance may vary slightly.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VisualEditor;