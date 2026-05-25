import { computed, ref } from 'vue';
import { booksRepository } from '@/modules/books/repositories/books.repository';
import { Book } from '@/modules/books/interfaces/book.interface';
import { UserProfile } from '@/modules/profile/interfaces/user-profile.interface';
import { usersRepository } from '@/modules/profile/repositories/users.repository';
import { t } from '@/services/localization.service';
import { BookReview } from '../interfaces/book-review.interface';
import { BorrowRequest } from '../interfaces/borrow-request.interface';
import { CatalogEntry } from '../interfaces/catalog-entry.interface';
import { Group } from '../interfaces/group.interface';
import { GroupRole } from '../interfaces/group-role.type';
import { Loan } from '../interfaces/loan.interface';
import { Membership } from '../interfaces/membership.interface';
import { bookReviewsRepository } from '../repositories/book-reviews.repository';
import { borrowRequestsRepository } from '../repositories/borrow-requests.repository';
import { groupCatalogRepository } from '../repositories/group-catalog.repository';
import { groupMembersRepository } from '../repositories/group-members.repository';
import { groupsRepository } from '../repositories/groups.repository';
import { loansRepository } from '../repositories/loans.repository';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useGroupDetailView(groupId: string) {
  const group = ref<Group | null>(null);
  const catalog = ref<CatalogEntry[]>([]);
  const myBooks = ref<Book[]>([]);
  const members = ref<Membership[]>([]);
  const currentUser = ref<UserProfile | null>(null);
  const requestQueues = ref<Record<string, BorrowRequest[]>>({});
  const requestMessages = ref<Record<string, string>>({});
  const approvalForms = ref<Record<string, { dueAt: string; notes: string }>>({});
  const activeLoansByBookId = ref<Record<string, Loan>>({});
  const returnedLoansByBookId = ref<Record<string, Loan>>({});
  const returnForms = ref<Record<string, string>>({});
  const bookReviews = ref<Record<string, BookReview[]>>({});
  const reviewForms = ref<Record<string, { rating: string; comment: string }>>({});
  const selectedBookId = ref('');
  const isLoading = ref(false);
  const isCatalogLoading = ref(false);
  const isMembersLoading = ref(false);
  const isAddingBook = ref(false);
  const updatingEntryId = ref<string | null>(null);
  const updatingMemberId = ref<string | null>(null);
  const requestingEntryId = ref<string | null>(null);
  const updatingRequestId = ref<string | null>(null);
  const returningLoanId = ref<string | null>(null);
  const reviewingLoanId = ref<string | null>(null);
  const isLeaving = ref(false);
  const errorMessage = ref('');
  const statusMessage = ref('');

  const availableBooksToAdd = computed(() => {
    const catalogBookIds = new Set(catalog.value.map((entry) => entry.bookId));

    return myBooks.value.filter((book) => !catalogBookIds.has(book.id));
  });

  const currentMembership = computed(() => {
    if (!currentUser.value) {
      return null;
    }

    return members.value.find((member) => member.userId === currentUser.value?.id) ?? null;
  });

  const currentRole = computed(() => currentMembership.value?.role ?? null);

  const canManageMembers = computed(() => currentRole.value === 'owner');

  const canTransferOwnership = computed(() => currentRole.value === 'owner');

  const activeTransferCandidates = computed(() =>
    members.value.filter((member) => member.status === 'active' && member.role !== 'owner'),
  );

  const canManageRequests = computed(() => currentRole.value === 'owner' || currentRole.value === 'admin');

  function setStatus(message: string) {
    statusMessage.value = message;
    errorMessage.value = '';
  }

  async function fetchGroup() {
    group.value = await groupsRepository.getById(groupId);
  }

  async function fetchCatalog() {
    isCatalogLoading.value = true;

    try {
      catalog.value = await groupCatalogRepository.getCatalog(groupId);
      await Promise.allSettled([fetchRequestQueues(), fetchBookReviews()]);
    } finally {
      isCatalogLoading.value = false;
    }
  }

  async function fetchBookReviews() {
    const reviewEntries = await Promise.allSettled(
      catalog.value
        .filter((entry) => entry.bookId)
        .map(async (entry) => [entry.bookId, await bookReviewsRepository.getByBookId(entry.bookId)] as const),
    );

    bookReviews.value = Object.fromEntries(
      reviewEntries
        .filter((entry): entry is PromiseFulfilledResult<readonly [string, import('../interfaces/book-review.interface').BookReview[]]> => entry.status === 'fulfilled')
        .map((entry) => entry.value),
    );
  }

  async function fetchRequestQueues() {
    const queueEntries = await Promise.allSettled(
      catalog.value.map(async (entry) => [entry.id, await borrowRequestsRepository.getQueue(entry.id)] as const),
    );
    const nextApprovalForms = { ...approvalForms.value };

    const fulfilledQueueEntries = queueEntries
      .filter((entry): entry is PromiseFulfilledResult<readonly [string, import('../interfaces/borrow-request.interface').BorrowRequest[]]> => entry.status === 'fulfilled')
      .map((entry) => entry.value);

    requestQueues.value = Object.fromEntries(fulfilledQueueEntries);

    fulfilledQueueEntries.forEach(([, requests]) => {
      requests.forEach((request) => {
        if (!nextApprovalForms[request.id]) {
          nextApprovalForms[request.id] = {
            dueAt: '',
            notes: '',
          };
        }
      });
    });

    approvalForms.value = nextApprovalForms;
  }

  async function fetchMyBooks() {
    myBooks.value = await booksRepository.getMyBooks();
  }

  async function fetchMembers() {
    isMembersLoading.value = true;

    try {
      members.value = await groupMembersRepository.getMembers(groupId);
    } finally {
      isMembersLoading.value = false;
    }
  }

  async function fetchCurrentUser() {
    currentUser.value = await usersRepository.getMe();
  }

  async function fetchPage() {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      await Promise.all([fetchGroup(), fetchCatalog(), fetchMyBooks(), fetchMembers(), fetchCurrentUser()]);
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.loadError'));
    } finally {
      isLoading.value = false;
    }
  }

  async function addSelectedBook() {
    if (!selectedBookId.value) {
      return;
    }

    isAddingBook.value = true;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await groupCatalogRepository.addBook(groupId, selectedBookId.value);
      selectedBookId.value = '';
      setStatus(t('groupDetail.bookAdded'));
      await Promise.all([fetchCatalog(), fetchMyBooks()]);
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.addBookError'));
    } finally {
      isAddingBook.value = false;
    }
  }

  async function createBorrowRequest(entry: CatalogEntry) {
    requestingEntryId.value = entry.id;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await borrowRequestsRepository.create(entry.id, requestMessages.value[entry.id]);
      requestMessages.value = {
        ...requestMessages.value,
        [entry.id]: '',
      };
      setStatus(t('groupDetail.borrowRequestCreated'));
      await fetchRequestQueues();
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.borrowRequestCreateError'));
    } finally {
      requestingEntryId.value = null;
    }
  }

  async function approveBorrowRequest(request: BorrowRequest) {
    const form = approvalForms.value[request.id];

    if (!form?.dueAt) {
      errorMessage.value = t('groupDetail.chooseDueDate');
      return;
    }

    updatingRequestId.value = request.id;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      const response = await borrowRequestsRepository.approve(request.id, new Date(form.dueAt).toISOString(), form.notes);

      if (response.loan) {
        activeLoansByBookId.value = {
          ...activeLoansByBookId.value,
          [response.loan.bookId]: response.loan,
        };
        returnForms.value = {
          ...returnForms.value,
          [response.loan.id]: '',
        };
      }

      setStatus(response.loan ? t('groupDetail.borrowRequestApprovedWithLoan') : t('groupDetail.borrowRequestApproved'));
      await fetchCatalog();
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.borrowRequestApproveError'));
    } finally {
      updatingRequestId.value = null;
    }
  }

  async function rejectBorrowRequest(request: BorrowRequest) {
    updatingRequestId.value = request.id;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await borrowRequestsRepository.reject(request.id);
      setStatus(t('groupDetail.borrowRequestRejected'));
      await fetchCatalog();
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.borrowRequestRejectError'));
    } finally {
      updatingRequestId.value = null;
    }
  }

  async function cancelBorrowRequest(request: BorrowRequest) {
    updatingRequestId.value = request.id;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await borrowRequestsRepository.cancel(request.id);
      setStatus(t('groupDetail.borrowRequestCancelled'));
      await fetchCatalog();
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.borrowRequestCancelError'));
    } finally {
      updatingRequestId.value = null;
    }
  }

  async function returnLoan(loan: Loan) {
    returningLoanId.value = loan.id;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      const response = await loansRepository.returnLoan(loan.id, returnForms.value[loan.id]);
      const nextActiveLoans = { ...activeLoansByBookId.value };

      delete nextActiveLoans[loan.bookId];

      if (response.nextLoan) {
        nextActiveLoans[response.nextLoan.bookId] = response.nextLoan;
      }

      activeLoansByBookId.value = nextActiveLoans;
      returnedLoansByBookId.value = {
        ...returnedLoansByBookId.value,
        [response.returnedLoan.bookId]: response.returnedLoan,
      };
      reviewForms.value = {
        ...reviewForms.value,
        [response.returnedLoan.id]: {
          rating: '5',
          comment: '',
        },
      };
      returnForms.value = {
        ...returnForms.value,
        [loan.id]: '',
      };
      setStatus(response.nextLoan ? t('groupDetail.loanReturnedNextActive') : t('groupDetail.loanReturned'));
      await fetchCatalog();
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.returnLoanError'));
    } finally {
      returningLoanId.value = null;
    }
  }

  async function createReview(loan: Loan) {
    const form = reviewForms.value[loan.id];
    const rating = Number(form?.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      errorMessage.value = t('groupDetail.ratingError');
      return;
    }

    reviewingLoanId.value = loan.id;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await bookReviewsRepository.create(loan.id, rating, form.comment?.trim());
      reviewForms.value = {
        ...reviewForms.value,
        [loan.id]: {
          rating: '5',
          comment: '',
        },
      };
      setStatus(t('groupDetail.reviewPublished'));
      await fetchBookReviews();
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.reviewError'));
    } finally {
      reviewingLoanId.value = null;
    }
  }

  async function toggleEntryVisibility(entry: CatalogEntry) {
    updatingEntryId.value = entry.id;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await groupCatalogRepository.updateVisibility(groupId, entry.id, !entry.isVisible);
      setStatus(entry.isVisible ? t('groupDetail.catalogEntryHidden') : t('groupDetail.catalogEntryVisible'));
      await fetchCatalog();
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.catalogEntryUpdateError'));
    } finally {
      updatingEntryId.value = null;
    }
  }

  async function removeEntry(entry: CatalogEntry) {
    updatingEntryId.value = entry.id;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await groupCatalogRepository.deleteEntry(groupId, entry.id);
      setStatus(t('groupDetail.bookRemoved'));
      await fetchCatalog();
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.removeBookError'));
    } finally {
      updatingEntryId.value = null;
    }
  }

  async function updateMemberRole(member: Membership, role: Exclude<GroupRole, 'owner'>) {
    updatingMemberId.value = member.userId;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await groupMembersRepository.updateRole(groupId, member.userId, role);
      setStatus(t('groupDetail.memberRoleUpdated').replace('{username}', member.username));
      await fetchMembers();
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.memberRoleUpdateError'));
    } finally {
      updatingMemberId.value = null;
    }
  }

  async function removeMember(member: Membership) {
    updatingMemberId.value = member.userId;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await groupMembersRepository.remove(groupId, member.userId);
      setStatus(t('groupDetail.memberRemoved').replace('{username}', member.username));
      await fetchMembers();
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.memberRemoveError'));
    } finally {
      updatingMemberId.value = null;
    }
  }

  async function blockMember(member: Membership) {
    updatingMemberId.value = member.userId;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await groupMembersRepository.block(groupId, member.userId);
      setStatus(t('groupDetail.memberBlocked').replace('{username}', member.username));
      await fetchMembers();
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.memberBlockError'));
    } finally {
      updatingMemberId.value = null;
    }
  }

  async function unblockMember(member: Membership) {
    updatingMemberId.value = member.userId;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await groupMembersRepository.unblock(groupId, member.userId);
      setStatus(t('groupDetail.memberUnblocked').replace('{username}', member.username));
      await fetchMembers();
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.memberUnblockError'));
    } finally {
      updatingMemberId.value = null;
    }
  }

  async function transferOwnership(newOwnerId: string) {
    updatingMemberId.value = newOwnerId;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      members.value = await groupMembersRepository.transferOwnership(groupId, newOwnerId);
      setStatus(t('groupDetail.ownershipTransferred'));
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.transferOwnershipError'));
    } finally {
      updatingMemberId.value = null;
    }
  }

  async function leaveGroup() {
    isLeaving.value = true;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      const activeMembersCount = members.value.filter((member) => member.status === 'active').length;
      const isCurrentOwner = Boolean(
        group.value &&
        currentUser.value &&
        (group.value.ownerId === currentUser.value.id || group.value.ownerUsername === currentUser.value.username),
      );

      if (isCurrentOwner && activeMembersCount <= 1) {
        await groupsRepository.delete(groupId);
        return;
      }

      await groupsRepository.leave(groupId);
    } catch (error) {
      errorMessage.value = getErrorMessage(error, t('groupDetail.leaveError'));
      isLeaving.value = false;
      throw error;
    }
  }

  return {
    group,
    catalog,
    myBooks,
    members,
    currentUser,
    requestQueues,
    requestMessages,
    approvalForms,
    activeLoansByBookId,
    returnedLoansByBookId,
    returnForms,
    bookReviews,
    reviewForms,
    selectedBookId,
    availableBooksToAdd,
    currentMembership,
    canManageMembers,
    canTransferOwnership,
    activeTransferCandidates,
    canManageRequests,
    isLoading,
    isCatalogLoading,
    isMembersLoading,
    isAddingBook,
    updatingEntryId,
    updatingMemberId,
    requestingEntryId,
    updatingRequestId,
    returningLoanId,
    reviewingLoanId,
    isLeaving,
    errorMessage,
    statusMessage,
    fetchPage,
    addSelectedBook,
    toggleEntryVisibility,
    removeEntry,
    createBorrowRequest,
    approveBorrowRequest,
    rejectBorrowRequest,
    cancelBorrowRequest,
    returnLoan,
    createReview,
    updateMemberRole,
    removeMember,
    blockMember,
    unblockMember,
    transferOwnership,
    leaveGroup,
  };
}
