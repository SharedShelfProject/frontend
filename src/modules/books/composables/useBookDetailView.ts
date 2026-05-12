import { ref } from 'vue';
import { BookReview } from '@/modules/groups/interfaces/book-review.interface';
import { bookReviewsRepository } from '@/modules/groups/repositories/book-reviews.repository';
import { Book } from '../interfaces/book.interface';
import { booksRepository } from '../repositories/books.repository';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useBookDetailView(bookId: string) {
  const book = ref<Book | null>(null);
  const reviews = ref<BookReview[]>([]);
  const isLoading = ref(false);
  const errorMessage = ref('');

  async function fetchBookPage() {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      const [bookResponse, reviewsResponse] = await Promise.all([
        booksRepository.getById(bookId),
        bookReviewsRepository.getByBookId(bookId),
      ]);

      book.value = bookResponse;
      reviews.value = reviewsResponse;
    } catch (error) {
      errorMessage.value = getErrorMessage(error, 'Could not load book.');
    } finally {
      isLoading.value = false;
    }
  }

  return {
    book,
    reviews,
    isLoading,
    errorMessage,
    fetchBookPage,
  };
}
