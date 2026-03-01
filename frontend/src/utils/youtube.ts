export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

export const isValidYouTubeUrl = (url: string): boolean => {
  return extractVideoId(url) !== null;
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getYouTubeEmbedUrl = (videoId: string, startTime?: number, endTime?: number): string => {
  const baseUrl = `https://www.youtube.com/embed/${videoId}`;
  const params = new URLSearchParams();

  if (startTime !== undefined) {
    params.append('start', Math.floor(startTime).toString());
  }

  if (endTime !== undefined) {
    params.append('end', Math.floor(endTime).toString());
  }

  // Enable JS API and disable related videos at the end
  params.append('enablejsapi', '1');
  params.append('rel', '0');

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};