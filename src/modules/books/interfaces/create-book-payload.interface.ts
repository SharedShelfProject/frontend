export interface CreateBookPayload {
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  publicationYear?: number;
  language?: string;
  description?: string;
  condition?: string;
}
