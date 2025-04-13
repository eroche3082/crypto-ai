/**
 * Email Service for CryptoBot
 * 
 * Handles sending emails to users based on their onboarding profile
 * and manages newsletter subscriptions.
 */

import { MailService } from '@sendgrid/mail';
import type { Request, Response } from 'express';
import { UserOnboardingProfile } from '@shared/schema';

// Initialize SendGrid if API key is available
let mailService: MailService | null = null;

// Initialize the mail service with the API key
if (process.env.SENDGRID_API_KEY) {
  try {
    mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid email service initialized successfully');
    console.log('📧 Email functionality is now LIVE - emails will be actually sent');
  } catch (error) {
    console.error('❌ Error initializing SendGrid:', error);
    mailService = null;
    console.log('⚠️ Falling back to email simulation mode');
  }
} else {
  console.log('📝 SendGrid API key not found. Email service will be in simulation mode.');
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Sends a welcome email to a newly onboarded user
 */
export async function sendWelcomeEmail(profile: UserOnboardingProfile): Promise<boolean> {
  try {
    const params: EmailParams = {
      to: profile.email,
      // In a production environment, this would be a verified sender email address
      from: 'welcome@cryptobot.ai',
      subject: `Welcome to CryptoBot, ${profile.name}! Your Access Code is Inside`,
      html: generateWelcomeEmailHtml(profile),
    };

    // If SendGrid is initialized, send the email
    if (mailService) {
      await mailService.send(params);
      console.log(`Welcome email sent to ${profile.email}`);
      return true;
    } else {
      // Log email content for testing without actual delivery
      console.log('Email sending simulated (no API key):');
      console.log(`To: ${params.to}`);
      console.log(`Subject: ${params.subject}`);
      console.log('Email would have been sent if SENDGRID_API_KEY was set');
      return true;
    }
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Request handler for sending access code by email
 */
export async function sendAccessCodeEmail(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, accessCode, category } = req.body;
    
    if (!email || !accessCode) {
      res.status(400).json({ 
        success: false, 
        error: 'Email and accessCode are required' 
      });
      return;
    }

    const params: EmailParams = {
      to: email,
      from: 'access@cryptobot.ai',
      subject: 'Your CryptoBot Access Code',
      html: generateAccessCodeEmailHtml({
        name: name || 'Crypto Enthusiast',
        email,
        unique_code: accessCode,
        user_category: category || 'BEGINNER'
      }),
    };

    // If SendGrid is initialized, send the email
    if (mailService) {
      await mailService.send(params);
      console.log(`Access code email sent to ${email}`);
      res.status(200).json({ success: true, message: 'Access code email sent' });
    } else {
      // Log email content for testing without actual delivery
      console.log('Email sending simulated (no API key):');
      console.log(`To: ${params.to}`);
      console.log(`Subject: ${params.subject}`);
      console.log(`Access code: ${accessCode}`);
      console.log('Email would have been sent if SENDGRID_API_KEY was set');
      
      // In simulation mode, wait 1 second to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.status(200).json({ 
        success: true, 
        message: 'Email simulation mode: Access code would have been sent',
        simulation: true,
        details: {
          to: email,
          code: accessCode,
          category: category || 'BEGINNER',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('SendGrid email error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Request handler for sending newsletter campaign emails
 */
export async function sendNewsletterCampaign(req: Request, res: Response): Promise<void> {
  try {
    const { recipients, subject, content, category } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Recipients array is required and cannot be empty'
      });
      return;
    }

    if (!subject || !content) {
      res.status(400).json({
        success: false,
        error: 'Subject and content are required'
      });
      return;
    }

    // In a real implementation, we would batch these emails
    // and process them using a queue system
    let successCount = 0;
    let failureCount = 0;

    // If SendGrid is initialized, send the emails
    if (mailService) {
      for (const recipient of recipients) {
        try {
          await mailService.send({
            to: recipient.email,
            from: 'newsletter@cryptobot.ai',
            subject,
            html: content.replace('{{name}}', recipient.name || 'Crypto Enthusiast')
                         .replace('{{code}}', recipient.code || 'No Code Available'),
          });
          successCount++;
        } catch (e) {
          failureCount++;
          console.error(`Failed to send to ${recipient.email}:`, e);
        }
      }

      res.status(200).json({
        success: true,
        message: `Newsletter sent to ${successCount} recipients. ${failureCount} failures.`
      });
    } else {
      // Simulate sending without actual delivery
      console.log(`Newsletter campaign simulation: ${subject}`);
      console.log(`Would send to ${recipients.length} recipients`);
      if (category) {
        console.log(`Filtered by category: ${category}`);
      }
      
      // In simulation mode, wait 1 second to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.status(200).json({
        success: true,
        message: `Simulation mode: Newsletter would be sent to ${recipients.length} recipients`,
        simulation: true,
        details: {
          recipientCount: recipients.length,
          category: category || 'all',
          timestamp: new Date().toISOString(),
          subject: subject,
          firstFewRecipients: recipients.slice(0, 3).map(r => ({ 
            email: r.email, 
            name: r.name, 
            code: r.code 
          }))
        }
      });
    }
  } catch (error) {
    console.error('Newsletter campaign error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send newsletter campaign',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to generate HTML for welcome emails
function generateWelcomeEmailHtml(profile: UserOnboardingProfile): string {
  // Category-specific messaging
  const categoryMessage = getCategorySpecificMessage(profile.user_category);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CryptoBot</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f0b90b; padding: 20px; text-align: center; color: #222; }
        .content { padding: 20px; background-color: #fff; }
        .footer { padding: 20px; background-color: #f5f5f5; text-align: center; font-size: 12px; color: #666; }
        .code { font-family: monospace; background-color: #f5f5f5; padding: 10px; font-size: 18px; border-radius: 4px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; background-color: #f0b90b; color: #222; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to CryptoBot!</h1>
        </div>
        <div class="content">
          <h2>Hello ${profile.name},</h2>
          <p>Thank you for completing your onboarding with CryptoBot. We're excited to have you join our community of crypto enthusiasts!</p>
          
          <p><strong>Your personalized access code is:</strong></p>
          <div class="code">${profile.unique_code}</div>
          
          <p>${categoryMessage}</p>
          
          <p>With your access code, you can:</p>
          <ul>
            <li>Access your personalized dashboard</li>
            <li>Track your crypto journey progress</li>
            <li>Unlock features specific to your expertise level</li>
            <li>Share your code with friends to earn rewards</li>
          </ul>
          
          <p>To get started, simply click the button below to access your dashboard:</p>
          <div style="text-align: center;">
            <a href="https://cryptobot.ai/dashboard" class="button">View Your Dashboard</a>
          </div>
          
          <p>If you have any questions or need assistance, our support team is here to help!</p>
          
          <p>Happy trading,<br>The CryptoBot Team</p>
        </div>
        <div class="footer">
          <p>© 2025 CryptoBot. All rights reserved.</p>
          <p>You're receiving this email because you recently signed up for CryptoBot. If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper function to generate HTML for access code emails
function generateAccessCodeEmailHtml(profile: Partial<UserOnboardingProfile>): string {
  // A simpler email just focused on the access code
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your CryptoBot Access Code</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f0b90b; padding: 20px; text-align: center; color: #222; }
        .content { padding: 20px; background-color: #fff; }
        .footer { padding: 20px; background-color: #f5f5f5; text-align: center; font-size: 12px; color: #666; }
        .code { font-family: monospace; background-color: #f5f5f5; padding: 10px; font-size: 18px; border-radius: 4px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; background-color: #f0b90b; color: #222; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your CryptoBot Access Code</h1>
        </div>
        <div class="content">
          <h2>Hello ${profile.name || 'there'},</h2>
          <p>As requested, here is your CryptoBot access code:</p>
          
          <div class="code">${profile.unique_code}</div>
          
          <p>Use this code to log in to your personalized dashboard and access all the features available for your account level.</p>
          
          <div style="text-align: center;">
            <a href="https://cryptobot.ai/dashboard" class="button">Go to Dashboard</a>
          </div>
          
          <p>Thank you for using CryptoBot!</p>
        </div>
        <div class="footer">
          <p>© 2025 CryptoBot. All rights reserved.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper function to get category-specific messaging
function getCategorySpecificMessage(category?: string): string {
  switch (category) {
    case 'BEGINNER':
      return "As a Beginner, your dashboard is tailored with educational resources and simplified tools to help you start your crypto journey with confidence.";
    case 'INTER':
      return "As an Intermediate user, you'll have access to more advanced charts, trend detection, and DeFi insights to enhance your crypto experience.";
    case 'EXPERT':
      return "As an Expert, you'll enjoy AI-powered trading signals, risk analysis tools, and market sentiment features to maximize your trading potential.";
    case 'VIP':
      return "As a VIP member, you have access to our premium features including priority support, exclusive research, custom alerts, and whale activity monitoring.";
    default:
      return "Your dashboard is tailored to your specific needs and experience level to help you get the most out of CryptoBot.";
  }
}