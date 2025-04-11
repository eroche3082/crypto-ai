import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCryptoData } from "../hooks/useCryptoData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CryptoConverter = () => {
  const { t } = useTranslation();
  const { data: cryptoData } = useCryptoData({});
  const [fromCrypto, setFromCrypto] = useState("BTC");
  const [toCrypto, setToCrypto] = useState("USDT");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState("0");
  const [conversionHistory, setConversionHistory] = useState<Array<{
    id: string;
    fromCrypto: string;
    toCrypto: string;
    fromAmount: string;
    toAmount: string;
    timestamp: Date;
  }>>([]);
  const [activeTab, setActiveTab] = useState("converter");
  const [showFiatOptions, setShowFiatOptions] = useState(false);
  
  useEffect(() => {
    if (!cryptoData) return;
    
    const fromCryptoData = cryptoData.find(c => c.symbol === fromCrypto);
    const toCryptoData = cryptoData.find(c => c.symbol === toCrypto);
    
    if (fromCryptoData && toCryptoData && amount) {
      const fromValueInUSD = fromCryptoData.current_price * parseFloat(amount);
      const toAmount = fromValueInUSD / toCryptoData.current_price;
      setResult(toAmount.toFixed(8));
    }
  }, [fromCrypto, toCrypto, amount, cryptoData]);
  
  const handleSwap = () => {
    setFromCrypto(toCrypto);
    setToCrypto(fromCrypto);
  };
  
  const saveConversion = () => {
    if (!cryptoData) return;
    
    const newConversion = {
      id: Date.now().toString(),
      fromCrypto,
      toCrypto,
      fromAmount: amount,
      toAmount: result,
      timestamp: new Date()
    };
    
    setConversionHistory(prev => [newConversion, ...prev].slice(0, 10));
  };
  
  const popularPairs = [
    { from: "BTC", to: "USDT" },
    { from: "ETH", to: "BTC" },
    { from: "XRP", to: "USDT" },
    { from: "LTC", to: "BTC" },
  ];
  
  // Fiat currencies with approximate exchange rates
  const fiatCurrencies = [
    { code: "USD", name: "US Dollar", rate: 1 },
    { code: "EUR", name: "Euro", rate: 0.91 },
    { code: "GBP", name: "British Pound", rate: 0.77 },
    { code: "JPY", name: "Japanese Yen", rate: 149.26 },
    { code: "CNY", name: "Chinese Yuan", rate: 7.23 },
  ];
  
  const convertToFiat = (cryptoAmount: number, cryptoSymbol: string, fiatCode: string) => {
    if (!cryptoData) return "...";
    
    const crypto = cryptoData.find(c => c.symbol === cryptoSymbol);
    if (!crypto) return "...";
    
    const fiat = fiatCurrencies.find(f => f.code === fiatCode);
    if (!fiat) return "...";
    
    const valueInUSD = crypto.current_price * cryptoAmount;
    return (valueInUSD * fiat.rate).toFixed(2);
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t("converter.title", "Cryptocurrency Converter")}</h2>
          <p className="text-sm text-gray-400">{t("converter.subtitle", "Easily convert between cryptocurrencies and fiat currencies")}</p>
        </div>
      </div>
      
      <Tabs defaultValue="converter" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="converter">{t("converter.cryptoConverter", "Crypto Converter")}</TabsTrigger>
          <TabsTrigger value="fiat">{t("converter.fiatConverter", "Fiat Converter")}</TabsTrigger>
          <TabsTrigger value="history">{t("converter.history", "History")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="converter" className="mt-0">
          <Card className="bg-secondary/50 border-gray-800">
            <CardContent className="pt-6">
              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-2">{t("converter.from", "From")}</label>
                <div className="flex space-x-4">
                  <Select value={fromCrypto} onValueChange={setFromCrypto}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoData?.map((crypto) => (
                        <SelectItem key={`from-${crypto.symbol}`} value={crypto.symbol}>
                          <div className="flex items-center">
                            <span className="font-medium">{crypto.symbol.toUpperCase()}</span>
                            <span className="ml-2 text-xs text-gray-400">{crypto.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                    min="0"
                    step="0.0001"
                  />
                </div>
              </div>
              
              <div className="flex justify-center my-6">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  onClick={handleSwap}
                  className="rounded-full"
                >
                  <span className="material-icons">swap_vert</span>
                </Button>
              </div>
              
              <div className="mb-6">
                <label className="text-sm text-gray-400 block mb-2">{t("converter.to", "To")}</label>
                <div className="flex space-x-4">
                  <Select value={toCrypto} onValueChange={setToCrypto}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoData?.map((crypto) => (
                        <SelectItem key={`to-${crypto.symbol}`} value={crypto.symbol}>
                          <div className="flex items-center">
                            <span className="font-medium">{crypto.symbol.toUpperCase()}</span>
                            <span className="ml-2 text-xs text-gray-400">{crypto.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="text"
                    value={result}
                    readOnly
                    className="flex-1 bg-gray-700"
                  />
                </div>
              </div>
              
              <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">{t("converter.exchangeRate", "Exchange Rate")}</span>
                  <span className="text-sm font-medium">
                    1 {fromCrypto.toUpperCase()} = {
                      (() => {
                        if (!cryptoData) return "...";
                        const from = cryptoData.find(c => c.symbol === fromCrypto);
                        const to = cryptoData.find(c => c.symbol === toCrypto);
                        if (!from || !to) return "...";
                        return (from.current_price / to.current_price).toFixed(8);
                      })()
                    } {toCrypto.toUpperCase()}
                  </span>
                </div>
                
                {cryptoData && (
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">{t("converter.usdValue", "USD Value")}</span>
                    <span className="text-sm font-medium">
                      ${(parseFloat(amount || "0") * (cryptoData.find(c => c.symbol === fromCrypto)?.current_price || 0)).toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">{t("converter.marketCap", "Market Cap")}</span>
                  <span className="text-sm font-medium">
                    ${(cryptoData?.find(c => c.symbol === fromCrypto)?.market_cap || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={saveConversion}>
                  <span className="material-icons mr-2">save</span>
                  {t("converter.saveConversion", "Save Conversion")}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">{t("converter.popularPairs", "Popular Pairs")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularPairs.map((pair, index) => (
                <Card key={index} className="bg-secondary border-gray-800 cursor-pointer hover:border-primary transition-colors" onClick={() => {
                  setFromCrypto(pair.from);
                  setToCrypto(pair.to);
                }}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <span className="font-medium">{pair.from}</span>
                      <span className="mx-2 text-gray-400">/</span>
                      <span>{pair.to}</span>
                    </div>
                    <span className="material-icons text-gray-400">arrow_forward</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="fiat">
          <Card className="bg-secondary/50 border-gray-800">
            <CardHeader>
              <CardTitle>{t("converter.fiatConverter", "Crypto to Fiat Converter")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="text-sm text-gray-400 block mb-2">{t("converter.selectCrypto", "Select Cryptocurrency")}</label>
                <div className="flex space-x-4">
                  <Select value={fromCrypto} onValueChange={setFromCrypto}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoData?.map((crypto) => (
                        <SelectItem key={`fiat-${crypto.symbol}`} value={crypto.symbol}>
                          <div className="flex items-center">
                            <span className="font-medium">{crypto.symbol.toUpperCase()}</span>
                            <span className="ml-2 text-xs text-gray-400">{crypto.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                    min="0"
                    step="0.0001"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {fiatCurrencies.map((fiat) => (
                  <Card key={fiat.code} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-400">{fiat.name}</p>
                          <p className="text-xl font-bold">{fiat.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {fiat.code === "JPY" ? "¥" : fiat.code === "EUR" ? "€" : fiat.code === "GBP" ? "£" : fiat.code === "CNY" ? "¥" : "$"}
                            {convertToFiat(parseFloat(amount || "0"), fromCrypto, fiat.code)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-6 bg-gray-800 p-4 rounded-lg">
                <span className="text-sm text-gray-400">{t("converter.disclaimer", "Disclaimer")}</span>
                <span className="text-sm">
                  {t("converter.ratesApprox", "Fiat rates are approximate and for reference only")}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="bg-secondary/50 border-gray-800">
            <CardHeader>
              <CardTitle>{t("converter.conversionHistory", "Conversion History")}</CardTitle>
            </CardHeader>
            <CardContent>
              {conversionHistory.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400">{t("converter.noHistory", "No conversion history yet")}</p>
                  <p className="text-sm mt-2">
                    {t("converter.makeConversion", "Make a conversion and save it to see it here")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversionHistory.map((item) => (
                    <div key={item.id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">
                          {item.timestamp.toLocaleString()}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setFromCrypto(item.fromCrypto);
                            setToCrypto(item.toCrypto);
                            setAmount(item.fromAmount);
                            setActiveTab("converter");
                          }}
                        >
                          <span className="material-icons text-xs mr-1">refresh</span>
                          {t("converter.reuse", "Reuse")}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.fromAmount} {item.fromCrypto.toUpperCase()}</p>
                        </div>
                        <div className="text-gray-400 mx-4">
                          <span className="material-icons">arrow_forward</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.toAmount} {item.toCrypto.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {conversionHistory.length > 0 && (
                <div className="flex justify-end mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setConversionHistory([])}
                  >
                    <span className="material-icons mr-2">delete</span>
                    {t("converter.clearHistory", "Clear History")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CryptoConverter;
