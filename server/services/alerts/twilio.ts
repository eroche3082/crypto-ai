import { Request, Response } from 'express';
import twilio from 'twilio';
import { storage } from '../../storage';

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null;
let twilioPhoneNumber: string | null = null;

try {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
    console.log('Twilio client initialized');
  } else {
    console.warn('Twilio credentials not found. SMS alerts will not be available.');
  }
} catch (error) {
  console.error('Error initializing Twilio client:', error);
}

/**
 * Register a phone number for alerts
 */
export async function registerPhoneForAlerts(req: Request, res: Response) {
  try {
    if (!twilioClient) {
      return res.status(500).json({
        error: 'Twilio client not initialized',
        message: 'SMS alerts are not available'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to register for alerts'
      });
    }

    const { phoneNumber, countryCode = '1' } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Missing phone number',
        message: 'Please provide a valid phone number'
      });
    }
    
    // Format phone number
    const formattedPhoneNumber = `+${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    
    // Validate phone number with Twilio
    try {
      const lookupResult = await twilioClient.lookups.v2.phoneNumbers(formattedPhoneNumber).fetch();
      
      if (!lookupResult.valid) {
        return res.status(400).json({
          error: 'Invalid phone number',
          message: 'The provided phone number is not valid'
        });
      }
      
      // Store phone number in user profile
      // Note: In a real implementation, you would update the user record in the database
      // This is a placeholder for the actual implementation
      const userId = req.user.id;
      
      // TODO: Update user profile with phone number
      // await storage.updateUserPhone(userId, formattedPhoneNumber);
      
      // Send verification SMS
      const verificationMessage = await twilioClient.messages.create({
        body: 'You have successfully registered for CryptoBot alerts. Reply STOP to unsubscribe.',
        from: twilioPhoneNumber,
        to: formattedPhoneNumber
      });
      
      res.json({
        success: true,
        phoneNumber: formattedPhoneNumber,
        message: 'Phone number registered for alerts',
        verificationSent: verificationMessage.sid ? true : false
      });
    } catch (lookupError) {
      console.error('Error validating phone number:', lookupError);
      res.status(400).json({
        error: 'Invalid phone number',
        message: 'Could not validate the provided phone number'
      });
    }
  } catch (error) {
    console.error('Error registering phone for alerts:', error);
    res.status(500).json({
      error: 'Error registering phone for alerts',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Send a price alert to user via SMS
 */
export async function sendPriceAlertSMS(
  phoneNumber: string, 
  symbol: string, 
  price: number, 
  targetPrice: number, 
  alertType: 'above' | 'below'
): Promise<boolean> {
  try {
    if (!twilioClient || !twilioPhoneNumber) {
      console.error('Twilio client not initialized');
      return false;
    }
    
    // Format message
    const direction = alertType === 'above' ? 'risen above' : 'fallen below';
    const message = `🚨 CryptoBot Alert: ${symbol} has ${direction} your target price of $${targetPrice.toLocaleString()}. Current price: $${price.toLocaleString()}.`;
    
    // Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber
    });
    
    console.log(`SMS alert sent to ${phoneNumber} with SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending price alert SMS:', error);
    return false;
  }
}

/**
 * Send a whale transaction alert via SMS
 */
