import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, PlusIcon, MinusIcon, Trash2Icon, Calculator, InfoIcon, ArrowRightIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Types
type CountryOption = {
  code: string;
  name: string;
};

type TaxRule = {
  shortTermRates: Array<{ rate: number; min: number; max: number | null }>;
  longTermRates: Array<{ rate: number; min: number; max: number | null }>;
  shortTermDuration: number;
  taxablePercentage: number;
  allowLosses: boolean;
  maxLossCarryForward: number | null;
  hasTaxFreeAllowance: boolean;
  taxFreeAllowance: number;
};

type TaxInfo = {
  country: string;
  rules: TaxRule;
  summary: string;
};

type Transaction = {
  id: string;
  type: 'buy' | 'sell';
  asset: string;
  quantity: number;
  price: number;
  date: string;
  fees: number;
};

type TaxResult = {
  totalGain: number;
  taxableGain: number;
  taxAmount: number;
  taxRate: number;
  shortTermGains: number;
  longTermGains: number;
  remainingTaxFreeAllowance: number;
  transactions: Array<{
    id: string;
    asset: string;
    acquiredDate: string;
    disposalDate: string;
    holdingPeriod: number;
    isLongTerm: boolean;
    proceeds: number;
    costBasis: number;
    gain: number;
    taxableGain: number;
    taxAmount: number;
    taxRate: number;
  }>;
};

// Schema for form validation
const transactionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['buy', 'sell']),
  asset: z.string().min(1, 'Asset is required'),
  quantity: z.preprocess(
    (a) => parseFloat(a as string),
    z.number().positive('Quantity must be positive')
  ),
  price: z.preprocess(
    (a) => parseFloat(a as string),
    z.number().positive('Price must be positive')
  ),
  date: z.preprocess(
    (a) => a ? new Date(a as string) : undefined,
    z.date().max(new Date(), 'Date cannot be in the future')
  ),
  fees: z.preprocess(
    (a) => parseFloat(a as string || '0'),
    z.number().min(0, 'Fees must be non-negative')
  ),
});

const formSchema = z.object({
  transactions: z.array(transactionSchema).min(1, 'Add at least one transaction'),
  country: z.string().min(1, 'Country is required'),
  income: z.preprocess(
    (a) => parseFloat(a as string || '0'),
    z.number().min(0, 'Income must be non-negative')
  ),
  year: z.preprocess(
    (a) => parseInt(a as string, 10),
    z.number().min(2000, 'Year must be 2000 or later').max(2050, 'Year must be 2050 or earlier')
  ),
});

// Common cryptocurrencies
const commonCryptos = [
  'BTC',
  'ETH',
  'SOL',
  'ADA',
  'DOT',
  'XRP',
  'DOGE',
  'AVAX',
  'LINK',
  'UNI',
  'MATIC'
];

