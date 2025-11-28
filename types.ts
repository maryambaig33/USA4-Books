export interface Book {
  id?: string;
  title: string;
  author: string;
  description: string;
  year?: string;
  genre?: string;
  coverColor?: string; // Hex code for dynamic covers
  rating?: number;
  reason?: string; // Why it was recommended
}

export enum ViewState {
  HOME = 'HOME',
  SEARCH_RESULTS = 'SEARCH_RESULTS',
  BOOK_DETAILS = 'BOOK_DETAILS',
  FAVORITES = 'FAVORITES',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
