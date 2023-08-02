import ytdl from 'ytdl-core';
import ytsr from 'ytsr';

export type FoundVideo = {
  url: string;
  title: string;
  id: string;
  description: string | null;
  duration?: number;
};

type SearchResult = {
  type: string;
  title: string;
  id: string;
  url: string;
  duration: string;
  views: number;
  uploadedAt: string;
  description: string | null;
};

const getURL: (target: string) => URL | null = (target: string) => {
  try {
    return new URL(target);
  } catch (error) {
    return null;
  }
};

export const getVideoData: (
  url: string
) => Promise<FoundVideo | null> = async url => {
  try {
    const info = await ytdl.getInfo(url);
    if (!info) {
      return null;
    }

    const { videoDetails } = info;
    return {
      id: videoDetails.videoId,
      description: videoDetails.description,
      title: videoDetails.title,
      url: videoDetails.video_url
    };
  } catch (error) {
    return null;
  }
};

export const getVideoDataWithDuration: (
  url: string
) => Promise<Required<FoundVideo> | null> = async url => {
  try {
    const found = await ytsr(url, {
      limit: 1
    });

    if (found.items.length === 0) {
      return null;
    }

    const videoData = found.items[0] as SearchResult;

    const { duration } = videoData;
    const [minutes, seconds] = duration.split(':');

    return {
      url: videoData.url,
      id: videoData.id,
      description: videoData.description,
      duration: (Number(minutes) * 60 + Number(seconds)) * 1000,
      title: videoData.title
    };
  } catch {
    return null;
  }
};

export const findVideo = async (request: string) => {
  try {
    const search = await ytsr.getFilters(request);

    const filter = search.get('Type')?.get('Video');
    if (!filter || !filter.url) {
      return null;
    }

    const { results, items } = await ytsr(filter.url);
    if (results === 0) {
      return null;
    }

    const item = items[0] as SearchResult;
    return {
      url: item.url,
      duration: item.duration
    };
  } catch (error) {
    return null;
  }
};

export const getVideo: (
  request: string
) => Promise<string | null> = async request => {
  try {
    const url = getURL(request);
    let videoUrl: string;

    if (url) {
      if (ytdl.validateURL(url.href)) {
        videoUrl = url.href;
      } else {
        throw new Error(
          'На данный момент поддерживаются только YouTube ссылки.'
        );
      }
    } else {
      const foundVideo = await findVideo(request);
      if (!foundVideo) {
        throw new Error(`Ничего не найдено по запросу: ${request}`);
      }

      videoUrl = foundVideo.url;
    }

    return videoUrl;
  } catch {
    return null;
  }
};
