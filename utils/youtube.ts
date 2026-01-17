
export const getYouTubeID = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const getYouTubeThumbnail = (url: string) => {
  const id = getYouTubeID(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

export const getYouTubeEmbedUrl = (url: string) => {
  const id = getYouTubeID(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
};