export function TaxSimulator() {
  const [activeTab, setActiveTab] = useState<string>('input');
  const [taxResults, setTaxResults] = useState<TaxResult | null>(null);
  
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactions: [
        {
          id: generateId(),
          type: 'buy',
          asset: 'BTC',
          quantity: 1,
          price: 30000,
          date: new Date('2023-01-01'),
          fees: 10
        }
      ],
      country: 'us',
      income: 50000,
      year: new Date().getFullYear()
    }
  });
  
  // Field array for transactions
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'transactions'
  });
  
  // Queries
  const countriesQuery = useQuery({
    queryKey: ['/api/tax/countries'],
    queryFn: async () => {
      const response = await fetch('/api/tax/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      
      const data = await response.json();
      return data.data as CountryOption[];
    }
  });
  
  const taxInfoQuery = useQuery({
    queryKey: ['/api/tax/info', form.watch('country')],
    queryFn: async () => {
      const country = form.watch('country');
      if (!country) return null;
      
      const response = await fetch(`/api/tax/info/${country}`);
      if (!response.ok) throw new Error('Failed to fetch tax info');
      
      const data = await response.json();
      return data.data as TaxInfo;
    },
    enabled: !!form.watch('country')
  });
  
  // Calculate taxes mutation
  const calculateTaxesMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest('POST', '/api/tax/calculate', data);
      const result = await response.json();
      return result.data as TaxResult;
    },
    onSuccess: (data) => {
      setTaxResults(data);
      setActiveTab('results');
      toast({
        title: 'Tax Calculation Complete',
        description: 'Your crypto tax calculation has been processed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Calculation Failed',
        description: `There was an error calculating your taxes: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Format dates to ISO strings
    const formattedData = {
      ...data,
      transactions: data.transactions.map(tx => ({
        ...tx,
        id: tx.id || generateId(),
        date: tx.date.toISOString()
      }))
    };
    
    calculateTaxesMutation.mutate(formattedData);
  };
  
  // Add transaction
  const addTransaction = () => {
    append({
      id: generateId(),
      type: 'buy',
      asset: 'BTC',
      quantity: 1,
      price: 30000,
      date: new Date(),
      fees: 0
    });
  };
  
  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Helper to format percentage
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Generate a unique ID
  function generateId() {
    return Math.random().toString(36).substring(2, 10);
  }
  
  // A helper component for showing tax rules
  const TaxRulesCard = ({ taxInfo }: { taxInfo: TaxInfo | null }) => {
    if (!taxInfo) return null;
    
    const { rules, summary } = taxInfo;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tax Rules for {taxInfo.country.toUpperCase()}</CardTitle>
          <CardDescription>{summary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Short-Term Rates</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rate</TableHead>
                  <TableHead>Minimum</TableHead>
                  <TableHead>Maximum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.shortTermRates.map((rate, i) => (
                  <TableRow key={i}>
                    <TableCell>{formatPercentage(rate.rate)}</TableCell>
                    <TableCell>{formatCurrency(rate.min)}</TableCell>
                    <TableCell>{rate.max ? formatCurrency(rate.max) : 'No Limit'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {rules.shortTermDuration > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Long-Term Rates (held for more than {rules.shortTermDuration} days)</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rate</TableHead>
                    <TableHead>Minimum</TableHead>
                    <TableHead>Maximum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.longTermRates.map((rate, i) => (
                    <TableRow key={i}>
                      <TableCell>{formatPercentage(rate.rate)}</TableCell>
                      <TableCell>{formatCurrency(rate.min)}</TableCell>
                      <TableCell>{rate.max ? formatCurrency(rate.max) : 'No Limit'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {rules.hasTaxFreeAllowance && (
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Tax-Free Allowance:</strong> {formatCurrency(rules.taxFreeAllowance)} of gains are tax-free each year.
              </p>
            </div>
          )}
          
          {rules.taxablePercentage < 100 && (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Taxable Percentage:</strong> Only {rules.taxablePercentage}% of your gains are subject to taxation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Calculator className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-2xl font-bold">Crypto Tax Simulator</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4 grid grid-cols-2">
          <TabsTrigger value="input">Input Transactions</TabsTrigger>
          <TabsTrigger value="results" disabled={!taxResults}>Tax Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="input">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Enter your cryptocurrency transactions to calculate taxes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  disabled={countriesQuery.isLoading}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select your country" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {countriesQuery.isLoading ? (
                                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                                    ) : countriesQuery.isError ? (
                                      <SelectItem value="error" disabled>Error loading countries</SelectItem>
                                    ) : (
                                      countriesQuery.data?.map(country => (
                                        <SelectItem key={country.code} value={country.code}>
                                          {country.name}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tax Year</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="2024" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="income"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Annual Income
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" className="h-4 w-4 p-0 ml-2">
                                      <InfoIcon className="h-3 w-3" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 p-3">
                                    <p className="text-sm">
                                      Enter your annual income to calculate the appropriate tax bracket.
                                      This helps us determine the correct rate for your capital gains tax.
                                    </p>
                                  </PopoverContent>
                                </Popover>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="50000" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Transactions</h3>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addTransaction}
                            >
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Add Transaction
                            </Button>
                          </div>
                          
                          {fields.length === 0 ? (
                            <div className="text-center py-8 border border-dashed rounded-md">
                              <p className="text-gray-500">No transactions added yet</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={addTransaction}
                              >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Transaction
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {fields.map((field, index) => (
                                <Card key={field.id} className="relative">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => remove(index)}
                                  >
                                    <Trash2Icon className="h-4 w-4 text-red-500" />
                                  </Button>
                                  
                                  <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                      <FormField
                                        control={form.control}
                                        name={`transactions.${index}.type`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                              value={field.value}
                                              onValueChange={field.onChange}
                                            >
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="buy">Buy</SelectItem>
                                                <SelectItem value="sell">Sell</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name={`transactions.${index}.asset`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Asset</FormLabel>
                                            <Select
                                              value={field.value}
                                              onValueChange={field.onChange}
                                            >
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select asset" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {commonCryptos.map(crypto => (
                                                  <SelectItem key={crypto} value={crypto}>
                                                    {crypto}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name={`transactions.${index}.date`}
                                        render={({ field }) => (
                                          <FormItem className="flex flex-col">
                                            <FormLabel>Date</FormLabel>
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <FormControl>
                                                  <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                      "w-full pl-3 text-left font-normal",
                                                      !field.value && "text-muted-foreground"
                                                    )}
                                                  >
                                                    {field.value ? (
                                                      format(field.value, "PPP")
                                                    ) : (
                                                      <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                  </Button>
                                                </FormControl>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                  mode="single"
                                                  selected={field.value}
                                                  onSelect={field.onChange}
                                                  disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                  }
                                                  initialFocus
                                                />
                                              </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name={`transactions.${index}.quantity`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl>
                                              <Input 
                                                type="number" 
                                                step="any"
                                                placeholder="1.0" 
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name={`transactions.${index}.price`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Price Per Unit (USD)</FormLabel>
                                            <FormControl>
                                              <Input 
                                                type="number" 
                                                step="any"
                                                placeholder="30000" 
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name={`transactions.${index}.fees`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Fees (USD)</FormLabel>
                                            <FormControl>
                                              <Input 
                                                type="number" 
                                                step="any"
                                                placeholder="0" 
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={calculateTaxesMutation.isPending}
                        >
                          {calculateTaxesMutation.isPending ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Calculating...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Calculator className="mr-2 h-5 w-5" />
                              Calculate Taxes
                            </div>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              {taxInfoQuery.isLoading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ) : taxInfoQuery.isError ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load tax information for this country.
                  </AlertDescription>
                </Alert>
              ) : (
                <TaxRulesCard taxInfo={taxInfoQuery.data} />
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="results">
          {!taxResults ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Calculate your taxes first to see results</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => setActiveTab('input')}
              >
                Go to Input Form
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Calculation Summary</CardTitle>
                  <CardDescription>
                    Tax year {form.getValues().year} for {countriesQuery.data?.find(c => c.code === form.getValues().country)?.name || form.getValues().country.toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">Total Gain/Loss</p>
                          <p className={`text-2xl font-bold ${taxResults.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(taxResults.totalGain)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">Taxable Gain</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(taxResults.taxableGain)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">Tax Rate</p>
                          <p className="text-2xl font-bold">
                            {formatPercentage(taxResults.taxRate)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">Tax Owed</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(taxResults.taxAmount)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">Short-Term Gains</p>
                          <p className={`text-xl font-semibold ${taxResults.shortTermGains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(taxResults.shortTermGains)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">Long-Term Gains</p>
                          <p className={`text-xl font-semibold ${taxResults.longTermGains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(taxResults.longTermGains)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Details</CardTitle>
                  <CardDescription>
                    Breakdown of each disposal transaction for tax purposes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {taxResults.transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No taxable transactions found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset</TableHead>
                          <TableHead>Acquisition Date</TableHead>
                          <TableHead>Disposal Date</TableHead>
                          <TableHead>Term</TableHead>
                          <TableHead className="text-right">Proceeds</TableHead>
                          <TableHead className="text-right">Cost Basis</TableHead>
                          <TableHead className="text-right">Gain/Loss</TableHead>
                          <TableHead className="text-right">Tax</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {taxResults.transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-medium">{tx.asset}</TableCell>
                            <TableCell>{format(new Date(tx.acquiredDate), 'PPP')}</TableCell>
                            <TableCell>{format(new Date(tx.disposalDate), 'PPP')}</TableCell>
                            <TableCell>
                              <Badge variant={tx.isLongTerm ? "outline" : "secondary"}>
                                {tx.isLongTerm ? 'Long' : 'Short'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(tx.proceeds)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(tx.costBasis)}</TableCell>
                            <TableCell className={`text-right ${tx.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(tx.gain)}
                            </TableCell>
                            <TableCell className="text-right text-red-600">
                              {formatCurrency(tx.taxAmount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('input')}
                  >
                    <ArrowRightIcon className="h-4 w-4 mr-2" />
                    Back to Calculator
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}