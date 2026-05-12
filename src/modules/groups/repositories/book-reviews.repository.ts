import { BaseRepository } from '@/api/base.repository';
import { HttpMethod } from '@/enums/http-method.enum';
import { BookReview } from '../interfaces/book-review.interface';

class BookReviewsRepository extends BaseRepository {
  getByBookId(bookId: string): Promise<BookReview[]> {
    return this.request<BookReview[]>(`/books/${bookId}/reviews`, HttpMethod.Get, undefined, {
      useAuthorization: false,
    });
  }

  create(loanId: string, rating: number, comment?: string): Promise<BookReview> {
    return this.request<BookReview>(`/loans/${loanId}/reviews`, HttpMethod.Post, {
      rating,
      comment: comment?.trim() || undefined,
    });
  }
}

export const bookReviewsRepository = new BookReviewsRepository();
