import { Router } from 'express';
import * as services from './services';
import { uploadMiddleware } from './vision';
import { audioMiddleware } from './speech';
import { upload as storageUpload } from './services/storage/cloudStorage';
import { qrImageMiddleware, scanQRCode } from './services/vision/qrCodeScanner';
import { audioUpload, transcribeAudio } from './services/speech/audioTranscription';
import { generateClaudeResponse, analyzeImageWithClaude } from './anthropic';
import { analyzeSentiment } from './sentiment';
import { getTwitterSentiment, getMarketSentiment } from './twitter';

// Create router
const apiRouter = Router();

// AI Models routes
apiRouter.post('/ai/claude', generateClaudeResponse);
apiRouter.post('/ai/claude/vision', uploadMiddleware, analyzeImageWithClaude);

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

export default apiRouter;