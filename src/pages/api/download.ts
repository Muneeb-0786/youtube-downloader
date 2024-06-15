import ytdl from 'ytdl-core';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { videoUrl, format = 'video' } = req.query;

  if (!videoUrl || typeof videoUrl !== 'string') {
    return res.status(400).json({ error: 'Invalid video URL' });
  }

  try {
    // Get video info
    const info = await ytdl.getInfo(videoUrl);

    // Choose format based on the query parameter
    const filter = format === 'audio' ? 'audioonly' : 'videoandaudio';
    const formats = ytdl.filterFormats(info.formats, filter);

    if (formats.length === 0) {
      return res.status(404).json({ error: 'No suitable formats found for the requested type' });
    }

    const chosenFormat = formats[0]; // Choose the first format as an example

    // Set response headers
    res.setHeader('Content-Disposition', `attachment; filename="${info.videoDetails.title}.${chosenFormat.container}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Stream the video/audio
    ytdl(videoUrl, { format: chosenFormat })
      .pipe(res)
      .on('finish', () => res.status(200).end())
      .on('error', (error: any) => {
        console.error('Error during download:', error);
        res.status(500).json({ error: 'Failed to download the video' });
      });
  } catch (error: any) {
    console.error('Error fetching video info:', error);
    res.status(500).json({ error: 'Failed to retrieve video information. Please check the URL and try again.' });
  }
}
