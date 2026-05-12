import { Book } from '../interfaces/book.interface';

const STORAGE_KEY = 'shared-shelf-book-covers';

type StoredBookCovers = Record<string, string>;

function readStoredCovers(): StoredBookCovers {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as StoredBookCovers;
  } catch {
    return {};
  }
}

export function getBookCoverUrl(book: Pick<Book, 'id' | 'coverUrl'>) {
  return book.coverUrl || readStoredCovers()[book.id] || '';
}

export function saveBookCover(bookId: string, coverDataUrl: string) {
  if (!coverDataUrl) {
    return;
  }

  const covers = readStoredCovers();
  covers[bookId] = coverDataUrl;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(covers));
}

export function removeBookCover(bookId: string) {
  const covers = readStoredCovers();
  delete covers[bookId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(covers));
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () => reject(new Error('Could not read image file.')));
    reader.readAsDataURL(file);
  });
}
