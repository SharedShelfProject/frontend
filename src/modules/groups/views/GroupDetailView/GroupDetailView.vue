<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import { GROUPS_ROUTE_PATH } from '@/constants/routes.constants';
import { RouteName } from '@/enums/route-name.enum';
import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { BorrowRequest } from '../../interfaces/borrow-request.interface';
import { CatalogEntry } from '../../interfaces/catalog-entry.interface';
import { Membership } from '../../interfaces/membership.interface';
import { useGroupDetailView } from '../../composables/useGroupDetailView';
import './GroupDetailView.css';

const route = useRoute();
const router = useRouter();
const groupId = String(route.params.id);

const {
  group,
  catalog,
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
} = useGroupDetailView(groupId);

const catalogCountLabel = computed(() => {
  const count = catalog.value.length;

  return `${count} ${count === 1 ? 'book' : 'books'}`;
});

onMounted(fetchPage);

function getEntryTitle(entry: CatalogEntry) {
  return entry.book?.title ?? entry.title ?? 'Untitled book';
}

function getEntryAuthor(entry: CatalogEntry) {
  return entry.book?.author ?? entry.author ?? 'Unknown author';
}

function getEntryStatus(entry: CatalogEntry) {
  return entry.book?.status ?? entry.status ?? 'available';
}

function getEntryMeta(entry: CatalogEntry) {
  return {
    genre: entry.book?.genre ?? entry.genre,
    language: entry.book?.language ?? entry.language,
    condition: entry.book?.condition ?? entry.condition,
    owner: entry.book?.ownerUsername ?? entry.ownerUsername,
    description: entry.book?.description ?? entry.description,
  };
}

function getEntryOwnerId(entry: CatalogEntry) {
  return entry.book?.ownerId ?? entry.ownerId;
}

function getEntryRequests(entry: CatalogEntry) {
  return requestQueues.value[entry.id] ?? [];
}

function getEntryReviews(entry: CatalogEntry) {
  return bookReviews.value[entry.bookId] ?? [];
}

function getEntryActiveLoan(entry: CatalogEntry) {
  return activeLoansByBookId.value[entry.bookId] ?? null;
}

