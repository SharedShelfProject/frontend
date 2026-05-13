import { LoanStatus } from './loan-status.type';

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  groupId: string;
  borrowerId: string;
  borrowerUsername: string;
  ownerId: string;
  ownerUsername: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt?: string | null;
  status: LoanStatus;
  notes?: string | null;
}