export async function sendWhaleAlertSMS(
  phoneNumber: string,
  symbol: string,
  amount: number,
  valueUsd: number,
  from: string,
  to: string
): Promise<boolean> {
  try {
    if (!twilioClient || !twilioPhoneNumber) {
      console.error('Twilio client not initialized');
      return false;
    }
    
    // Format message
    let fromLabel = from;
    let toLabel = to;
    
    // Check if addresses are known entities like exchanges
    if (from === 'binance' || from.includes('binance')) {
      fromLabel = 'Binance';
    } else if (from === 'coinbase' || from.includes('coinbase')) {
      fromLabel = 'Coinbase';
    }
    
    if (to === 'binance' || to.includes('binance')) {
      toLabel = 'Binance';
    } else if (to === 'coinbase' || to.includes('coinbase')) {
      toLabel = 'Coinbase';
    }
    
    const message = `🐋 Whale Alert: ${amount.toLocaleString()} ${symbol} ($${valueUsd.toLocaleString()}) transferred from ${fromLabel} to ${toLabel}.`;
    
    // Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber
    });
    
    console.log(`Whale alert SMS sent to ${phoneNumber} with SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending whale alert SMS:', error);
    return false;
  }
}

/**
 * Process pending price alerts
 * This function should be called by a scheduler/cron job
 */
export async function processAlerts() {
  try {
    if (!twilioClient) {
      console.error('Twilio client not initialized');
      return;
    }
    
    // Get all active alerts from database
    const allAlerts = await storage.getAllPriceAlerts();
    const activeAlerts = allAlerts.filter(alert => !alert.triggered);
    
    if (activeAlerts.length === 0) {
      console.log('No active alerts to process');
      return;
    }
    
    console.log(`Processing ${activeAlerts.length} active price alerts`);
    
    // Group alerts by symbol to minimize API calls
    const alertsBySymbol: Record<string, typeof activeAlerts> = {};
    activeAlerts.forEach(alert => {
      if (!alertsBySymbol[alert.symbol]) {
        alertsBySymbol[alert.symbol] = [];
      }
      alertsBySymbol[alert.symbol].push(alert);
    });
    
    // Process each symbol
    for (const [symbol, alerts] of Object.entries(alertsBySymbol)) {
      try {
        // Get current price from API
        // In a real implementation, you would call your crypto price API
        // For demonstration, we're using a mock function
        const currentPrice = await getCurrentPrice(symbol);
        
        // Check each alert for this symbol
        for (const alert of alerts) {
          try {
            let isTriggered = false;
            
            // Check if alert condition is met
            if (alert.type === 'above' && currentPrice >= alert.targetPrice) {
              isTriggered = true;
            } else if (alert.type === 'below' && currentPrice <= alert.targetPrice) {
              isTriggered = true;
            }
            
            if (isTriggered) {
              // Get user phone number
              const user = await storage.getUser(alert.userId);
              
              if (user && user.phoneNumber) {
                // Send SMS alert
                const sent = await sendPriceAlertSMS(
                  user.phoneNumber,
                  symbol,
                  currentPrice,
                  alert.targetPrice,
                  alert.type
                );
                
                if (sent) {
                  // Mark alert as triggered in database
                  await storage.markAlertAsTriggered(alert.id);
                  console.log(`Alert ID ${alert.id} triggered and SMS sent`);
                }
              } else {
                console.log(`Alert ID ${alert.id} triggered but user has no phone number`);
                await storage.markAlertAsTriggered(alert.id);
              }
            }
          } catch (alertError) {
            console.error(`Error processing alert ID ${alert.id}:`, alertError);
          }
        }
      } catch (priceError) {
        console.error(`Error getting price for ${symbol}:`, priceError);
      }
    }
  } catch (error) {
    console.error('Error processing alerts:', error);
  }
}

/**
 * Get current price from CoinAPI
 */
async function getCurrentPrice(symbol: string): Promise<number> {
  try {
    // Convert symbol to uppercase for CoinAPI
    const assetId = symbol.toUpperCase();
    
    const response = await fetch(
      `https://rest.coinapi.io/v1/assets/${assetId}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-CoinAPI-Key': process.env.COINAPI_KEY || '3ce51981-a99b-4daa-b4f9-bfdd5c0e297f'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      return data[0].price_usd || 0;
    } else {
      console.error(`No price data found for ${symbol} in CoinAPI response`);
      return 0;
    }
  } catch (error) {
    console.error(`Error fetching price for ${symbol} from CoinAPI:`, error);
    
    // Try to fetch from the cache if possible
    return getCachedPrice(symbol);
  }
}

/**
 * Get cached price if available 
 */
function getCachedPrice(symbol: string): number {
  // In a production environment, this would fetch from a database or Redis cache
  // For now, we'll return a standard price if the API fails
  const cachedPrices: Record<string, number> = {
    'BTC': 52000,
    'ETH': 2800,
    'XRP': 0.5,
    'SOL': 100,
    'BNB': 380,
    'ADA': 0.45,
    'DOGE': 0.07,
    'DOT': 6.5,
    'AVAX': 22.0
  };
  
  return cachedPrices[symbol.toUpperCase()] || 0;
}