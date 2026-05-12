import { BookStatus } from './book-status.type';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  genre?: string | null;
  publicationYear?: number | null;
  language?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  condition?: string | null;
  status: BookStatus;
  ownerId: string;
  ownerUsername: string;
  createdAt: string;
}
