import { BaseRepository } from '@/api/base.repository';
import { HttpMethod } from '@/enums/http-method.enum';
import { CatalogEntry } from '../interfaces/catalog-entry.interface';

function normalizeEntry(entry: CatalogEntry): CatalogEntry {
  const book = entry.book;

  return {
    ...entry,
    bookId: entry.bookId ?? book?.id ?? '',
    title: entry.title ?? book?.title,
    author: entry.author ?? book?.author,
    ownerId: entry.ownerId ?? book?.ownerId,
    ownerUsername: entry.ownerUsername ?? book?.ownerUsername,
    status: entry.status ?? book?.status,
    genre: entry.genre ?? book?.genre,
    language: entry.language ?? book?.language,
    condition: entry.condition ?? book?.condition,
    description: entry.description ?? book?.description,
    createdAt: entry.createdAt ?? (entry as CatalogEntry & { addedAt?: string }).addedAt,
  };
}

class GroupCatalogRepository extends BaseRepository {
  async getCatalog(groupId: string): Promise<CatalogEntry[]> {
    const entries = await this.request<CatalogEntry[]>(`/groups/${groupId}/catalog`, HttpMethod.Get);

    return entries.map(normalizeEntry);
  }

  async addBook(groupId: string, bookId: string): Promise<CatalogEntry> {
    const entry = await this.request<CatalogEntry>(`/groups/${groupId}/catalog`, HttpMethod.Post, { bookId });

    return normalizeEntry(entry);
  }

  async updateVisibility(groupId: string, entryId: string, isVisible: boolean): Promise<CatalogEntry> {
    const entry = await this.request<CatalogEntry>(`/groups/${groupId}/catalog/${entryId}`, HttpMethod.Patch, { isVisible });

    return normalizeEntry(entry);
  }

  deleteEntry(groupId: string, entryId: string): Promise<void> {
    return this.request<void>(`/groups/${groupId}/catalog/${entryId}`, HttpMethod.Delete);
  }
}

export const groupCatalogRepository = new GroupCatalogRepository();
