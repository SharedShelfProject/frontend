import { Book } from '@/modules/books/interfaces/book.interface';

export interface CatalogEntry {
  id: string;
  groupId: string;
  bookId: string;
  isVisible: boolean;
  addedAt?: string | null;
  createdAt?: string;
  book?: Book;
  title?: string;
  author?: string;
  ownerId?: string;
  ownerUsername?: string;
  status?: Book['status'];
  genre?: string | null;
  language?: string | null;
  condition?: string | null;
  description?: string | null;
}
