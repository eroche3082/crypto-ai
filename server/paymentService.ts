/**
 * Multi-Payment Gateway Service
 * 
 * Handles multiple payment methods beyond Stripe, including PayPal, Crypto,
 * and bank transfers for the Universal Access Code System.
 */

import { Request, Response } from 'express';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { userOnboardingProfiles } from '@shared/schema';

// Define different payment method options and their features
export const PAYMENT_METHODS = {
  'STRIPE': {
    name: 'Credit/Debit Card',
    provider: 'Stripe',
    icon: 'credit-card',
    description: 'Pay securely with credit or debit card',
    currencies: ['USD', 'EUR', 'GBP'],
    processingFee: '2.9% + $0.30',
    availability: 'global',
    enabled: true
  },
  'PAYPAL': {
    name: 'PayPal',
    provider: 'PayPal',
    icon: 'paypal',
    description: 'Pay with your PayPal account or guest checkout',
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    processingFee: '3.49% + $0.49',
    availability: 'global',
    enabled: true
  },
  'CRYPTO': {
    name: 'Cryptocurrency',
    provider: 'CoinGate',
    icon: 'bitcoin',
    description: 'Pay with Bitcoin, Ethereum, or other cryptocurrencies',
    currencies: ['BTC', 'ETH', 'USDT', 'USDC', 'XRP', 'LTC'],
    processingFee: '1.0%',
    availability: 'global',
    processingTime: '10-60 minutes',
    enabled: true
  },
  'BANK_TRANSFER': {
    name: 'Bank Transfer',
    provider: 'Manual',
    icon: 'bank',
    description: 'Pay via direct bank transfer',
    currencies: ['USD', 'EUR', 'GBP'],
    processingFee: 'None',
    processingTime: '1-3 business days',
    availability: 'global',
    instructions: true,
    enabled: true
  },
  'APPLE_PAY': {
    name: 'Apple Pay',
    provider: 'Stripe',
    icon: 'apple',
    description: 'Quick checkout with Apple Pay',
    currencies: ['USD', 'EUR', 'GBP'],
    processingFee: '2.9%',
    availability: 'iOS and macOS devices only',
    enabled: process.env.ENABLE_APPLE_PAY === 'true'
  },
  'GOOGLE_PAY': {
    name: 'Google Pay',
    provider: 'Stripe',
    icon: 'google',
    description: 'Quick checkout with Google Pay',
    currencies: ['USD', 'EUR', 'GBP'],
    processingFee: '2.9%',
    availability: 'Android and Chrome',
    enabled: process.env.ENABLE_GOOGLE_PAY === 'true'
  }
};

/**
 * Get available payment methods for the dashboard
 */
