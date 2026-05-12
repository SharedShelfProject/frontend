import { BorrowRequestStatus } from './borrow-request-status.type';

export interface BorrowRequest {
  id: string;
  bookId: string;
  groupBookId: string;
  requesterId: string;
  requesterUsername: string;
  status: BorrowRequestStatus;
  queuePosition?: number | null;
  message?: string | null;
  approvedDueAt?: string | null;
  approvalNotes?: string | null;
  requestedAt: string;
  resolvedAt?: string | null;
}
