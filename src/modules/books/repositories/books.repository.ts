import { BaseRepository } from '@/api/base.repository';
import { HttpMethod } from '@/enums/http-method.enum';
import { Book } from '../interfaces/book.interface';
import { CreateBookPayload } from '../interfaces/create-book-payload.interface';
import { UpdateBookPayload } from '../interfaces/update-book-payload.interface';

class BooksRepository extends BaseRepository {
  create(payload: CreateBookPayload): Promise<Book> {
    return this.request<Book>('/books', HttpMethod.Post, payload);
  }

  getMyBooks(): Promise<Book[]> {
    return this.request<Book[]>('/books/my', HttpMethod.Get);
  }

  getById(bookId: string): Promise<Book> {
    return this.request<Book>(`/books/${bookId}`, HttpMethod.Get);
  }

  update(bookId: string, payload: UpdateBookPayload): Promise<Book> {
    return this.request<Book>(`/books/${bookId}`, HttpMethod.Patch, payload);
  }

  delete(bookId: string): Promise<void> {
    return this.request<void>(`/books/${bookId}`, HttpMethod.Delete);
  }
}

export const booksRepository = new BooksRepository();
