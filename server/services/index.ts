// Vertex AI Services
export * from './vertex/marketAnalysis';

// Vision Services
export { 
  analyzeChartImage,
  chartImageMiddleware
} from './vision/chartAnalysis';

export {
  scanQRCode,
  qrImageMiddleware,
  scanQRCodeWithVision,
  scanQRCodeWithJsQR
} from './vision/qrCodeScanner';

// Speech Services
export {
  transcribeAudio,
  audioMiddleware,
  audioUpload
} from './speech/audioTranscription';

// Translation Services
export * from './translation/languageService';

// Maps Services
export * from './maps/cryptoEvents';

// YouTube Services
export * from './youtube/videoService';

// Storage Services
export {
  uploadFile,
  listUserFiles,
  deleteFile
} from './storage/cloudStorage';

// Secret Manager Services
export * from './secrets/secretManager';

// Crypto Services
export * from './crypto/whaleAlert';
export * from './crypto/coinMarketCal';

// DeFi Services
export * from './defi/etherscan';
export * from './defi/defillama';

// Alert Services
export * from './alerts/twilio';