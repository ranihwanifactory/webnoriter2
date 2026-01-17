
export interface Game {
  id: string;
  title: string;
  category: string;
  description: string;
  screenshotUrl?: string;
  youtubeUrl?: string;
  appUrl: string;
  createdAt: number;
  authorEmail: string;
}

export interface Review {
  id: string;
  gameId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  comment: string;
  rating: number;
  createdAt: number;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
