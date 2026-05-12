import { BorrowRequest } from './borrow-request.interface';
import { Loan } from './loan.interface';

export interface ApproveRequestResponse {
  request: BorrowRequest;
  loan: Loan | null;
}
