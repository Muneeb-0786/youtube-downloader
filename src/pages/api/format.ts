import ytdl from 'ytdl-core';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { videoUrl } = req.query;

  if (!videoUrl || typeof videoUrl !== 'string') {
    return res.status(400).json({ error: 'Invalid video URL' });
  }

  try {
    // Get video info
    const info = await ytdl.getInfo(videoUrl);
    const formats = ytdl.filterFormats(info.formats, 'audioandvideo');
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

    // Extract relevant information
    const videoInfo = {
      title: info.videoDetails.title,
      description: info.videoDetails.description,
      thumbnail: info.videoDetails.thumbnails[0]?.url || '',
      duration: info.videoDetails.lengthSeconds,
      views: info.videoDetails.viewCount,
      uploadDate: info.videoDetails.uploadDate,
      author: {
        name: info.videoDetails.author.name,
        channelUrl: info.videoDetails.author.channel_url,
        avatar: info.videoDetails.author.thumbnails ? info.videoDetails.author.thumbnails[0]?.url : null,
      },
      video: formats.map(format => ({
        quality: format.qualityLabel,
        format: format.container,
        itag: format.itag,
      })),
      audio: audioFormats.map(format => ({
        bitrate: format.audioBitrate,
        format: format.container,
        itag: format.itag,
      })),
      info: info.formats
    };

    res.status(200).json(videoInfo);
  } catch (error: any) {
    console.error('Error fetching video info:', error);
    res.status(500).json({ error: 'Failed to retrieve video information. Please check the URL and try again.' });
  }
}
