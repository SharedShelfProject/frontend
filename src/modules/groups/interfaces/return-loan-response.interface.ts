import { Loan } from './loan.interface';

export interface ReturnLoanResponse {
  returnedLoan: Loan;
  nextLoan: Loan | null;
}
