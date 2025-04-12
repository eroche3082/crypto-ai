import { Request, Response } from 'express';

// Types for tax calculations
interface TaxRate {
  rate: number;
  min: number;
  max: number | null;
}

interface CountryTaxRules {
  shortTermRates: TaxRate[];
  longTermRates: TaxRate[];
  shortTermDuration: number; // in days
  taxablePercentage: number; // percentage of gains that are taxable
  allowLosses: boolean;
  maxLossCarryForward: number | null;
  hasTaxFreeAllowance: boolean;
  taxFreeAllowance: number;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  asset: string;
  quantity: number;
  price: number;
  date: string;
  fees: number;
}

interface TaxCalculationResult {
  totalGain: number;
  taxableGain: number;
  taxAmount: number;
  taxRate: number;
  shortTermGains: number;
  longTermGains: number;
  remainingTaxFreeAllowance: number;
  transactions: {
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
  }[];
}

// Tax rules by country
const taxRulesByCountry: Record<string, CountryTaxRules> = {
  'us': {
    shortTermRates: [
      { rate: 0.1, min: 0, max: 9950 },
      { rate: 0.12, min: 9951, max: 40525 },
      { rate: 0.22, min: 40526, max: 86375 },
      { rate: 0.24, min: 86376, max: 164925 },
      { rate: 0.32, min: 164926, max: 209425 },
      { rate: 0.35, min: 209426, max: 523600 },
      { rate: 0.37, min: 523601, max: null }
    ],
    longTermRates: [
      { rate: 0, min: 0, max: 40400 },
      { rate: 0.15, min: 40401, max: 445850 },
      { rate: 0.2, min: 445851, max: null }
    ],
    shortTermDuration: 365,
    taxablePercentage: 100,
    allowLosses: true,
    maxLossCarryForward: null,
    hasTaxFreeAllowance: false,
    taxFreeAllowance: 0
  },
  'uk': {
    shortTermRates: [
      { rate: 0, min: 0, max: 12300 },
      { rate: 0.1, min: 12301, max: 50270 },
      { rate: 0.2, min: 50271, max: 150000 },
      { rate: 0.4, min: 150001, max: null }
    ],
    longTermRates: [
      { rate: 0, min: 0, max: 12300 },
      { rate: 0.1, min: 12301, max: 50270 },
      { rate: 0.2, min: 50271, max: null }
    ],
    shortTermDuration: 365,
    taxablePercentage: 100,
    allowLosses: true,
    maxLossCarryForward: null,
    hasTaxFreeAllowance: true,
    taxFreeAllowance: 12300
  },
  'germany': {
    shortTermRates: [
      { rate: 0, min: 0, max: 600 },
      { rate: 0.25, min: 601, max: null }
    ],
    longTermRates: [
      { rate: 0, min: 0, max: null }
    ],
    shortTermDuration: 365,
    taxablePercentage: 100,
    allowLosses: true,
    maxLossCarryForward: null,
    hasTaxFreeAllowance: true,
    taxFreeAllowance: 600
  },
  'australia': {
    shortTermRates: [
      { rate: 0, min: 0, max: 18200 },
      { rate: 0.19, min: 18201, max: 45000 },
      { rate: 0.325, min: 45001, max: 120000 },
      { rate: 0.37, min: 120001, max: 180000 },
      { rate: 0.45, min: 180001, max: null }
    ],
    longTermRates: [
      { rate: 0, min: 0, max: 18200 },
      { rate: 0.095, min: 18201, max: 45000 },
      { rate: 0.1625, min: 45001, max: 120000 },
      { rate: 0.185, min: 120001, max: 180000 },
      { rate: 0.225, min: 180001, max: null }
    ],
    shortTermDuration: 365,
    taxablePercentage: 50,
    allowLosses: true,
    maxLossCarryForward: null,
    hasTaxFreeAllowance: false,
    taxFreeAllowance: 0
  },
  'japan': {
    shortTermRates: [
      { rate: 0.2021, min: 0, max: null }
    ],
    longTermRates: [
      { rate: 0.2021, min: 0, max: null }
    ],
    shortTermDuration: 365,
    taxablePercentage: 100,
    allowLosses: true,
    maxLossCarryForward: 3,
    hasTaxFreeAllowance: false,
    taxFreeAllowance: 0
  },
  'singapore': {
    shortTermRates: [
      { rate: 0, min: 0, max: null }
    ],
    longTermRates: [
      { rate: 0, min: 0, max: null }
    ],
    shortTermDuration: 0,
    taxablePercentage: 0,
    allowLosses: false,
    maxLossCarryForward: 0,
    hasTaxFreeAllowance: false,
    taxFreeAllowance: 0
  },
  'canada': {
    shortTermRates: [
      { rate: 0.15, min: 0, max: 49020 },
      { rate: 0.205, min: 49021, max: 98040 },
      { rate: 0.26, min: 98041, max: 151978 },
      { rate: 0.29, min: 151979, max: 216511 },
      { rate: 0.33, min: 216512, max: null }
    ],
    longTermRates: [
      { rate: 0.075, min: 0, max: 49020 },
      { rate: 0.1025, min: 49021, max: 98040 },
      { rate: 0.13, min: 98041, max: 151978 },
      { rate: 0.145, min: 151979, max: 216511 },
      { rate: 0.165, min: 216512, max: null }
    ],
    shortTermDuration: 365,
    taxablePercentage: 50,
    allowLosses: true,
    maxLossCarryForward: null,
    hasTaxFreeAllowance: false,
    taxFreeAllowance: 0
  }
};

