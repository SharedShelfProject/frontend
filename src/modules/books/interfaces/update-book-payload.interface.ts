import { BookStatus } from './book-status.type';
import { CreateBookPayload } from './create-book-payload.interface';

export interface UpdateBookPayload extends Partial<CreateBookPayload> {
  status?: BookStatus;
}
