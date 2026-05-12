import { computed, ref } from 'vue';
import { Book } from '../interfaces/book.interface';
import { BookFormState } from '../interfaces/book-form-state.interface';
import { CreateBookPayload } from '../interfaces/create-book-payload.interface';
import { UpdateBookPayload } from '../interfaces/update-book-payload.interface';
import { booksRepository } from '../repositories/books.repository';
import { removeBookCover } from '../services/book-cover.service';

const EMPTY_BOOK_FORM: BookFormState = {
  title: '',
  author: '',
  isbn: '',
  genre: '',
  publicationYear: '',
  language: '',
  description: '',
  condition: '',
  status: 'available',
};

function trimOptional(value: string): string | undefined {
  const trimmedValue = value.trim();

  return trimmedValue || undefined;
}

function normalizeYear(value: string): number | undefined {
  const year = Number(value);

  return Number.isInteger(year) ? year : undefined;
}

function createFormState(book?: Book): BookFormState {
  if (!book) {
    return { ...EMPTY_BOOK_FORM };
  }

  return {
    title: book.title,
    author: book.author,
    isbn: book.isbn ?? '',
    genre: book.genre ?? '',
    publicationYear: book.publicationYear ? String(book.publicationYear) : '',
    language: book.language ?? '',
    description: book.description ?? '',
    condition: book.condition ?? '',
    status: book.status,
  };
}

function createPayload(form: BookFormState): CreateBookPayload {
  return {
    title: form.title.trim(),
    author: form.author.trim(),
    isbn: trimOptional(form.isbn),
    genre: trimOptional(form.genre),
    publicationYear: form.publicationYear ? normalizeYear(form.publicationYear) : undefined,
    language: trimOptional(form.language),
    description: trimOptional(form.description),
    condition: trimOptional(form.condition),
  };
}

function createUpdatePayload(form: BookFormState): UpdateBookPayload {
  return {
    ...createPayload(form),
    status: form.status,
  };
}

export function useMyBooksView() {
  const books = ref<Book[]>([]);
  const form = ref<BookFormState>(createFormState());
  const editingBookId = ref<string | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const deletingBookId = ref<string | null>(null);
  const errorMessage = ref('');
  const statusMessage = ref('');

  const isEditing = computed(() => Boolean(editingBookId.value));

  async function fetchBooks() {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      books.value = await booksRepository.getMyBooks();
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Could not load books.';
    } finally {
      isLoading.value = false;
    }
  }

  function resetForm() {
    form.value = createFormState();
    editingBookId.value = null;
  }

  function startEditing(book: Book) {
    form.value = createFormState(book);
    editingBookId.value = book.id;
    statusMessage.value = '';
    errorMessage.value = '';
  }

  async function saveBook() {
    isSaving.value = true;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      if (editingBookId.value) {
        await booksRepository.update(editingBookId.value, createUpdatePayload(form.value));
        statusMessage.value = 'Book updated successfully.';
      } else {
        await booksRepository.create(createPayload(form.value));
        statusMessage.value = 'Book added to your collection.';
      }

      resetForm();
      await fetchBooks();
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Could not save book.';
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteBook(book: Book) {
    deletingBookId.value = book.id;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await booksRepository.delete(book.id);
      removeBookCover(book.id);
      statusMessage.value = `"${book.title}" was removed.`;

      if (editingBookId.value === book.id) {
        resetForm();
      }

      await fetchBooks();
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Could not delete book.';
    } finally {
      deletingBookId.value = null;
    }
  }

  return {
    books,
    form,
    editingBookId,
    isEditing,
    isLoading,
    isSaving,
    deletingBookId,
    errorMessage,
    statusMessage,
    fetchBooks,
    resetForm,
    startEditing,
    saveBook,
    deleteBook,
  };
}
