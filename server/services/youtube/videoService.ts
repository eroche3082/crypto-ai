import { Request, Response } from 'express';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// Initialize YouTube API client
let youtubeClient: any = null;

try {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_YOUTUBE_KEY_PATH || './google-credentials-global.json',
    scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
  });
  
  youtubeClient = google.youtube({
    version: 'v3',
    auth: auth,
  });
  
  console.log('YouTube API client initialized');
} catch (error) {
  console.error('Error initializing YouTube API client:', error);
}

// Cache to minimize API quota usage
const videoCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

/**
 * Get relevant cryptocurrency videos from YouTube
 */
export async function getCryptoVideos(req: Request, res: Response) {
  try {
    if (!youtubeClient) {
      return res.status(500).json({
        error: 'YouTube API client not initialized',
        message: 'YouTube API is not available'
      });
    }

    const { query = 'cryptocurrency', maxResults = 10, type = 'analysis' } = req.query;
    
    // Create a cache key based on the request parameters
    const cacheKey = `${query}-${maxResults}-${type}`;
    
    // Check cache first
    const now = Date.now();
    if (videoCache[cacheKey] && (now - videoCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        videos: videoCache[cacheKey].data,
        source: 'cache'
      });
    }

    // Define search query based on the requested type
    let searchQuery = query as string;
    switch (type) {
      case 'analysis':
        searchQuery = `${query} technical analysis cryptocurrency`;
        break;
      case 'news':
        searchQuery = `${query} cryptocurrency news latest`;
        break;
      case 'tutorial':
        searchQuery = `${query} cryptocurrency tutorial how to`;
        break;
      case 'investment':
        searchQuery = `${query} cryptocurrency investment strategy`;
        break;
      default:
        searchQuery = `${query} cryptocurrency`;
    }

    // Call YouTube API
    const response = await youtubeClient.search.list({
      part: 'snippet',
      q: searchQuery,
      maxResults: maxResults,
      type: 'video',
      relevanceLanguage: 'en',
      videoEmbeddable: 'true',
      order: 'relevance',
    });

    // Process video data
    const videos = response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnails: item.snippet.thumbnails,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    // Update cache
    videoCache[cacheKey] = {
      data: videos,
      timestamp: now
    };

    res.json({
      videos,
      query: searchQuery,
      source: 'api'
    });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    
    // If API rate limit is reached or any other error, use sample data as fallback
    const fallbackResponse = {
      videos: [
        // Note: This is backup data that will only be used if the YouTube API fails
        // In production, you should implement proper error handling and retries
        {
          id: 'dQw4w9WgXcQ',
          title: 'Sample Crypto Analysis Video',
          description: 'This is a sample video description.',
          thumbnails: {
            default: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg' },
            medium: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
            high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' }
          },
          channelTitle: 'Crypto Expert',
          publishedAt: new Date().toISOString(),
          embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        }
      ],
      query: req.query.query || 'cryptocurrency',
      error: 'YouTube API error - displaying sample data',
      message: error instanceof Error ? error.message : String(error)
    };
    
    res.status(200).json(fallbackResponse);
  }
}

/**
 * Get video details with more information
 */
export async function getVideoDetails(req: Request, res: Response) {
  try {
    if (!youtubeClient) {
      return res.status(500).json({
        error: 'YouTube API client not initialized',
        message: 'YouTube API is not available'
      });
    }

    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({
        error: 'Missing video ID',
        message: 'Please provide a valid YouTube video ID'
      });
    }
    
    // Check cache first
    const cacheKey = `video-${videoId}`;
    const now = Date.now();
    if (videoCache[cacheKey] && (now - videoCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        video: videoCache[cacheKey].data,
        source: 'cache'
      });
    }

    // Get video details
    const response = await youtubeClient.videos.list({
      part: 'snippet,statistics,contentDetails',
      id: videoId
    });

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({
        error: 'Video not found',
        message: 'The requested video could not be found'
      });
    }

    const videoData = response.data.items[0];
    
    // Format video details
    const videoDetails = {
      id: videoData.id,
      title: videoData.snippet.title,
      description: videoData.snippet.description,
      thumbnails: videoData.snippet.thumbnails,
      channelTitle: videoData.snippet.channelTitle,
      publishedAt: videoData.snippet.publishedAt,
      tags: videoData.snippet.tags || [],
      viewCount: videoData.statistics.viewCount,
      likeCount: videoData.statistics.likeCount,
      commentCount: videoData.statistics.commentCount,
      duration: videoData.contentDetails.duration,
      embedUrl: `https://www.youtube.com/embed/${videoData.id}`,
      watchUrl: `https://www.youtube.com/watch?v=${videoData.id}`,
    };

    // Update cache
    videoCache[cacheKey] = {
      data: videoDetails,
      timestamp: now
    };

    res.json({
      video: videoDetails,
      source: 'api'
    });
  } catch (error) {
    console.error('Error fetching video details:', error);
    res.status(500).json({
      error: 'Error fetching video details',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get crypto educational playlists
 */
export async function getCryptoEducation(req: Request, res: Response) {
  try {
    if (!youtubeClient) {
      return res.status(500).json({
        error: 'YouTube API client not initialized',
        message: 'YouTube API is not available'
      });
    }

    const { level = 'beginner', topic = 'cryptocurrency' } = req.query;
    
    // Create a cache key based on request parameters
    const cacheKey = `education-${level}-${topic}`;
    
    // Check cache first
    const now = Date.now();
    if (videoCache[cacheKey] && (now - videoCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        playlists: videoCache[cacheKey].data,
        source: 'cache'
      });
    }

    // Build search query based on level and topic
    let searchQuery = `${topic} cryptocurrency `;
    switch(level) {
      case 'beginner':
        searchQuery += 'beginner tutorial introduction';
        break;
      case 'intermediate':
        searchQuery += 'intermediate guide strategy';
        break;
      case 'advanced':
        searchQuery += 'advanced masterclass expert';
        break;
      default:
        searchQuery += 'tutorial guide';
    }

    // Search for relevant playlists
    const response = await youtubeClient.search.list({
      part: 'snippet',
      q: searchQuery,
      maxResults: 10,
      type: 'playlist',
    });

    // Format playlist data
    const playlists = response.data.items.map((item: any) => ({
      id: item.id.playlistId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnails: item.snippet.thumbnails,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/playlist?list=${item.id.playlistId}`,
    }));

    // Update cache
    videoCache[cacheKey] = {
      data: playlists,
      timestamp: now
    };

    res.json({
      playlists,
      level,
      topic,
      source: 'api'
    });
  } catch (error) {
    console.error('Error fetching educational playlists:', error);
    res.status(500).json({
      error: 'Error fetching educational playlists',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}