import { BaseRepository } from '@/api/base.repository';
import { HttpMethod } from '@/enums/http-method.enum';
import { ReturnLoanResponse } from '../interfaces/return-loan-response.interface';

class LoansRepository extends BaseRepository {
  returnLoan(loanId: string, notes?: string): Promise<ReturnLoanResponse> {
    return this.request<ReturnLoanResponse>(`/loans/${loanId}/return`, HttpMethod.Post, {
      notes: notes?.trim() || undefined,
    });
  }
}

export const loansRepository = new LoansRepository();
