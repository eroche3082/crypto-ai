import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCryptoData } from "../hooks/useCryptoData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CryptoConverter = () => {
  const { t } = useTranslation();
  const { data: cryptoData } = useCryptoData({});
  const [fromCrypto, setFromCrypto] = useState("BTC");
  const [toCrypto, setToCrypto] = useState("USDT");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState("0");
  
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
  
  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{t("converter.title")}</h2>
        <p className="text-sm text-gray-400">{t("converter.subtitle")}</p>
      </div>
      
      <div className="bg-secondary p-6 rounded-lg">
        <div className="mb-4">
          <label className="text-sm text-gray-400 block mb-2">{t("converter.from")}</label>
          <div className="flex space-x-4">
            <Select value={fromCrypto} onValueChange={setFromCrypto}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cryptoData?.map((crypto) => (
                  <SelectItem key={`from-${crypto.symbol}`} value={crypto.symbol}>
                    {crypto.symbol}
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
        
        <div className="flex justify-center my-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSwap}
            className="rounded-full bg-gray-700"
          >
            <span className="material-icons">swap_vert</span>
          </Button>
        </div>
        
        <div className="mb-4">
          <label className="text-sm text-gray-400 block mb-2">{t("converter.to")}</label>
          <div className="flex space-x-4">
            <Select value={toCrypto} onValueChange={setToCrypto}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cryptoData?.map((crypto) => (
                  <SelectItem key={`to-${crypto.symbol}`} value={crypto.symbol}>
                    {crypto.symbol}
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
        
        <div className="mt-6 bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">{t("converter.exchangeRate")}</span>
            <span className="text-sm">
              1 {fromCrypto} = {
                (() => {
                  if (!cryptoData) return "...";
                  const from = cryptoData.find(c => c.symbol === fromCrypto);
                  const to = cryptoData.find(c => c.symbol === toCrypto);
                  if (!from || !to) return "...";
                  return (from.current_price / to.current_price).toFixed(8);
                })()
              } {toCrypto}
            </span>
          </div>
          
          {cryptoData && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">{t("converter.usdValue")}</span>
              <span className="text-sm">
                ${(parseFloat(amount) * (cryptoData.find(c => c.symbol === fromCrypto)?.current_price || 0)).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoConverter;