export async function getPaymentMethods(req: Request, res: Response) {
  try {
    // Filter to only enabled payment methods
    const availablePaymentMethods = Object.entries(PAYMENT_METHODS)
      .filter(([_, method]) => method.enabled)
      .map(([id, method]) => ({
        id,
        name: method.name,
        provider: method.provider,
        icon: method.icon,
        description: method.description,
        currencies: method.currencies,
        processingFee: method.processingFee,
        processingTime: method.processingTime || 'immediate',
        availability: method.availability,
        instructions: method.instructions || false
      }));

    res.json({
      success: true,
      paymentMethods: availablePaymentMethods
    });
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({
      error: 'Failed to get payment methods',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Initialize a PayPal payment
 */
export async function initPayPalPayment(req: Request, res: Response) {
  try {
    const { accessCode, levelId, currency = 'USD' } = req.body;

    if (!accessCode || !levelId) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Access code and levelId are required'
      });
    }

    // Find the user profile
    const [profile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, accessCode));

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        details: 'No profile found with the provided access code'
      });
    }

    // Mock PayPal payment for this demo
    // In a real implementation, we would use the PayPal SDK to create a payment
    const paymentUrl = `${req.protocol}://${req.get('host')}/dashboard/paypal-payment?code=${accessCode}&level=${levelId}&currency=${currency}`;
    const paymentId = `PAYPAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    res.json({
      success: true,
      paymentMethod: 'PAYPAL',
      paymentUrl,
      paymentId,
      returnUrl: `${req.protocol}://${req.get('host')}/dashboard?code=${accessCode}&payment_success=true`
    });
  } catch (error) {
    console.error('Error initializing PayPal payment:', error);
    res.status(500).json({
      error: 'Failed to initialize PayPal payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Initialize a crypto payment
 */
export async function initCryptoPayment(req: Request, res: Response) {
  try {
    const { accessCode, levelId, currency = 'BTC' } = req.body;

    if (!accessCode || !levelId) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Access code and levelId are required'
      });
    }

    // Find the user profile
    const [profile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, accessCode));

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        details: 'No profile found with the provided access code'
      });
    }

    // Mock crypto payment data for this demo
    // In a real implementation, we would use a crypto payment provider API
    const paymentAddress = getTestCryptoAddress(currency);
    const paymentAmount = getTestCryptoAmount(currency, levelId);
    const paymentId = `CRYPTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    res.json({
      success: true,
      paymentMethod: 'CRYPTO',
      currency,
      paymentAddress,
      paymentAmount,
      paymentId,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?data=${paymentAddress}&size=200x200`,
      expiresIn: 3600, // 1 hour
      callbackUrl: `${req.protocol}://${req.get('host')}/api/payment/crypto-callback`
    });
  } catch (error) {
    console.error('Error initializing crypto payment:', error);
    res.status(500).json({
      error: 'Failed to initialize crypto payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get bank transfer instructions
 */
export async function getBankTransferInstructions(req: Request, res: Response) {
  try {
    const { accessCode, levelId, currency = 'USD' } = req.body;

    if (!accessCode || !levelId) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Access code and levelId are required'
      });
    }

    // Find the user profile
    const [profile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, accessCode));

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        details: 'No profile found with the provided access code'
      });
    }

    // Generate a unique reference code
    const referenceCode = `CBA-${accessCode.slice(-6)}-${Date.now().toString().slice(-6)}`;
    
    // Get banking details based on currency
    const bankDetails = getBankDetailsForCurrency(currency);
    
    res.json({
      success: true,
      paymentMethod: 'BANK_TRANSFER',
      currency,
      referenceCode,
      accountName: bankDetails.accountName,
      accountNumber: bankDetails.accountNumber,
      routingNumber: bankDetails.routingNumber,
      swiftCode: bankDetails.swiftCode,
      bankName: bankDetails.bankName,
      bankAddress: bankDetails.bankAddress,
      instructions: [
        `Please transfer the exact amount including the reference code.`,
        `Your payment will be processed within 1-3 business days.`,
        `Please email a copy of your transfer receipt to support@cryptobot.ai with your access code.`
      ]
    });
  } catch (error) {
    console.error('Error getting bank transfer instructions:', error);
    res.status(500).json({
      error: 'Failed to get bank transfer instructions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Mock verify crypto payment (for demo purposes)
 */
export async function verifyCryptoPayment(req: Request, res: Response) {
  try {
    const { paymentId, accessCode, levelId } = req.body;

    if (!paymentId || !accessCode || !levelId) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Payment ID, access code and level ID are required'
      });
    }

    // In a real implementation, we would verify the payment with the crypto payment provider
    // For this demo, we'll simulate a successful payment

    // Mock verification for demo purposes
    const isVerified = true;
    const transactionHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    if (isVerified) {
      // Update user profile with the unlocked level
      const [profile] = await db
        .select()
        .from(userOnboardingProfiles)
        .where(eq(userOnboardingProfiles.unique_code, accessCode));

      if (!profile) {
        return res.status(404).json({
          error: 'Profile not found',
          details: 'No profile found with the provided access code'
        });
      }

      // Add the level to user's unlocked levels
      const updatedUnlockedLevels = [...(profile.unlocked_levels || []), levelId];
      
      // Update the profile
      await db.update(userOnboardingProfiles)
        .set({
          unlocked_levels: updatedUnlockedLevels,
          subscription_status: 'paid',
          last_payment_date: new Date(),
          payment_reference: transactionHash,
          payment_method: 'CRYPTO'
        })
        .where(eq(userOnboardingProfiles.id, profile.id));

      res.json({
        success: true,
        verified: true,
        transactionHash,
        message: 'Payment verified successfully'
      });
    } else {
      res.json({
        success: false,
        verified: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Error verifying crypto payment:', error);
    res.status(500).json({
      error: 'Failed to verify payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Helper function to get a test crypto address
 */
function getTestCryptoAddress(currency: string): string {
  // Return test addresses for different cryptocurrencies
  switch (currency.toUpperCase()) {
    case 'BTC':
      return '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5';
    case 'ETH':
      return '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    case 'USDT':
      return 'TEWzJ8XpWP6YKgUzXsEVYCtJVrAnZrxVvz';
    case 'USDC':
      return '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
    case 'XRP':
      return 'rLW9gnQo7BQhU6igk5keqYnH3TVrCxGRzm';
    case 'LTC':
      return 'LQ3U8nQPQfy4K3k6hHe3RLQNgWrkJQ9zau';
    default:
      return '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5';
  }
}

/**
 * Helper function to get a test crypto amount
 */
function getTestCryptoAmount(currency: string, levelId: string): string {
  // Get base price in USD based on level
  let basePrice = 19.99; // BASIC level
  if (levelId === 'PRO') {
    basePrice = 49.99;
  } else if (levelId === 'PREMIUM') {
    basePrice = 99.99;
  }
  
  // Convert to cryptocurrency (using mock exchange rates)
  switch (currency.toUpperCase()) {
    case 'BTC':
      return (basePrice / 60000).toFixed(8); // Assuming 1 BTC = $60,000
    case 'ETH':
      return (basePrice / 3000).toFixed(6); // Assuming 1 ETH = $3,000
    case 'USDT':
    case 'USDC':
      return basePrice.toFixed(2); // Stablecoins are 1:1 with USD
    case 'XRP':
      return (basePrice / 0.5).toFixed(2); // Assuming 1 XRP = $0.50
    case 'LTC':
      return (basePrice / 100).toFixed(4); // Assuming 1 LTC = $100
    default:
      return (basePrice / 60000).toFixed(8);
  }
}

/**
 * Helper function to get mock bank details for a currency
 */
function getBankDetailsForCurrency(currency: string): {
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  bankName: string;
  bankAddress: string;
} {
  // Return bank details for different currencies
  switch (currency.toUpperCase()) {
    case 'USD':
      return {
        accountName: 'CryptoBot Inc.',
        accountNumber: '1234567890',
        routingNumber: '123456789',
        swiftCode: 'CHASUS33',
        bankName: 'Chase Bank',
        bankAddress: '270 Park Avenue, New York, NY 10017, USA'
      };
    case 'EUR':
      return {
        accountName: 'CryptoBot Europe GmbH',
        accountNumber: 'DE89370400440532013000',
        routingNumber: 'N/A',
        swiftCode: 'DEUTDEFF',
        bankName: 'Deutsche Bank',
        bankAddress: 'Taunusanlage 12, 60325 Frankfurt am Main, Germany'
      };
    case 'GBP':
      return {
        accountName: 'CryptoBot UK Ltd.',
        accountNumber: '12345678',
        routingNumber: '123456',
        swiftCode: 'BARCGB22',
        bankName: 'Barclays Bank',
        bankAddress: '1 Churchill Place, London E14 5HP, United Kingdom'
      };
    default:
      return {
        accountName: 'CryptoBot Inc.',
        accountNumber: '1234567890',
        routingNumber: '123456789',
        swiftCode: 'CHASUS33',
        bankName: 'Chase Bank',
        bankAddress: '270 Park Avenue, New York, NY 10017, USA'
      };
  }
}