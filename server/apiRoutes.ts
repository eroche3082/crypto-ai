import { Router } from 'express';
import * as services from './services';
import { uploadMiddleware } from './vision';
import { audioMiddleware } from './speech';
import { upload as storageUpload } from './services/storage/cloudStorage';
import { qrImageMiddleware, scanQRCode } from './services/vision/qrCodeScanner';
import { audioUpload, transcribeAudio } from './services/speech/audioTranscription';
import { generateClaudeResponse, analyzeImageWithClaude } from './anthropic';
import { generateAIResponse } from './gemini';
import { analyzeSentiment } from './sentiment';
import { getTwitterSentiment, getMarketSentiment } from './twitter';
import { handleContextAwareChat } from './controllers/contextAwareChatController';
import { getProviders } from './controllers/aiProviderController';
import { handleVertexChat } from './chatbot';
import { 
  getWalletMessages, 
  sendWalletMessage, 
  getWalletConversation,
  updateMessageStatus 
} from './features/wallet/messaging';
import { analyzePortfolio } from './portfolio/analyzer';
import avatarRoutes from './routes/avatarRoutes';
import readyPlayerMeRoutes from './routes/readyPlayerMeRoutes';

// Create router
const apiRouter = Router();

// AI Models routes
apiRouter.post('/ai/claude', generateClaudeResponse);
apiRouter.post('/ai/claude/vision', uploadMiddleware, analyzeImageWithClaude);
apiRouter.post('/ai/gemini', generateAIResponse);
apiRouter.post('/ai/context-chat', handleContextAwareChat);
apiRouter.get('/chat/providers', getProviders);
// Vertex Flash AI Chatbot endpoint - Updated to use Vertex API
apiRouter.post('/chat/vertex', handleVertexChat);

// Vertex AI Market Analysis routes
apiRouter.post('/vertex/market/analyze', services.analyzeMarketTrends);
apiRouter.post('/vertex/market/predict', services.predictPrices);

// Vision and Image Analysis routes
apiRouter.post('/vision/analyze-chart', services.chartImageMiddleware, services.analyzeChartImage);
apiRouter.post('/vision/analyze-image', uploadMiddleware, services.analyzeImage || analyzeImageWithClaude);
apiRouter.post('/vision/scan-qr', qrImageMiddleware, scanQRCode);

// Speech and Audio routes
apiRouter.post('/speech/transcribe', audioUpload.single('audio'), transcribeAudio);

// Translation and Language routes
apiRouter.post('/translate/detect', services.detectLanguage);
apiRouter.post('/translate/text', services.translateText);
apiRouter.get('/translate/supported-languages', services.getSupportedLanguages);
apiRouter.get('/translate/ui-translations', services.getUiTranslations);

// Maps and Events routes
apiRouter.get('/maps/events', services.getCryptoEvents);
apiRouter.get('/maps/adoption', services.getCryptoAdoption);
apiRouter.get('/maps/merchants', services.getCryptoMerchants);

// YouTube video routes
apiRouter.get('/youtube/videos', services.getCryptoVideos);
apiRouter.get('/youtube/video/:videoId', services.getVideoDetails);
apiRouter.get('/youtube/education', services.getCryptoEducation);

// Cloud Storage routes
apiRouter.post('/storage/upload', storageUpload.single('file'), services.uploadFile);
apiRouter.get('/storage/files', services.listUserFiles);
apiRouter.delete('/storage/files/:filePath', services.deleteFile);

// Crypto data and alerts routes
apiRouter.get('/crypto/whale-alerts', services.getWhaleTransactions);
apiRouter.get('/crypto/whale-stats', services.getWhaleStats);
apiRouter.get('/crypto/blockchain-status', services.getBlockchainStatus);

// Events calendar routes
apiRouter.get('/crypto/events', services.getUpcomingEvents);
apiRouter.get('/crypto/events/categories', services.getEventCategories);
apiRouter.get('/crypto/events/coin/:symbol', services.searchEventsByCoin);

// DeFi routes
apiRouter.get('/defi/protocol/:protocol', services.getProtocolInfo);
apiRouter.get('/defi/protocols', services.getTopProtocols);
apiRouter.get('/defi/yields', services.getTopYields);
apiRouter.get('/defi/chain/:chain', services.getChainTVL);

// Ethereum and on-chain data routes
apiRouter.get('/ethereum/address/:address', services.getAddressInfo);
apiRouter.get('/ethereum/contract/:address', services.getContractInfo);
apiRouter.get('/ethereum/gas', services.getGasPrice);

// Alerts routes
apiRouter.post('/alerts/register-phone', services.registerPhoneForAlerts);

