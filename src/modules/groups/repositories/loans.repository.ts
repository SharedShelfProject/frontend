import { BaseRepository } from '@/api/base.repository';
import { HttpMethod } from '@/enums/http-method.enum';
import { Loan } from '../interfaces/loan.interface';
import { ReturnLoanResponse } from '../interfaces/return-loan-response.interface';

class LoansRepository extends BaseRepository {
  getMyLoans(): Promise<Loan[]> {
    return this.request<Loan[]>('/loans/my', HttpMethod.Get);
  }

  returnLoan(loanId: string, notes?: string): Promise<ReturnLoanResponse> {
    return this.request<ReturnLoanResponse>(`/loans/${loanId}/return`, HttpMethod.Post, {
      notes: notes?.trim() || undefined,
    });
  }
}

export const loansRepository = new LoansRepository();