function getEntryReturnedLoan(entry: CatalogEntry) {
  return returnedLoansByBookId.value[entry.bookId] ?? null;
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatVisibility() {
  return group.value?.visibility === 'open' ? 'Open' : 'Private';
}

async function handleLeaveGroup() {
  if (!group.value || !window.confirm(`Leave "${group.value.name}"?`)) {
    return;
  }

  try {
    await leaveGroup();
    await router.push(GROUPS_ROUTE_PATH);
  } catch {
    // Error state is handled in the composable.
  }
}

function handleRemoveEntry(entry: CatalogEntry) {
  if (window.confirm(`Remove "${getEntryTitle(entry)}" from this catalog?`)) {
    void removeEntry(entry);
  }
}

function canRequestEntry(entry: CatalogEntry) {
  return Boolean(entry.isVisible && currentUser.value && getEntryOwnerId(entry) !== currentUser.value.id);
}

function canCancelRequest(request: BorrowRequest) {
  return (
    currentUser.value?.id === request.requesterId &&
    (request.status === 'pending' || request.status === 'approved')
  );
}

function canResolveRequest(request: BorrowRequest) {
  return canManageRequests.value && (request.status === 'pending' || request.status === 'approved');
}

function formatRequestDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function canReturnLoan(entry: CatalogEntry) {
  const loan = getEntryActiveLoan(entry);

  if (!loan || !currentUser.value) {
    return false;
  }

  return (
    loan.borrowerId === currentUser.value.id ||
    loan.ownerId === currentUser.value.id ||
    canManageRequests.value
  );
}

function canReviewReturnedLoan(entry: CatalogEntry) {
  const loan = getEntryReturnedLoan(entry);

  return Boolean(loan && currentUser.value?.id === loan.borrowerId);
}

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function handleRejectRequest(request: BorrowRequest) {
  if (window.confirm(`Reject request from ${request.requesterUsername}?`)) {
    void rejectBorrowRequest(request);
  }
}

function handleCancelRequest(request: BorrowRequest) {
  if (window.confirm('Cancel this borrow request?')) {
    void cancelBorrowRequest(request);
  }
}

function canChangeRole(member: Membership) {
  return canManageMembers.value && member.role !== 'owner' && member.status === 'active';
}

function canRemoveMember(member: Membership) {
  return canManageMembers.value && member.role !== 'owner';
}

function canBlockMember(member: Membership) {
  return canManageMembers.value && member.role !== 'owner' && member.status === 'active';
}

function handleRemoveMember(member: Membership) {
  if (window.confirm(`Remove ${member.username} from this group?`)) {
    void removeMember(member);
  }
}

function handleBlockMember(member: Membership) {
  if (window.confirm(`Block ${member.username}?`)) {
    void blockMember(member);
  }
}

function handleTransferOwnership(event: Event) {
  const select = event.target as HTMLSelectElement;
  const newOwnerId = select.value;
  const member = members.value.find((item) => item.userId === newOwnerId);

  if (!newOwnerId || !member) {
    return;
  }

  if (window.confirm(`Transfer ownership to ${member.username}?`)) {
    void transferOwnership(newOwnerId);
  } else {
    select.value = '';
  }
}
</script>

<template>
  <main class="group-detail-view">
    <section class="group-detail-view__shell">
      <RouterLink class="group-detail-view__back-link" :to="GROUPS_ROUTE_PATH">Back to groups</RouterLink>

      <div v-if="isLoading" class="group-detail-view__loading" aria-live="polite">
        <span class="group-detail-view__spinner" aria-hidden="true"></span>
        <span>Loading group...</span>
      </div>

      <template v-else-if="group">
        <section class="group-detail-view__hero" aria-label="Group details">
          <div>
            <p class="group-detail-view__eyebrow">Group catalog</p>
            <h1 class="group-detail-view__title">{{ group.name }}</h1>
            <p v-if="group.description" class="group-detail-view__description">{{ group.description }}</p>
          </div>

          <div class="group-detail-view__hero-actions">
            <span class="group-detail-view__badge" :class="`group-detail-view__badge--${group.visibility}`">
              {{ formatVisibility() }}
            </span>
            <BaseButton
              label="Leave group"
              :is-loading="isLeaving"
              :variant="BaseButtonVariant.Secondary"
              @click="handleLeaveGroup"
            />
          </div>
        </section>

        <BaseError :message="errorMessage" />
        <p v-if="statusMessage" class="group-detail-view__success" role="status">{{ statusMessage }}</p>

        <section v-if="group.inviteCode" class="group-detail-view__invite" aria-label="Invite code">
          <span>Invite code</span>
          <strong>{{ group.inviteCode }}</strong>
        </section>

        <section class="group-detail-view__layout">
          <section class="group-detail-view__panel" aria-label="Add book to catalog">
            <div class="group-detail-view__panel-header">
              <div>
                <h2>Add your book</h2>
                <p>Choose one of your books that is not in this catalog yet.</p>
              </div>
            </div>

            <form class="group-detail-view__add-form" novalidate @submit.prevent="addSelectedBook">
              <label class="group-detail-view__field">
                <span>Book</span>
                <select v-model="selectedBookId" name="bookId">
                  <option value="">Select a book</option>
                  <option v-for="book in availableBooksToAdd" :key="book.id" :value="book.id">
                    {{ book.title }} - {{ book.author }}
                  </option>
                </select>
              </label>

              <BaseButton
                label="Add to catalog"
                :disabled="!selectedBookId"
                :is-loading="isAddingBook"
                :type="BaseButtonHtmlType.Submit"
              />
            </form>

            <p v-if="!availableBooksToAdd.length" class="group-detail-view__note">
              All your books are already in this catalog, or your personal collection is empty.
            </p>
          </section>

          <section class="group-detail-view__panel" aria-label="Group members">
            <div class="group-detail-view__panel-header">
              <div>
                <h2>Members</h2>
                <p>{{ members.length }} {{ members.length === 1 ? 'member' : 'members' }}</p>
              </div>
            </div>

            <label v-if="canTransferOwnership && activeTransferCandidates.length" class="group-detail-view__field">
              <span>Transfer ownership</span>
              <select name="newOwnerId" :disabled="Boolean(updatingMemberId)" @change="handleTransferOwnership">
                <option value="">Select member</option>
                <option v-for="member in activeTransferCandidates" :key="member.userId" :value="member.userId">
                  {{ member.username }}
                </option>
              </select>
            </label>

            <div v-if="isMembersLoading" class="group-detail-view__loading group-detail-view__loading--inline">
              <span class="group-detail-view__spinner" aria-hidden="true"></span>
              <span>Loading members...</span>
            </div>

            <div v-else-if="members.length" class="group-detail-view__members-list">
              <article
                v-for="member in members"
                :key="member.userId"
                class="group-detail-view__member"
                :class="{ 'group-detail-view__member--blocked': member.status === 'blocked' }"
              >
                <div>
                  <h3>{{ member.username }}</h3>
                  <div class="group-detail-view__member-badges">
                    <span class="group-detail-view__role-badge" :class="`group-detail-view__role-badge--${member.role}`">
                      {{ formatRole(member.role) }}
                    </span>
                    <span
                      class="group-detail-view__member-status"
                      :class="`group-detail-view__member-status--${member.status}`"
                    >
                      {{ formatRole(member.status) }}
                    </span>
                  </div>
                </div>

                <div v-if="canManageMembers" class="group-detail-view__member-actions">
                  <select
                    v-if="canChangeRole(member)"
                    :disabled="updatingMemberId === member.userId"
                    :value="member.role"
                    aria-label="Change member role"
                    @change="updateMemberRole(member, ($event.target as HTMLSelectElement).value as 'admin' | 'member')"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>

                  <BaseButton
                    v-if="canBlockMember(member)"
                    label="Block"
                    :disabled="updatingMemberId === member.userId"
                    :is-loading="updatingMemberId === member.userId"
                    :variant="BaseButtonVariant.Secondary"
                    @click="handleBlockMember(member)"
                  />

                  <BaseButton
                    v-else-if="member.status === 'blocked'"
                    label="Unblock"
                    :disabled="updatingMemberId === member.userId"
                    :is-loading="updatingMemberId === member.userId"
                    :variant="BaseButtonVariant.Secondary"
                    @click="unblockMember(member)"
                  />

                  <BaseButton
                    v-if="canRemoveMember(member)"
                    label="Remove"
                    :disabled="updatingMemberId === member.userId"
                    :variant="BaseButtonVariant.Secondary"
                    @click="handleRemoveMember(member)"
                  />
                </div>
              </article>
            </div>

            <div v-else class="group-detail-view__empty group-detail-view__empty--compact" role="status">
              <h2>No members found</h2>
              <p>Membership data is not available yet.</p>
            </div>
          </section>

          <section class="group-detail-view__panel group-detail-view__panel--catalog" aria-label="Group catalog">
            <div class="group-detail-view__catalog-header">
              <div>
                <h2>Catalog</h2>
                <p>{{ catalogCountLabel }}</p>
              </div>
            </div>

            <div v-if="isCatalogLoading" class="group-detail-view__loading group-detail-view__loading--inline">
              <span class="group-detail-view__spinner" aria-hidden="true"></span>
              <span>Loading catalog...</span>
            </div>

            <div v-else-if="catalog.length" class="group-detail-view__catalog-list">
              <article
                v-for="entry in catalog"
                :key="entry.id"
                class="group-detail-view__entry"
                :class="{ 'group-detail-view__entry--hidden': !entry.isVisible }"
              >
                <div class="group-detail-view__entry-main">
                  <div>
                    <div class="group-detail-view__entry-badges">
                      <span
                        class="group-detail-view__book-status"
                        :class="`group-detail-view__book-status--${getEntryStatus(entry)}`"
                      >
                        {{ formatStatus(getEntryStatus(entry)) }}
                      </span>
                      <span v-if="!entry.isVisible" class="group-detail-view__hidden-badge">Hidden</span>
                    </div>
                    <h3>
                      <RouterLink
                        class="group-detail-view__book-link"
                        :to="{ name: RouteName.BookDetail, params: { id: entry.bookId } }"
                      >
                        {{ getEntryTitle(entry) }}
                      </RouterLink>
                    </h3>
                    <p>{{ getEntryAuthor(entry) }}</p>
                  </div>

                  <div class="group-detail-view__entry-actions">
                    <BaseButton
                      :label="entry.isVisible ? 'Hide' : 'Show'"
                      :disabled="updatingEntryId === entry.id"
                      :is-loading="updatingEntryId === entry.id"
                      :variant="BaseButtonVariant.Secondary"
                      @click="toggleEntryVisibility(entry)"
                    />
                    <BaseButton
                      label="Remove"
                      :disabled="updatingEntryId === entry.id"
                      :variant="BaseButtonVariant.Secondary"
                      @click="handleRemoveEntry(entry)"
                    />
                  </div>
                </div>

                <p v-if="getEntryMeta(entry).description" class="group-detail-view__entry-description">
                  {{ getEntryMeta(entry).description }}
                </p>

                <dl class="group-detail-view__meta">
                  <div v-if="getEntryMeta(entry).owner">
                    <dt>Owner</dt>
                    <dd>{{ getEntryMeta(entry).owner }}</dd>
                  </div>
                  <div v-if="getEntryMeta(entry).genre">
                    <dt>Genre</dt>
                    <dd>{{ getEntryMeta(entry).genre }}</dd>
                  </div>
                  <div v-if="getEntryMeta(entry).language">
                    <dt>Language</dt>
                    <dd>{{ getEntryMeta(entry).language }}</dd>
                  </div>
                  <div v-if="getEntryMeta(entry).condition">
                    <dt>Condition</dt>
                    <dd>{{ getEntryMeta(entry).condition }}</dd>
                  </div>
                </dl>

                <section class="group-detail-view__requests" aria-label="Borrow requests">
                  <div class="group-detail-view__requests-header">
                    <h4>Queue</h4>
                    <span>{{ getEntryRequests(entry).length }}</span>
                  </div>

                  <form
                    v-if="canRequestEntry(entry)"
                    class="group-detail-view__request-form"
                    novalidate
                    @submit.prevent="createBorrowRequest(entry)"
                  >
                    <label class="group-detail-view__field">
                      <span>Message</span>
                      <textarea
                        v-model="requestMessages[entry.id]"
                        maxlength="1000"
                        name="message"
                        placeholder="Optional note for the owner"
                        rows="3"
                      ></textarea>
                    </label>
                    <BaseButton
                      label="Request book"
                      :disabled="requestingEntryId === entry.id"
                      :is-loading="requestingEntryId === entry.id"
                      :type="BaseButtonHtmlType.Submit"
                    />
                  </form>

                  <div v-if="getEntryRequests(entry).length" class="group-detail-view__request-list">
                    <article
                      v-for="request in getEntryRequests(entry)"
                      :key="request.id"
                      class="group-detail-view__request"
                    >
                      <div class="group-detail-view__request-main">
                        <div>
                          <p class="group-detail-view__request-title">
                            {{ request.requesterUsername }}
                            <span v-if="request.queuePosition">#{{ request.queuePosition }}</span>
                          </p>
                          <p class="group-detail-view__request-meta">
                            {{ formatRole(request.status) }} - {{ formatRequestDate(request.requestedAt) }}
                          </p>
                        </div>

                        <BaseButton
                          v-if="canCancelRequest(request)"
                          label="Cancel"
                          :disabled="updatingRequestId === request.id"
                          :is-loading="updatingRequestId === request.id"
                          :variant="BaseButtonVariant.Secondary"
                          @click="handleCancelRequest(request)"
                        />
                      </div>

                      <p v-if="request.message" class="group-detail-view__request-message">{{ request.message }}</p>

                      <form
                        v-if="canResolveRequest(request)"
                        class="group-detail-view__approval-form"
                        novalidate
                        @submit.prevent="approveBorrowRequest(request)"
                      >
                        <label class="group-detail-view__field">
                          <span>Due at</span>
                          <input v-model="approvalForms[request.id].dueAt" name="dueAt" type="datetime-local" />
                        </label>
                        <label class="group-detail-view__field">
                          <span>Notes</span>
                          <input v-model="approvalForms[request.id].notes" name="notes" placeholder="Optional" />
                        </label>
                        <div class="group-detail-view__approval-actions">
                          <BaseButton
                            label="Approve"
                            :disabled="updatingRequestId === request.id"
                            :is-loading="updatingRequestId === request.id"
                            :type="BaseButtonHtmlType.Submit"
                          />
                          <BaseButton
                            label="Reject"
                            :disabled="updatingRequestId === request.id"
                            :variant="BaseButtonVariant.Secondary"
                            @click="handleRejectRequest(request)"
                          />
                        </div>
                      </form>
                    </article>
                  </div>

                  <p v-else class="group-detail-view__note">No requests yet.</p>
                </section>

                <section v-if="getEntryActiveLoan(entry)" class="group-detail-view__loan" aria-label="Active loan">
                  <div>
                    <h4>Active loan</h4>
                    <p>
                      {{ getEntryActiveLoan(entry)?.borrowerUsername }} - due
                      {{ formatDueDate(getEntryActiveLoan(entry)?.dueAt ?? '') }}
                    </p>
                  </div>

                  <form
                    v-if="canReturnLoan(entry)"
                    class="group-detail-view__return-form"
                    novalidate
                    @submit.prevent="getEntryActiveLoan(entry) && returnLoan(getEntryActiveLoan(entry)!)"
                  >
                    <label class="group-detail-view__field">
                      <span>Return notes</span>
                      <textarea
                        v-model="returnForms[getEntryActiveLoan(entry)!.id]"
                        maxlength="1000"
                        name="returnNotes"
                        placeholder="Optional condition or handoff note"
                        rows="3"
                      ></textarea>
                    </label>
                    <BaseButton
                      label="Return book"
                      :disabled="returningLoanId === getEntryActiveLoan(entry)?.id"
                      :is-loading="returningLoanId === getEntryActiveLoan(entry)?.id"
                      :type="BaseButtonHtmlType.Submit"
                    />
                  </form>
                </section>

                <section
                  v-if="canReviewReturnedLoan(entry) && getEntryReturnedLoan(entry)"
                  class="group-detail-view__review-form-section"
                  aria-label="Review book"
                >
                  <h4>Review this book</h4>
                  <form
                    class="group-detail-view__review-form"
                    novalidate
                    @submit.prevent="getEntryReturnedLoan(entry) && createReview(getEntryReturnedLoan(entry)!)"
                  >
                    <label class="group-detail-view__field">
                      <span>Rating</span>
                      <select v-model="reviewForms[getEntryReturnedLoan(entry)!.id].rating" name="rating">
                        <option value="5">5</option>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="2">2</option>
                        <option value="1">1</option>
                      </select>
                    </label>
                    <label class="group-detail-view__field">
                      <span>Comment</span>
                      <textarea
                        v-model="reviewForms[getEntryReturnedLoan(entry)!.id].comment"
                        maxlength="2000"
                        name="comment"
                        placeholder="Optional review"
                        rows="3"
                      ></textarea>
                    </label>
                    <BaseButton
                      label="Publish review"
                      :disabled="reviewingLoanId === getEntryReturnedLoan(entry)?.id"
                      :is-loading="reviewingLoanId === getEntryReturnedLoan(entry)?.id"
                      :type="BaseButtonHtmlType.Submit"
                    />
                  </form>
                </section>

                <section class="group-detail-view__reviews" aria-label="Book reviews">
                  <div class="group-detail-view__requests-header">
                    <h4>Reviews</h4>
                    <span>{{ getEntryReviews(entry).length }}</span>
                  </div>

                  <div v-if="getEntryReviews(entry).length" class="group-detail-view__review-list">
                    <article v-for="review in getEntryReviews(entry)" :key="review.id" class="group-detail-view__review">
                      <p class="group-detail-view__review-title">
                        {{ review.authorUsername }} - {{ review.rating }}/5
                      </p>
                      <p v-if="review.comment" class="group-detail-view__review-comment">{{ review.comment }}</p>
                    </article>
                  </div>

                  <p v-else class="group-detail-view__note">No reviews yet.</p>
                </section>
              </article>
            </div>

            <div v-else class="group-detail-view__empty" role="status">
              <h2>Catalog is empty</h2>
              <p>Add a book from your collection to start this group shelf.</p>
            </div>
          </section>
        </section>
      </template>

      <div v-else class="group-detail-view__empty" role="status">
        <h2>Group is unavailable</h2>
        <p>We could not load this group right now.</p>
      </div>
    </section>
  </main>
</template>
