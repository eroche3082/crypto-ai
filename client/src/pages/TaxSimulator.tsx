import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCrypto } from "@/contexts/CryptoContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Calculator, Plus, Trash2, Download, FilePieChart, FileText } from "lucide-react";

// Schema para el formulario de transacciones
const transactionSchema = z.object({
  type: z.enum(["buy", "sell", "swap", "mining", "staking", "gift", "airdrop"]),
  asset: z.string().min(1, { message: "Por favor seleccione un activo" }),
  quantity: z.string().min(1, { message: "Cantidad requerida" }).refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 
    { message: "Por favor ingrese un número válido mayor a 0" }
  ),
  price: z.string().min(1, { message: "Precio requerido" }).refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 
    { message: "Por favor ingrese un número válido" }
  ),
  date: z.string().min(1, { message: "Fecha requerida" }),
  fee: z.string().default("0").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 
    { message: "Por favor ingrese un número válido" }
  ),
});

// Schema para el formulario de información fiscal
const taxInfoSchema = z.object({
  country: z.string().min(1, { message: "País requerido" }),
  taxYear: z.string().min(1, { message: "Año fiscal requerido" }),
  taxBracket: z.string().min(1, { message: "Tasa impositiva requerida" }),
  holdingPeriod: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;
type TaxInfoFormValues = z.infer<typeof taxInfoSchema>;

interface Transaction extends TransactionFormValues {
  id: string;
}

// Opciones predefinidas
const COUNTRIES = [
  { value: "us", label: "Estados Unidos" },
  { value: "es", label: "España" },
  { value: "mx", label: "México" },
  { value: "ar", label: "Argentina" },
  { value: "co", label: "Colombia" },
  { value: "cl", label: "Chile" },
  { value: "pe", label: "Perú" },
  { value: "other", label: "Otro" },
];

const TAX_YEARS = [
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
];

const TAX_BRACKETS = [
  { value: "0.10", label: "10%" },
  { value: "0.15", label: "15%" },
  { value: "0.20", label: "20%" },
  { value: "0.25", label: "25%" },
  { value: "0.30", label: "30%" },
  { value: "0.35", label: "35%" },
  { value: "0.37", label: "37%" },
  { value: "custom", label: "Personalizado" },
];

const TaxSimulator: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { cryptoData } = useCrypto();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [taxInfo, setTaxInfo] = useState<TaxInfoFormValues | null>(null);
  const [taxResults, setTaxResults] = useState<any | null>(null);
  const [customTaxRate, setCustomTaxRate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("transactions");

  // Formulario para transacciones
  const transactionForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "buy",
      asset: "",
      quantity: "",
      price: "",
      date: new Date().toISOString().split('T')[0],
      fee: "0",
    },
  });

  // Formulario para la información fiscal
  const taxInfoForm = useForm<TaxInfoFormValues>({
    resolver: zodResolver(taxInfoSchema),
    defaultValues: {
      country: "us",
      taxYear: "2024",
      taxBracket: "0.20",
      holdingPeriod: "long",
    },
  });

  // Añadir una transacción
  const onAddTransaction = (data: TransactionFormValues) => {
    const newTransaction: Transaction = {
      ...data,
      id: Date.now().toString(),
    };
    
    setTransactions([...transactions, newTransaction]);
    transactionForm.reset({
      type: "buy",
      asset: "",
      quantity: "",
      price: "",
      date: new Date().toISOString().split('T')[0],
      fee: "0",
    });
    
    toast({
      title: "Transacción añadida",
      description: `Transacción de ${data.type} añadida correctamente.`,
    });
  };

  // Eliminar una transacción
  const onDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast({
      title: "Transacción eliminada",
      description: "La transacción ha sido eliminada correctamente.",
    });
  };

  // Guardar información fiscal
  const onSaveTaxInfo = (data: TaxInfoFormValues) => {
    // Si la tasa es personalizada, usamos el valor ingresado por el usuario
    if (data.taxBracket === "custom" && customTaxRate) {
      const customRate = parseFloat(customTaxRate) / 100;
      data.taxBracket = customRate.toString();
    }
    
    setTaxInfo(data);
    setActiveTab("results");
    calculateTaxes(data);
    
    toast({
      title: "Información fiscal guardada",
      description: "Tus preferencias fiscales han sido actualizadas.",
    });
  };

  // Calcular impuestos
  const calculateTaxes = (taxData: TaxInfoFormValues) => {
    if (transactions.length === 0) {
      toast({
        title: "Error",
        description: "Debes añadir al menos una transacción para calcular impuestos.",
        variant: "destructive",
      });
      return;
    }

    // Agrupar transacciones por tipo de activo
    const assetGroups: Record<string, Transaction[]> = {};
    transactions.forEach(transaction => {
      if (!assetGroups[transaction.asset]) {
        assetGroups[transaction.asset] = [];
      }
      assetGroups[transaction.asset].push(transaction);
    });

    let totalGainLoss = 0;
    let shortTermGainLoss = 0;
    let longTermGainLoss = 0;
    let taxableIncome = 0;
    
    // Calcular ganancias/pérdidas por activo
    const assetResults: Record<string, any> = {};
    
    Object.keys(assetGroups).forEach(asset => {
      const txs = assetGroups[asset].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      let assetBuyTotal = 0;
      let assetSellTotal = 0;
      let assetQuantityBought = 0;
      let assetQuantitySold = 0;
      let assetFees = 0;
      
      txs.forEach(tx => {
        const amount = parseFloat(tx.quantity) * parseFloat(tx.price);
        const fee = parseFloat(tx.fee);
        assetFees += fee;
        
        if (tx.type === "buy") {
          assetBuyTotal += amount + fee;
          assetQuantityBought += parseFloat(tx.quantity);
        } else if (tx.type === "sell") {
          assetSellTotal += amount - fee;
          assetQuantitySold += parseFloat(tx.quantity);
        } else if (["mining", "staking", "airdrop", "gift"].includes(tx.type)) {
          // Estos son considerados ingresos en muchas jurisdicciones
          taxableIncome += amount;
          assetQuantityBought += parseFloat(tx.quantity);
        }
      });
      
      // Cálculo simplificado (en un escenario real se usaría FIFO, LIFO o costo promedio)
      const averageCostBasis = assetQuantityBought > 0 ? assetBuyTotal / assetQuantityBought : 0;
      const realizedGainLoss = assetSellTotal - (averageCostBasis * assetQuantitySold);
      
      // Para simplificación, asumimos que las transacciones > 1 año son a largo plazo
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      let shortTerm = 0;
      let longTerm = 0;
      
      txs.filter(tx => tx.type === "sell").forEach(tx => {
        const txDate = new Date(tx.date);
        const amount = parseFloat(tx.quantity) * parseFloat(tx.price);
        const isLongTerm = txDate < oneYearAgo;
        
        if (isLongTerm) {
          longTerm += amount;
        } else {
          shortTerm += amount;
        }
      });
      
      const totalSold = shortTerm + longTerm;
      const shortTermRatio = totalSold > 0 ? shortTerm / totalSold : 0;
      const longTermRatio = totalSold > 0 ? longTerm / totalSold : 0;
      
      const assetShortTermGain = realizedGainLoss * shortTermRatio;
      const assetLongTermGain = realizedGainLoss * longTermRatio;
      
      shortTermGainLoss += assetShortTermGain;
      longTermGainLoss += assetLongTermGain;
      totalGainLoss += realizedGainLoss;
      
      assetResults[asset] = {
        transactions: txs.length,
        bought: assetQuantityBought,
        sold: assetQuantitySold,
        costBasis: assetBuyTotal,
        proceeds: assetSellTotal,
        fees: assetFees,
        gainLoss: realizedGainLoss,
        shortTermGain: assetShortTermGain,
        longTermGain: assetLongTermGain,
      };
    });
    
    // Calcular impuestos
    const taxRate = parseFloat(taxData.taxBracket);
    
    // En muchos países, las ganancias a largo plazo tienen mejor tratamiento fiscal
    const shortTermTaxRate = taxRate;
    const longTermTaxRate = taxData.country === "us" ? Math.max(0, taxRate - 0.10) : taxRate;
    
    const shortTermTax = shortTermGainLoss > 0 ? shortTermGainLoss * shortTermTaxRate : 0;
    const longTermTax = longTermGainLoss > 0 ? longTermGainLoss * longTermTaxRate : 0;
    const incomeTax = taxableIncome * taxRate;
    const totalTax = shortTermTax + longTermTax + incomeTax;
    
    setTaxResults({
      summary: {
        totalGainLoss,
        shortTermGainLoss,
        longTermGainLoss,
        taxableIncome,
        shortTermTax,
        longTermTax,
        incomeTax,
        totalTax,
        effectiveTaxRate: totalGainLoss > 0 ? totalTax / totalGainLoss : 0,
      },
      assetResults,
    });
  };

  // Exportar informe (simulado)
  const exportReport = () => {
    toast({
      title: "Exportando informe",
      description: "Tu informe fiscal se está descargando.",
    });
    
    setTimeout(() => {
      toast({
        title: "Informe exportado",
        description: "El informe ha sido generado y descargado como PDF.",
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-background border-b border-border px-4 py-3">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {t("taxSimulator.title", "Crypto Tax Simulator")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("taxSimulator.subtitle", "Calculate your potential tax obligations for cryptocurrency operations")}
        </p>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">1. Transacciones</TabsTrigger>
            <TabsTrigger value="taxinfo">2. Información Fiscal</TabsTrigger>
            <TabsTrigger value="results">3. Resultados</TabsTrigger>
          </TabsList>
          
          {/* Sección de Transacciones */}
          <TabsContent value="transactions" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("taxSimulator.addTransaction", "Añadir Transacción")}</CardTitle>
                <CardDescription>
                  {t("taxSimulator.addTransactionDesc", "Ingresa los detalles de tus transacciones de criptomonedas")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...transactionForm}>
                  <form onSubmit={transactionForm.handleSubmit(onAddTransaction)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={transactionForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("taxSimulator.transactionType", "Tipo de Transacción")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("taxSimulator.selectType", "Seleccionar tipo")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="buy">{t("taxSimulator.buy", "Compra")}</SelectItem>
                                <SelectItem value="sell">{t("taxSimulator.sell", "Venta")}</SelectItem>
                                <SelectItem value="swap">{t("taxSimulator.swap", "Intercambio")}</SelectItem>
                                <SelectItem value="mining">{t("taxSimulator.mining", "Minería")}</SelectItem>
                                <SelectItem value="staking">{t("taxSimulator.staking", "Staking")}</SelectItem>
                                <SelectItem value="gift">{t("taxSimulator.gift", "Regalo/Donación")}</SelectItem>
                                <SelectItem value="airdrop">{t("taxSimulator.airdrop", "Airdrop")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={transactionForm.control}
                        name="asset"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("taxSimulator.asset", "Activo")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("taxSimulator.selectAsset", "Seleccionar activo")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cryptoData && cryptoData.length > 0 ? 
                                  cryptoData.map((crypto: any) => (
                                    <SelectItem key={crypto.id} value={crypto.symbol.toUpperCase()}>
                                      {crypto.name} ({crypto.symbol.toUpperCase()})
                                    </SelectItem>
                                  )) : 
                                  ["BTC", "ETH", "SOL", "XRP", "USDT", "BNB", "ADA", "DOGE"].map((symbol) => (
                                    <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={transactionForm.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("taxSimulator.quantity", "Cantidad")}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="any" min="0" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={transactionForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("taxSimulator.price", "Precio por unidad (USD)")}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="any" min="0" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={transactionForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("taxSimulator.date", "Fecha")}</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={transactionForm.control}
                        name="fee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("taxSimulator.fee", "Comisión (USD)")}</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="any" min="0" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      {t("taxSimulator.addTransaction", "Añadir Transacción")}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Lista de Transacciones */}
            {transactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("taxSimulator.transactions", "Transacciones")}</CardTitle>
                  <CardDescription>
                    {t("taxSimulator.transactionsDesc", `${transactions.length} transacciones registradas`)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{transaction.asset}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {transaction.type === "buy" ? t("taxSimulator.buy", "Compra") :
                                 transaction.type === "sell" ? t("taxSimulator.sell", "Venta") :
                                 transaction.type === "swap" ? t("taxSimulator.swap", "Intercambio") :
                                 transaction.type === "mining" ? t("taxSimulator.mining", "Minería") :
                                 transaction.type === "staking" ? t("taxSimulator.staking", "Staking") :
                                 transaction.type === "gift" ? t("taxSimulator.gift", "Regalo") :
                                 t("taxSimulator.airdrop", "Airdrop")}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.quantity} @ ${parseFloat(transaction.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString()} 
                              {parseFloat(transaction.fee) > 0 && ` • Comisión: $${parseFloat(transaction.fee).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t("taxSimulator.transactionsTotal", `Total: ${transactions.length} transacciones`)}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("taxinfo")}
                    disabled={transactions.length === 0}
                  >
                    {t("taxSimulator.continue", "Continuar")}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          {/* Sección de Información Fiscal */}
          <TabsContent value="taxinfo" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("taxSimulator.taxInfo", "Información Fiscal")}</CardTitle>
                <CardDescription>
                  {t("taxSimulator.taxInfoDesc", "Configura tus preferencias fiscales para el cálculo de impuestos")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...taxInfoForm}>
                  <form onSubmit={taxInfoForm.handleSubmit(onSaveTaxInfo)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={taxInfoForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("taxSimulator.country", "País de residencia fiscal")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("taxSimulator.selectCountry", "Seleccionar país")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country.value} value={country.value}>{country.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {t("taxSimulator.countryDesc", "Este es un simulador. Para casos reales, consulta con un asesor fiscal.")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={taxInfoForm.control}
                        name="taxYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("taxSimulator.taxYear", "Año fiscal")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("taxSimulator.selectYear", "Seleccionar año")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TAX_YEARS.map((year) => (
                                  <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={taxInfoForm.control}
                        name="taxBracket"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("taxSimulator.taxBracket", "Tasa impositiva")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("taxSimulator.selectRate", "Seleccionar tasa")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TAX_BRACKETS.map((bracket) => (
                                  <SelectItem key={bracket.value} value={bracket.value}>{bracket.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                            {field.value === "custom" && (
                              <div className="mt-2">
                                <Input
                                  type="number"
                                  placeholder="Tasa personalizada (%)"
                                  value={customTaxRate}
                                  onChange={(e) => setCustomTaxRate(e.target.value)}
                                  min="0"
                                  max="100"
                                  step="0.1"
                                />
                              </div>
                            )}
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={taxInfoForm.control}
                        name="holdingPeriod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("taxSimulator.holdingPeriod", "Periodo de tenencia preferente")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("taxSimulator.selectHolding", "Seleccionar período")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="short">{t("taxSimulator.shortTerm", "Corto plazo (<1 año)")}</SelectItem>
                                <SelectItem value="long">{t("taxSimulator.longTerm", "Largo plazo (>1 año)")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {t("taxSimulator.holdingDesc", "Muchas jurisdicciones ofrecen tasas preferenciales para activos mantenidos por más de un año.")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      {t("taxSimulator.calculateTaxes", "Calcular Impuestos")}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("transactions")}
                >
                  {t("taxSimulator.back", "Regresar")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Sección de Resultados */}
          <TabsContent value="results" className="space-y-4 pt-4">
            {taxResults ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("taxSimulator.results", "Resultados del Cálculo de Impuestos")}</CardTitle>
                    <CardDescription>
                      {t("taxSimulator.resultsDesc", "Resumen de tus obligaciones fiscales potenciales")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-card/50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">{t("taxSimulator.summary", "Resumen Fiscal")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{t("taxSimulator.totalGainLoss", "Ganancia/Pérdida Total")}</p>
                            <p className={`text-xl font-semibold ${taxResults.summary.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              ${taxResults.summary.totalGainLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{t("taxSimulator.totalTax", "Impuesto Total Estimado")}</p>
                            <p className="text-xl font-semibold">
                              ${taxResults.summary.totalTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{t("taxSimulator.shortTermGains", "Ganancias a corto plazo")}</p>
                            <p className={`${taxResults.summary.shortTermGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              ${taxResults.summary.shortTermGainLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{t("taxSimulator.longTermGains", "Ganancias a largo plazo")}</p>
                            <p className={`${taxResults.summary.longTermGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              ${taxResults.summary.longTermGainLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{t("taxSimulator.taxableIncome", "Ingresos imponibles (minería, staking, etc.)")}</p>
                            <p>${taxResults.summary.taxableIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{t("taxSimulator.effectiveTaxRate", "Tasa impositiva efectiva")}</p>
                            <p>{(taxResults.summary.effectiveTaxRate * 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">{t("taxSimulator.detailedResults", "Resultados Detallados por Activo")}</h3>
                        <ScrollArea className="h-[300px]">
                          {Object.keys(taxResults.assetResults).map((asset) => {
                            const result = taxResults.assetResults[asset];
                            return (
                              <div key={asset} className="p-4 border rounded-lg mb-3">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">{asset}</h4>
                                  <span className={`text-sm ${result.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    ${result.gainLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">{t("taxSimulator.bought", "Comprado")}</p>
                                    <p>{result.bought.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 8})} {asset}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-muted-foreground">{t("taxSimulator.sold", "Vendido")}</p>
                                    <p>{result.sold.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 8})} {asset}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-muted-foreground">{t("taxSimulator.costBasis", "Base de costo")}</p>
                                    <p>${result.costBasis.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-muted-foreground">{t("taxSimulator.proceeds", "Ingresos")}</p>
                                    <p>${result.proceeds.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </ScrollArea>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-2">
                        <Button 
                          className="flex-1"
                          onClick={exportReport}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {t("taxSimulator.export", "Exportar Informe")}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setActiveTab("transactions");
                          }}
                        >
                          <FilePieChart className="mr-2 h-4 w-4" />
                          {t("taxSimulator.adjustTransactions", "Ajustar Transacciones")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">
                    <div className="flex flex-col gap-1 w-full">
                      <p>{t("taxSimulator.disclaimer", "Descargo de responsabilidad:")}</p>
                      <p>{t("taxSimulator.disclaimerText", "Esta herramienta solo proporciona cálculos aproximados. Para una evaluación fiscal precisa, siempre consulta con un profesional de impuestos calificado.")}</p>
                    </div>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t("taxSimulator.taxTips", "Consejos Fiscales para Criptomonedas")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>{t("taxSimulator.tip1", "Mantén registros detallados de todas tus transacciones, incluyendo fechas, cantidades y precios.")}</li>
                      <li>{t("taxSimulator.tip2", "Considera mantener activos por más de un año para potencialmente calificar para tasas de ganancias de capital a largo plazo.")}</li>
                      <li>{t("taxSimulator.tip3", "Las pérdidas de criptomonedas pueden ser utilizadas para compensar ganancias de capital en muchas jurisdicciones.")}</li>
                      <li>{t("taxSimulator.tip4", "Los ingresos por minería, staking y airdrops suelen considerarse como ingresos ordinarios en el momento de la recepción.")}</li>
                      <li>{t("taxSimulator.tip5", "Algunas jurisdicciones consideran el intercambio entre criptomonedas como eventos imponibles.")}</li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">{t("taxSimulator.noResults", "No hay resultados disponibles")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("taxSimulator.addTransactionsFirst", "Añade transacciones y configura tus preferencias fiscales para ver los resultados.")}
                    </p>
                    <Button 
                      onClick={() => setActiveTab("transactions")}
                    >
                      {t("taxSimulator.goToTransactions", "Ir a Transacciones")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TaxSimulator;