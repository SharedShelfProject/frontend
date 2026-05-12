export interface BookReview {
  id: string;
  bookId: string;
  loanId: string;
  authorId: string;
  authorUsername: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}