/**
 * Calculate crypto taxes based on transaction history
 */
export async function calculateTaxes(req: Request, res: Response) {
  try {
    const { transactions, country = 'us', income = 50000, year = 2024 } = req.body;
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Transaction history is required' 
      });
    }

    // Get tax rules for the specified country
    const taxRules = taxRulesByCountry[country.toLowerCase()];
    if (!taxRules) {
      return res.status(400).json({
        status: 'error',
        message: `Tax rules for ${country} are not available`
      });
    }

    // Process transactions
    const result = processTaxCalculation(transactions, taxRules, income, year);

    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Tax calculation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to calculate taxes',
      error: error.message
    });
  }
}

/**
 * Get tax information for a specific country
 */
export async function getTaxInfo(req: Request, res: Response) {
  try {
    const { country = 'us' } = req.params;
    
    // Get tax rules for the specified country
    const taxRules = taxRulesByCountry[country.toLowerCase()];
    if (!taxRules) {
      return res.status(400).json({
        status: 'error',
        message: `Tax information for ${country} is not available`
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        country,
        rules: taxRules,
        summary: getTaxSummary(country, taxRules)
      }
    });
  } catch (error) {
    console.error('Tax info error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get tax information',
      error: error.message
    });
  }
}

/**
 * Get available countries for tax calculation
 */
export async function getAvailableCountries(req: Request, res: Response) {
  try {
    const countries = Object.keys(taxRulesByCountry).map(code => ({
      code,
      name: getCountryName(code)
    }));

    return res.status(200).json({
      status: 'success',
      data: countries
    });
  } catch (error) {
    console.error('Available countries error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get available countries',
      error: error.message
    });
  }
}

