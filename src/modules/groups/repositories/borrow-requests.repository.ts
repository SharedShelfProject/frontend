import { BaseRepository } from '@/api/base.repository';
import { HttpMethod } from '@/enums/http-method.enum';
import { ApproveRequestResponse } from '../interfaces/approve-request-response.interface';
import { BorrowRequest } from '../interfaces/borrow-request.interface';

class BorrowRequestsRepository extends BaseRepository {
  create(entryId: string, message?: string): Promise<BorrowRequest> {
    return this.request<BorrowRequest>(`/catalog/${entryId}/requests`, HttpMethod.Post, {
      message: message?.trim() || undefined,
    });
  }

  getQueue(entryId: string): Promise<BorrowRequest[]> {
    return this.request<BorrowRequest[]>(`/catalog/${entryId}/requests`, HttpMethod.Get);
  }

  approve(requestId: string, dueAt: string, notes?: string): Promise<ApproveRequestResponse> {
    return this.request<ApproveRequestResponse>(`/requests/${requestId}/approve`, HttpMethod.Post, {
      dueAt,
      notes: notes?.trim() || undefined,
    });
  }

  reject(requestId: string): Promise<BorrowRequest> {
    return this.request<BorrowRequest>(`/requests/${requestId}/reject`, HttpMethod.Post, {});
  }

  cancel(requestId: string): Promise<BorrowRequest> {
    return this.request<BorrowRequest>(`/requests/${requestId}/cancel`, HttpMethod.Post, {});
  }
}

export const borrowRequestsRepository = new BorrowRequestsRepository();
