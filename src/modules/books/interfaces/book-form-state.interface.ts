import { BookStatus } from './book-status.type';

export interface BookFormState {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publicationYear: string;
  language: string;
  description: string;
  condition: string;
  status: BookStatus;
}