// Helper function to process tax calculation
function processTaxCalculation(
  transactions: Transaction[],
  taxRules: CountryTaxRules,
  income: number,
  year: number
): TaxCalculationResult {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Filter transactions by the tax year
  const yearStart = new Date(`${year}-01-01T00:00:00Z`);
  const yearEnd = new Date(`${year}-12-31T23:59:59Z`);
  
  const yearTransactions = sortedTransactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= yearStart && txDate <= yearEnd;
  });

  // Split into buys and sells
  const buys = yearTransactions.filter(tx => tx.type === 'buy');
  const sells = yearTransactions.filter(tx => tx.type === 'sell');

  // Calculate cost basis using FIFO (First In, First Out)
  const processedSells = [];
  let totalGain = 0;
  let shortTermGains = 0;
  let longTermGains = 0;
  let remainingAllowance = taxRules.taxFreeAllowance;

  for (const sell of sells) {
    let remainingSellQuantity = sell.quantity;
    let totalProceedsForSell = sell.quantity * sell.price - sell.fees;
    let totalCostBasisForSell = 0;
    
    // Find matching buys to calculate cost basis
    for (const buy of buys) {
      if (buy.asset !== sell.asset || buy.quantity <= 0 || remainingSellQuantity <= 0) {
        continue;
      }

      const sellDate = new Date(sell.date);
      const buyDate = new Date(buy.date);
      const holdingPeriodDays = Math.floor((sellDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));
      const isLongTerm = holdingPeriodDays > taxRules.shortTermDuration;
      
      // Calculate the quantity to use from this buy
      const useQuantity = Math.min(remainingSellQuantity, buy.quantity);
      
      // Calculate cost basis proportion from this buy
      const costBasisProportion = (useQuantity / buy.quantity) * (buy.price * buy.quantity + buy.fees);
      totalCostBasisForSell += costBasisProportion;
      
      // Calculate gain for this portion
      const proceedsForPortion = (useQuantity / sell.quantity) * totalProceedsForSell;
      const gainForPortion = proceedsForPortion - costBasisProportion;
      
      // Update the remaining quantities
      remainingSellQuantity -= useQuantity;
      buy.quantity -= useQuantity;
      
      // Calculate tax amount based on gain and rates
      const taxableGain = gainForPortion * (taxRules.taxablePercentage / 100);
      
      // Apply tax free allowance if applicable
      let adjustedTaxableGain = taxableGain;
      if (taxRules.hasTaxFreeAllowance && remainingAllowance > 0) {
        if (taxableGain <= remainingAllowance) {
          remainingAllowance -= taxableGain;
          adjustedTaxableGain = 0;
        } else {
          adjustedTaxableGain = taxableGain - remainingAllowance;
          remainingAllowance = 0;
        }
      }
      
      // Get applicable tax rate
      const rates = isLongTerm ? taxRules.longTermRates : taxRules.shortTermRates;
      const taxRate = getTaxRateForAmount(adjustedTaxableGain, rates);
      
      // Calculate tax amount
      const taxAmount = adjustedTaxableGain * taxRate;
      
      // Update gains
      totalGain += gainForPortion;
      if (isLongTerm) {
        longTermGains += gainForPortion;
      } else {
        shortTermGains += gainForPortion;
      }
      
      // Track this transaction for detailed reporting
      processedSells.push({
        id: sell.id,
        asset: sell.asset,
        acquiredDate: buyDate.toISOString(),
        disposalDate: sellDate.toISOString(),
        holdingPeriod: holdingPeriodDays,
        isLongTerm,
        proceeds: proceedsForPortion,
        costBasis: costBasisProportion,
        gain: gainForPortion,
        taxableGain,
        taxAmount,
        taxRate
      });
      
      // If we've processed all the sell quantity, break
      if (remainingSellQuantity <= 0) {
        break;
      }
    }
  }
  
  // Calculate overall taxable gain (after applying taxable percentage)
  const taxableGain = totalGain * (taxRules.taxablePercentage / 100);
  
  // Apply tax free allowance to the total if applicable
  let adjustedTaxableGain = taxableGain;
  if (taxRules.hasTaxFreeAllowance) {
    adjustedTaxableGain = Math.max(0, taxableGain - taxRules.taxFreeAllowance);
  }
  
  // Calculate effective tax rate based on income
  let effectiveTaxRate = 0;
  
  // For simplicity, use short term rates for overall calculation
  if (adjustedTaxableGain > 0) {
    effectiveTaxRate = getTaxRateForAmount(income + adjustedTaxableGain, taxRules.shortTermRates);
  }
  
  // Calculate total tax amount
  const taxAmount = adjustedTaxableGain * effectiveTaxRate;
  
  return {
    totalGain,
    taxableGain: adjustedTaxableGain,
    taxAmount,
    taxRate: effectiveTaxRate,
    shortTermGains,
    longTermGains,
    remainingTaxFreeAllowance: remainingAllowance,
    transactions: processedSells
  };
}

// Helper function to get tax rate for a given amount
function getTaxRateForAmount(amount: number, rates: TaxRate[]): number {
  for (const { rate, min, max } of rates) {
    if (amount >= min && (max === null || amount <= max)) {
      return rate;
    }
  }
  return 0;
}

// Helper function to get country name from code
function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    'us': 'United States',
    'uk': 'United Kingdom',
    'germany': 'Germany',
    'australia': 'Australia',
    'japan': 'Japan',
    'singapore': 'Singapore',
    'canada': 'Canada'
  };
  
  return countryNames[countryCode] || countryCode.toUpperCase();
}

// Helper function to get a summary of tax rules for a country
function getTaxSummary(countryCode: string, rules: CountryTaxRules): string {
  const countryName = getCountryName(countryCode);
  
  if (countryCode === 'singapore') {
    return `${countryName} does not tax capital gains from cryptocurrency trading.`;
  }
  
  let summary = `${countryName} taxes cryptocurrency as capital gains. `;
  
  if (rules.taxablePercentage < 100) {
    summary += `Only ${rules.taxablePercentage}% of gains are taxable. `;
  }
  
  if (rules.hasTaxFreeAllowance) {
    summary += `There is a tax-free allowance of ${rules.taxFreeAllowance} per year. `;
  }
  
  if (rules.shortTermDuration > 0) {
    summary += `Gains on assets held for more than ${rules.shortTermDuration} days qualify for long-term capital gains rates. `;
  }
  
  if (rules.allowLosses) {
    summary += `Losses can be used to offset gains. `;
    if (rules.maxLossCarryForward) {
      summary += `Unused losses can be carried forward for up to ${rules.maxLossCarryForward} years.`;
    } else {
      summary += `Unused losses can be carried forward indefinitely.`;
    }
  }
  
  return summary;
}