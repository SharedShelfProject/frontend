import { BaseRepository } from '@/api/base.repository';
import { HttpMethod } from '@/enums/http-method.enum';
import { CatalogEntry } from '../interfaces/catalog-entry.interface';

class GroupCatalogRepository extends BaseRepository {
  getCatalog(groupId: string): Promise<CatalogEntry[]> {
    return this.request<CatalogEntry[]>(`/groups/${groupId}/catalog`, HttpMethod.Get);
  }

  addBook(groupId: string, bookId: string): Promise<CatalogEntry> {
    return this.request<CatalogEntry>(`/groups/${groupId}/catalog`, HttpMethod.Post, { bookId });
  }

  updateVisibility(groupId: string, entryId: string, isVisible: boolean): Promise<CatalogEntry> {
    return this.request<CatalogEntry>(`/groups/${groupId}/catalog/${entryId}`, HttpMethod.Patch, { isVisible });
  }

  deleteEntry(groupId: string, entryId: string): Promise<void> {
    return this.request<void>(`/groups/${groupId}/catalog/${entryId}`, HttpMethod.Delete);
  }
}

export const groupCatalogRepository = new GroupCatalogRepository();
