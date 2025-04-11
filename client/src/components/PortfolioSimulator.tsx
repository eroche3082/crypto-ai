import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePortfolio } from "../hooks/usePortfolio";
import { useCryptoData } from "../hooks/useCryptoData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddAssetDialogProps {
  onAdd: (symbol: string, amount: number) => void;
  availableCryptos: Array<{ symbol: string; name: string }>;
}

const AddAssetDialog = ({ onAdd, availableCryptos }: AddAssetDialogProps) => {
  const { t } = useTranslation();
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  
  const handleAdd = () => {
    if (selectedCrypto && amount && Number(amount) > 0) {
      onAdd(selectedCrypto, Number(amount));
      setSelectedCrypto("");
      setAmount("");
      setOpen(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="mb-4">
          <span className="material-icons text-sm mr-1">add</span>
          {t("portfolio.addAsset")}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-secondary text-lightText border-gray-700">
        <DialogHeader>
          <DialogTitle>{t("portfolio.addNewAsset")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label className="text-sm mb-1 block">{t("portfolio.selectCrypto")}</label>
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger>
                <SelectValue placeholder={t("portfolio.selectCrypto")} />
              </SelectTrigger>
              <SelectContent>
                {availableCryptos.map((crypto) => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    {crypto.name} ({crypto.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm mb-1 block">{t("portfolio.amount")}</label>
            <Input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.0001"
              min="0"
            />
          </div>
          <Button onClick={handleAdd}>
            {t("portfolio.add")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PortfolioSimulator = () => {
  const { t } = useTranslation();
  const { portfolio, addAsset, removeAsset, portfolioValue, portfolioROI } = usePortfolio();
  const { data: cryptoData } = useCryptoData({});
  
  const getAssetValue = (symbol: string, amount: number) => {
    const crypto = cryptoData?.find(c => c.symbol === symbol);
    return crypto ? crypto.current_price * amount : 0;
  };
  
  const getPercentChange = (symbol: string) => {
    const crypto = cryptoData?.find(c => c.symbol === symbol);
    return crypto ? crypto.price_change_percentage_24h : 0;
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">{t("portfolio.title")}</h2>
          <p className="text-sm text-gray-400">{t("portfolio.subtitle")}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">${portfolioValue.toLocaleString()}</p>
          <p className={`text-sm ${portfolioROI >= 0 ? 'text-success' : 'text-error'}`}>
            {portfolioROI >= 0 ? '+' : ''}{portfolioROI.toFixed(2)}% ROI
          </p>
        </div>
      </div>
      
      <AddAssetDialog 
        onAdd={addAsset}
        availableCryptos={cryptoData?.map(c => ({ symbol: c.symbol, name: c.name })) || []}
      />
      
      {portfolio.length === 0 ? (
        <div className="bg-secondary rounded-lg p-8 text-center">
          <span className="material-icons text-4xl text-gray-500 mb-2">account_balance_wallet</span>
          <h3 className="text-lg font-medium mb-2">{t("portfolio.empty")}</h3>
          <p className="text-sm text-gray-400 mb-4">{t("portfolio.emptyDesc")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {portfolio.map((asset) => (
            <div key={asset.symbol} className="bg-secondary rounded-lg p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                  <span className="material-icons">toll</span>
                </div>
                <div>
                  <h3 className="font-medium">{asset.symbol}</h3>
                  <p className="text-xs text-gray-400">{asset.amount.toFixed(6)} {asset.symbol}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <p className="font-medium">${getAssetValue(asset.symbol, asset.amount).toLocaleString()}</p>
                <div className={`text-xs ${getPercentChange(asset.symbol) >= 0 ? 'text-success' : 'text-error'} flex items-center`}>
                  <span className="material-icons text-xs mr-1">
                    {getPercentChange(asset.symbol) >= 0 ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                  {getPercentChange(asset.symbol) >= 0 ? '+' : ''}{getPercentChange(asset.symbol).toFixed(2)}%
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAsset(asset.symbol)}
                className="text-gray-400 hover:text-error"
              >
                <span className="material-icons">delete</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioSimulator;
