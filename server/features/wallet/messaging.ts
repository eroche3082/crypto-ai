import { Request, Response } from 'express';
import { db } from '../../db';
import { walletMessages, insertWalletMessageSchema } from '@shared/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Get all messages for a wallet address (either sent or received)
 */
export async function getWalletMessages(req: Request, res: Response) {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Validate wallet address format
    if (!isValidWalletAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Get messages where this wallet is either sender or recipient
    const messages = await db.select()
      .from(walletMessages)
      .where(
        or(
          eq(walletMessages.senderId, walletAddress),
          eq(walletMessages.recipientId, walletAddress)
        )
      )
      .orderBy(desc(walletMessages.timestamp));

    return res.json(messages);
  } catch (error) {
    console.error('Error getting wallet messages:', error);
    return res.status(500).json({ error: 'Failed to get wallet messages' });
  }
}

/**
 * Send a message from one wallet to another
 */
export async function sendWalletMessage(req: Request, res: Response) {
  try {
    // Validate input
    const validationSchema = insertWalletMessageSchema.extend({
      senderId: z.string().refine(isValidWalletAddress, { message: 'Invalid sender wallet address' }),
      recipientId: z.string().refine(isValidWalletAddress, { message: 'Invalid recipient wallet address' }),
      content: z.string().min(1, { message: 'Message content is required' }),
    });

    const validatedData = validationSchema.parse(req.body);

    // Optional: Encrypt message content here if needed
    // const encryptedContent = encryptMessage(validatedData.content);
    
    // Insert the message into the database
    const [message] = await db.insert(walletMessages)
      .values(validatedData)
      .returning();

    // Optional: If implementing real-time messaging
    // notifyRecipient(message);

    return res.status(201).json(message);
  } catch (error) {
    console.error('Error sending wallet message:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to send wallet message' });
  }
}

/**
 * Get conversation between two wallets
 */
export async function getWalletConversation(req: Request, res: Response) {
  try {
    const { wallet1, wallet2 } = req.params;
    
    if (!wallet1 || !wallet2) {
      return res.status(400).json({ error: 'Both wallet addresses are required' });
    }

    // Validate wallet addresses
    if (!isValidWalletAddress(wallet1) || !isValidWalletAddress(wallet2)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Get messages between these two wallets
    const messages = await db.select()
      .from(walletMessages)
      .where(
        or(
          and(
            eq(walletMessages.senderId, wallet1),
            eq(walletMessages.recipientId, wallet2)
          ),
          and(
            eq(walletMessages.senderId, wallet2),
            eq(walletMessages.recipientId, wallet1)
          )
        )
      )
      .orderBy(desc(walletMessages.timestamp));

    return res.json(messages);
  } catch (error) {
    console.error('Error getting wallet conversation:', error);
    return res.status(500).json({ error: 'Failed to get wallet conversation' });
  }
}

/**
 * Update message status (read, delivered)
 */
export async function updateMessageStatus(req: Request, res: Response) {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    
    if (!messageId || !status) {
      return res.status(400).json({ error: 'Message ID and status are required' });
    }

    // Validate status
    const validStatuses = ['sent', 'delivered', 'read'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: sent, delivered, read' });
    }

    // Update message status
    const [updatedMessage] = await db
      .update(walletMessages)
      .set({ status })
      .where(eq(walletMessages.id, parseInt(messageId)))
      .returning();

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    return res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message status:', error);
    return res.status(500).json({ error: 'Failed to update message status' });
  }
}

/**
 * Validate wallet address format
 * This is a simplified validation - in a real implementation, this would check chain-specific formats
 */
function isValidWalletAddress(address: string): boolean {
  // Ethereum-style addresses: 0x followed by 40 hex characters
  const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
  
  // Solana-style addresses: Base58 encoded, typically 32-44 characters
  const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  
  // Bitcoin-style addresses: 26-35 alphanumeric characters, usually starting with 1, 3, or bc1
  const bitcoinRegex = /^(1|3|bc1)[a-zA-Z0-9]{25,59}$/;
  
  return ethereumRegex.test(address) || 
         solanaRegex.test(address) || 
         bitcoinRegex.test(address);
}