// Sentiment Analysis routes
apiRouter.post('/sentiment/analyze', analyzeSentiment);
apiRouter.get('/sentiment/twitter/:symbol', getTwitterSentiment);
apiRouter.get('/sentiment/market', getMarketSentiment);

// Wallet-to-Wallet Messaging endpoints
apiRouter.get('/wallet/messages/:walletAddress', getWalletMessages);
apiRouter.post('/wallet/messages', sendWalletMessage);
apiRouter.get('/wallet/messages/conversation/:wallet1/:wallet2', getWalletConversation);
apiRouter.patch('/wallet/messages/:messageId/status', updateMessageStatus);

// Portfolio Analysis endpoints
apiRouter.get('/portfolio/analysis', analyzePortfolio);

// NFT Gallery endpoints
import { getNFTsForWallet, getNFTCollection, getNFTDetails } from './nft/opensea';
import { getMoralisNFTs, getMoralisNFTTransfers } from './nft/moralis';
import { 
  getTokenInfo, 
  getTokenContract, 
  getWalletTokens, 
  addToWatchlist, 
  removeFromWatchlist, 
  getWatchlist 
} from './nft/token-tracker';

apiRouter.get('/nft/wallet/:walletAddress', getNFTsForWallet);
apiRouter.get('/nft/collection/:collectionSlug', getNFTCollection);
apiRouter.get('/nft/token/:contractAddress/:tokenId', getNFTDetails);
apiRouter.get('/nft/moralis/wallet/:walletAddress', getMoralisNFTs);
apiRouter.get('/nft/moralis/transfers/:walletAddress', getMoralisNFTTransfers);

// Token Tracker endpoints
apiRouter.get('/tokens/info/:tokenId', getTokenInfo);
apiRouter.get('/tokens/contract/:chain/:contractAddress', getTokenContract);
apiRouter.get('/tokens/wallet/:walletAddress', getWalletTokens);
apiRouter.post('/tokens/watchlist', addToWatchlist);
apiRouter.delete('/tokens/watchlist/:tokenId', removeFromWatchlist);
apiRouter.get('/tokens/watchlist', getWatchlist);

// Twitter Integration endpoints
import {
  getUserTweets,
  getTopicTimeline,
  searchTweets,
  getTrendingTopics,
  getUserProfile,
  analyzeCryptoSentiment
} from './twitter/api';

apiRouter.get('/twitter/user/:username/tweets/:count?', getUserTweets);
apiRouter.get('/twitter/list/:listId/timeline/:count?', getTopicTimeline);
apiRouter.get('/twitter/search/:query/:count?', searchTweets);
apiRouter.get('/twitter/trends/:woeid?', getTrendingTopics);
apiRouter.get('/twitter/profile/:username', getUserProfile);
apiRouter.get('/twitter/sentiment/:symbol', analyzeCryptoSentiment);

// Tax Simulator endpoints
import {
  calculateTaxes,
  getTaxInfo,
  getAvailableCountries
} from './tax/simulator';

apiRouter.post('/tax/calculate', calculateTaxes);
apiRouter.get('/tax/info/:country?', getTaxInfo);
apiRouter.get('/tax/countries', getAvailableCountries);

// Gamification endpoints
import {
  listAchievements,
  getUserAchievements,
  unlockAchievement,
  updateAchievementProgress,
  listChallenges,
  getUserChallenges,
  startChallenge,
  updateChallengeProgress,
  getUserActivity,
  getUserProfile as getGamificationUserProfile,
  getLeaderboards,
  getLeaderboardEntries
} from './gamification/controller';

apiRouter.get('/gamification/achievements', listAchievements);
apiRouter.get('/gamification/achievements/user/:userId', getUserAchievements);
apiRouter.post('/gamification/achievements/user/:userId/:achievementId/unlock', unlockAchievement);
apiRouter.patch('/gamification/achievements/user/:userId/:achievementId/progress', updateAchievementProgress);

apiRouter.get('/gamification/challenges', listChallenges);
apiRouter.get('/gamification/challenges/user/:userId', getUserChallenges);
apiRouter.post('/gamification/challenges/user/:userId/:challengeId/start', startChallenge);
apiRouter.patch('/gamification/challenges/user/:userId/:challengeId/progress', updateChallengeProgress);

apiRouter.get('/gamification/activity/:userId', getUserActivity);
apiRouter.get('/gamification/profile/:userId', getGamificationUserProfile);

apiRouter.get('/gamification/leaderboards', getLeaderboards);
apiRouter.get('/gamification/leaderboards/:leaderboardId/entries', getLeaderboardEntries);

// Avatar AI Video routes
apiRouter.use('/avatars', avatarRoutes);

// Ready Player Me Avatars routes
apiRouter.use('/readyplayerme', readyPlayerMeRoutes);

export default apiRouter;