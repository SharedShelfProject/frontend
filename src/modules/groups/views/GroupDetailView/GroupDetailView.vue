<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import { GROUPS_ROUTE_PATH } from '@/constants/routes.constants';
import { RouteName } from '@/enums/route-name.enum';
import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { currentLocale, t } from '@/services/localization.service';
import { BorrowRequest } from '../../interfaces/borrow-request.interface';
import { CatalogEntry } from '../../interfaces/catalog-entry.interface';
import { Membership } from '../../interfaces/membership.interface';
import { useGroupDetailView } from '../../composables/useGroupDetailView';
import { groupsRepository } from '../../repositories/groups.repository';
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
  currentMembership,
  canManageMembers,
  canTransferOwnership,
  activeTransferCandidates,
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

const isEditingGroupDetails = ref(false);
const isUpdatingGroupDetails = ref(false);
const groupDetailsError = ref('');
const groupDetailsStatus = ref('');
const groupDetailsForm = ref({
  name: '',
  description: '',
  visibility: 'private' as 'open' | 'private',
});

const catalogCountLabel = computed(() => {
  const count = catalog.value.length;

  return `${count} ${count === 1 ? t('groupDetail.book') : t('groupDetail.books')}`;
});

const selectedBookToAdd = computed(() =>
  availableBooksToAdd.value.find((book) => book.id === selectedBookId.value) ?? null,
);

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
  return t(`status.${status}` as Parameters<typeof t>[0]);
}

function formatRole(role: string) {
  return t(`role.${role}` as Parameters<typeof t>[0]);
}

function formatVisibility() {
  return group.value?.visibility === 'open' ? t('groups.open') : t('groups.private');
}

const isCurrentGroupOwner = computed(() => Boolean(
  currentMembership.value?.role === 'owner',
));
const canEditCurrentGroup = computed(() => isCurrentGroupOwner.value);
const canLeaveCurrentGroup = computed(() => Boolean(
  group.value &&
  currentUser.value &&
  (!isCurrentGroupOwner.value || members.value.filter((member) => member.status === 'active').length <= 1),
));

function startEditingGroupDetails() {
  if (!group.value) {
    return;
  }

  groupDetailsError.value = '';
  groupDetailsStatus.value = '';
  isEditingGroupDetails.value = true;
  groupDetailsForm.value = {
    name: group.value.name,
    description: group.value.description ?? '',
    visibility: group.value.visibility,
  };
}

function cancelEditingGroupDetails() {
  isEditingGroupDetails.value = false;
  groupDetailsError.value = '';
  groupDetailsStatus.value = '';
}

async function updateGroupDetails() {
  if (!group.value || !groupDetailsForm.value.name.trim()) {
    return;
  }

  isUpdatingGroupDetails.value = true;
  groupDetailsError.value = '';
  groupDetailsStatus.value = '';

  try {
    const updatedGroup = await groupsRepository.update(group.value.id, {
      name: groupDetailsForm.value.name.trim(),
      description: groupDetailsForm.value.description.trim(),
      visibility: groupDetailsForm.value.visibility,
    });

    group.value = updatedGroup;
    groupDetailsStatus.value = t('groups.updated').replace('{name}', updatedGroup.name);
    isEditingGroupDetails.value = false;
  } catch (error) {
    groupDetailsError.value = error instanceof Error ? error.message : t('groups.updateError');
  } finally {
    isUpdatingGroupDetails.value = false;
  }
}

async function handleLeaveGroup() {
  if (!group.value || !window.confirm(t('groups.leaveConfirm').replace('{name}', group.value.name))) {
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
  if (window.confirm(t('groupDetail.removeBookConfirm').replace('{title}', getEntryTitle(entry)))) {
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

function canResolveRequest(request: BorrowRequest, entry: CatalogEntry) {
  return Boolean(
    currentUser.value &&
    getEntryOwnerId(entry) === currentUser.value.id &&
    request.requesterId !== currentUser.value.id &&
    request.status === 'pending',
  );
}

function formatRequestDate(value: string) {
  return new Intl.DateTimeFormat(currentLocale.value === 'uk' ? 'uk-UA' : 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function canReturnLoan(entry: CatalogEntry) {
  const loan = getEntryActiveLoan(entry);

  return Boolean(loan && currentUser.value?.id === loan.borrowerId);
}

function isCurrentUserLoanOwner(entry: CatalogEntry) {
  const loan = getEntryActiveLoan(entry);

  return Boolean(loan && currentUser.value?.id === loan.ownerId);
}

function canReviewReturnedLoan(entry: CatalogEntry) {
  const loan = getEntryReturnedLoan(entry);

  return Boolean(loan && currentUser.value?.id === loan.borrowerId);
}

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat(currentLocale.value === 'uk' ? 'uk-UA' : 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function handleRejectRequest(request: BorrowRequest) {
  if (window.confirm(t('groupDetail.rejectRequestConfirm').replace('{username}', request.requesterUsername))) {
    void rejectBorrowRequest(request);
  }
}

function handleCancelRequest(request: BorrowRequest) {
  if (window.confirm(t('groupDetail.cancelRequestConfirm'))) {
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
  if (window.confirm(t('groupDetail.removeMemberConfirm').replace('{username}', member.username))) {
    void removeMember(member);
  }
}

function handleBlockMember(member: Membership) {
  if (window.confirm(t('groupDetail.blockMemberConfirm').replace('{username}', member.username))) {
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

  if (window.confirm(t('groupDetail.transferConfirm').replace('{username}', member.username))) {
    void transferOwnership(newOwnerId);
  } else {
    select.value = '';
  }
}
</script>

<template>
  <main class="group-detail-view">
    <section class="group-detail-view__shell">
      <RouterLink class="group-detail-view__back-link" :to="GROUPS_ROUTE_PATH">{{ t('groupDetail.back') }}</RouterLink>

      <div v-if="isLoading" class="group-detail-view__loading" aria-live="polite">
        <span class="group-detail-view__spinner" aria-hidden="true"></span>
        <span>{{ t('groupDetail.loadingGroup') }}</span>
      </div>

      <template v-else-if="group">
        <section class="group-detail-view__hero" :aria-label="t('groupDetail.details')">
          <div>
            <p class="group-detail-view__eyebrow">{{ t('groupDetail.catalogEyebrow') }}</p>
            <h1 class="group-detail-view__title">{{ group.name }}</h1>
            <p v-if="group.description" class="group-detail-view__description">{{ group.description }}</p>
          </div>

          <div class="group-detail-view__hero-actions">
            <span class="group-detail-view__badge" :class="`group-detail-view__badge--${group.visibility}`">
              {{ formatVisibility() }}
            </span>
            <BaseButton
              v-if="canEditCurrentGroup"
              :label="t('groups.editGroup')"
              :variant="BaseButtonVariant.Secondary"
              @click="startEditingGroupDetails"
            />
            <BaseButton
              v-if="canLeaveCurrentGroup"
              :label="t('groups.leave')"
              :is-loading="isLeaving"
              :variant="BaseButtonVariant.Secondary"
              @click="handleLeaveGroup"
            />
          </div>
        </section>

        <BaseError :message="errorMessage" />
        <BaseError :message="groupDetailsError" />
        <p v-if="statusMessage" class="group-detail-view__success" role="status">{{ statusMessage }}</p>
        <p v-if="groupDetailsStatus" class="group-detail-view__success" role="status">{{ groupDetailsStatus }}</p>

        <section
          v-if="isEditingGroupDetails"
          class="group-detail-view__panel group-detail-view__edit-panel"
          :aria-label="t('groupDetail.editDetails')"
        >
          <div class="group-detail-view__panel-header">
            <div>
              <h2>{{ t('groups.editGroup') }}</h2>
              <p>{{ t('groupDetail.ownerEditHint') }}</p>
            </div>
          </div>

          <form class="group-detail-view__edit-form" novalidate @submit.prevent="updateGroupDetails">
            <label class="group-detail-view__field">
              <span>{{ t('groups.name') }}</span>
              <input v-model="groupDetailsForm.name" name="groupName" maxlength="150" />
            </label>

            <label class="group-detail-view__field">
              <span>{{ t('groups.description') }}</span>
              <textarea v-model="groupDetailsForm.description" maxlength="1000" name="groupDescription" rows="4"></textarea>
            </label>

            <label class="group-detail-view__field">
              <span>{{ t('groups.visibility') }}</span>
              <select v-model="groupDetailsForm.visibility" name="groupVisibility">
                <option value="private">{{ t('groups.private') }}</option>
                <option value="open">{{ t('groups.open') }}</option>
              </select>
            </label>

            <div class="group-detail-view__edit-actions">
              <BaseButton
                :label="t('groups.save')"
                :disabled="!groupDetailsForm.name.trim()"
                :is-loading="isUpdatingGroupDetails"
                :type="BaseButtonHtmlType.Submit"
              />
              <BaseButton
                :label="t('groups.cancelEdit')"
                :disabled="isUpdatingGroupDetails"
                :variant="BaseButtonVariant.Secondary"
                @click="cancelEditingGroupDetails"
              />
            </div>
          </form>
        </section>

        <section v-if="group.inviteCode" class="group-detail-view__invite" :aria-label="t('groups.inviteCode')">
          <span>{{ t('groups.inviteCode') }}</span>
          <strong>{{ group.inviteCode }}</strong>
        </section>

        <section class="group-detail-view__layout">
          <section class="group-detail-view__panel" :aria-label="t('groupDetail.addBook')">
            <div class="group-detail-view__panel-header">
              <div>
                <h2>{{ t('groupDetail.addBook') }}</h2>
                <p>{{ t('groupDetail.addBookText') }}</p>
              </div>
            </div>

            <form class="group-detail-view__add-form" novalidate @submit.prevent="addSelectedBook">
              <label class="group-detail-view__field">
                <span>{{ t('groupDetail.bookLabel') }}</span>
                <select v-model="selectedBookId" name="bookId">
                  <option value="">{{ t('groupDetail.selectBook') }}</option>
                  <option v-for="book in availableBooksToAdd" :key="book.id" :value="book.id">
                    {{ book.title }} - {{ book.author }}
                  </option>
                </select>
              </label>

              <div v-if="selectedBookToAdd" class="group-detail-view__selected-book" aria-live="polite">
                <span aria-hidden="true">{{ selectedBookToAdd.title.at(0)?.toUpperCase() }}</span>
                <div>
                  <strong>{{ selectedBookToAdd.title }}</strong>
                  <p>{{ selectedBookToAdd.author }}</p>
                </div>
              </div>

              <BaseButton
                :label="t('groupDetail.addToCatalog')"
                :disabled="!selectedBookId"
                :is-loading="isAddingBook"
                :type="BaseButtonHtmlType.Submit"
              />
            </form>

            <p v-if="!availableBooksToAdd.length" class="group-detail-view__note">
              {{ t('groupDetail.noBooksToAdd') }}
            </p>
          </section>

          <section class="group-detail-view__panel" :aria-label="t('groupDetail.members')">
            <div class="group-detail-view__panel-header">
              <div>
                <h2>{{ t('groupDetail.members') }}</h2>
                <p>{{ members.length }} {{ members.length === 1 ? t('groupDetail.member') : t('groupDetail.membersCount') }}</p>
              </div>
            </div>

            <label v-if="canTransferOwnership && activeTransferCandidates.length" class="group-detail-view__field">
              <span>{{ t('groupDetail.transferOwnership') }}</span>
              <select name="newOwnerId" :disabled="Boolean(updatingMemberId)" @change="handleTransferOwnership">
                <option value="">{{ t('groupDetail.selectMember') }}</option>
                <option v-for="member in activeTransferCandidates" :key="member.userId" :value="member.userId">
                  {{ member.username }}
                </option>
              </select>
            </label>

            <div v-if="isMembersLoading" class="group-detail-view__loading group-detail-view__loading--inline">
              <span class="group-detail-view__spinner" aria-hidden="true"></span>
              <span>{{ t('groupDetail.loadingMembers') }}</span>
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
                    :aria-label="t('groupDetail.changeMemberRole')"
                    @change="updateMemberRole(member, ($event.target as HTMLSelectElement).value as 'admin' | 'member')"
                  >
                    <option value="member">{{ t('role.member') }}</option>
                    <option value="admin">{{ t('role.admin') }}</option>
                  </select>

                  <BaseButton
                    v-if="canBlockMember(member)"
                    :label="t('groupDetail.block')"
                    :disabled="updatingMemberId === member.userId"
                    :is-loading="updatingMemberId === member.userId"
                    :variant="BaseButtonVariant.Secondary"
                    @click="handleBlockMember(member)"
                  />

                  <BaseButton
                    v-else-if="member.status === 'blocked'"
                    :label="t('groupDetail.unblock')"
                    :disabled="updatingMemberId === member.userId"
                    :is-loading="updatingMemberId === member.userId"
                    :variant="BaseButtonVariant.Secondary"
                    @click="unblockMember(member)"
                  />

                  <BaseButton
                    v-if="canRemoveMember(member)"
                    :label="t('groupDetail.remove')"
                    :disabled="updatingMemberId === member.userId"
                    :variant="BaseButtonVariant.Secondary"
                    @click="handleRemoveMember(member)"
                  />
                </div>
              </article>
            </div>

            <div v-else class="group-detail-view__empty group-detail-view__empty--compact" role="status">
              <h2>{{ t('groupDetail.noMembers') }}</h2>
              <p>{{ t('groupDetail.noMembersText') }}</p>
            </div>
          </section>

          <section class="group-detail-view__panel group-detail-view__panel--catalog" :aria-label="t('groupDetail.catalog')">
            <div class="group-detail-view__catalog-header">
              <div>
                <h2>{{ t('groupDetail.catalog') }}</h2>
                <p>{{ catalogCountLabel }}</p>
              </div>
            </div>

            <div v-if="isCatalogLoading" class="group-detail-view__loading group-detail-view__loading--inline">
              <span class="group-detail-view__spinner" aria-hidden="true"></span>
              <span>{{ t('groupDetail.loadingCatalog') }}</span>
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
                      <span v-if="!entry.isVisible" class="group-detail-view__hidden-badge">{{ t('groupDetail.hidden') }}</span>
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
                      :label="entry.isVisible ? t('groupDetail.hide') : t('groupDetail.show')"
                      :disabled="updatingEntryId === entry.id"
                      :is-loading="updatingEntryId === entry.id"
                      :variant="BaseButtonVariant.Secondary"
                      @click="toggleEntryVisibility(entry)"
                    />
                    <BaseButton
                      :label="t('groupDetail.remove')"
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
                    <dt>{{ t('groupDetail.owner') }}</dt>
                    <dd>{{ getEntryMeta(entry).owner }}</dd>
                  </div>
                  <div v-if="getEntryMeta(entry).genre">
                    <dt>{{ t('books.genre') }}</dt>
                    <dd>{{ getEntryMeta(entry).genre }}</dd>
                  </div>
                  <div v-if="getEntryMeta(entry).language">
                    <dt>{{ t('books.language') }}</dt>
                    <dd>{{ getEntryMeta(entry).language }}</dd>
                  </div>
                  <div v-if="getEntryMeta(entry).condition">
                    <dt>{{ t('books.condition') }}</dt>
                    <dd>{{ getEntryMeta(entry).condition }}</dd>
                  </div>
                </dl>

                <section class="group-detail-view__requests" :aria-label="t('groupDetail.borrowRequests')">
                  <div class="group-detail-view__requests-header">
                    <h4>{{ t('groupDetail.queue') }}</h4>
                    <span>{{ getEntryRequests(entry).length }}</span>
                  </div>

                  <form
                    v-if="canRequestEntry(entry)"
                    class="group-detail-view__request-form"
                    novalidate
                    @submit.prevent="createBorrowRequest(entry)"
                  >
                    <label class="group-detail-view__field">
                      <span>{{ t('groupDetail.message') }}</span>
                      <textarea
                        v-model="requestMessages[entry.id]"
                        maxlength="1000"
                        name="message"
                        :placeholder="t('groupDetail.messagePlaceholder')"
                        rows="3"
                      ></textarea>
                    </label>
                    <BaseButton
                      :label="t('groupDetail.requestBook')"
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
                            {{ formatStatus(request.status) }} - {{ formatRequestDate(request.requestedAt) }}
                          </p>
                        </div>

                        <BaseButton
                          v-if="canCancelRequest(request)"
                          :label="t('groupDetail.cancel')"
                          :disabled="updatingRequestId === request.id"
                          :is-loading="updatingRequestId === request.id"
                          :variant="BaseButtonVariant.Secondary"
                          @click="handleCancelRequest(request)"
                        />
                      </div>

                      <p v-if="request.message" class="group-detail-view__request-message">{{ request.message }}</p>

                      <form
                        v-if="canResolveRequest(request, entry)"
                        class="group-detail-view__approval-form"
                        novalidate
                        @submit.prevent="approveBorrowRequest(request)"
                      >
                        <label class="group-detail-view__field">
                          <span>{{ t('groupDetail.dueAt') }}</span>
                          <input v-model="approvalForms[request.id].dueAt" name="dueAt" type="datetime-local" />
                        </label>
                        <label class="group-detail-view__field">
                          <span>{{ t('groupDetail.notes') }}</span>
                          <input v-model="approvalForms[request.id].notes" name="notes" :placeholder="t('groupDetail.optional')" />
                        </label>
                        <div class="group-detail-view__approval-actions">
                          <BaseButton
                            :label="t('groupDetail.approve')"
                            :disabled="updatingRequestId === request.id"
                            :is-loading="updatingRequestId === request.id"
                            :type="BaseButtonHtmlType.Submit"
                          />
                          <BaseButton
                            :label="t('groupDetail.reject')"
                            :disabled="updatingRequestId === request.id"
                            :variant="BaseButtonVariant.Secondary"
                            @click="handleRejectRequest(request)"
                          />
                        </div>
                      </form>
                    </article>
                  </div>

                  <p v-else class="group-detail-view__note">{{ t('groupDetail.noRequests') }}</p>
                </section>

                <section v-if="getEntryActiveLoan(entry)" class="group-detail-view__loan" :aria-label="t('groupDetail.activeLoan')">
                  <div>
                    <h4>{{ t('groupDetail.activeLoan') }}</h4>
                    <p>
                      {{ t('groupDetail.borrowedBy') }} {{ getEntryActiveLoan(entry)?.borrowerUsername }} -
                      {{ t('groupDetail.due') }} {{ formatDueDate(getEntryActiveLoan(entry)?.dueAt ?? '') }}
                    </p>
                    <p v-if="isCurrentUserLoanOwner(entry)" class="group-detail-view__loan-hint">
                      {{ t('groupDetail.ownerLoanHint') }}
                    </p>
                    <p v-else-if="canReturnLoan(entry)" class="group-detail-view__loan-hint">
                      {{ t('groupDetail.borrowerLoanHint') }}
                    </p>
                  </div>

                  <form
                    v-if="canReturnLoan(entry)"
                    class="group-detail-view__return-form"
                    novalidate
                    @submit.prevent="getEntryActiveLoan(entry) && returnLoan(getEntryActiveLoan(entry)!)"
                  >
                    <label class="group-detail-view__field">
                      <span>{{ t('groupDetail.returnNotes') }}</span>
                      <textarea
                        v-model="returnForms[getEntryActiveLoan(entry)!.id]"
                        maxlength="1000"
                        name="returnNotes"
                        :placeholder="t('groupDetail.returnPlaceholder')"
                        rows="3"
                      ></textarea>
                    </label>
                    <BaseButton
                      :label="t('groupDetail.returnBook')"
                      :disabled="returningLoanId === getEntryActiveLoan(entry)?.id"
                      :is-loading="returningLoanId === getEntryActiveLoan(entry)?.id"
                      :type="BaseButtonHtmlType.Submit"
                    />
                  </form>
                </section>

                <section
                  v-if="canReviewReturnedLoan(entry) && getEntryReturnedLoan(entry)"
                  class="group-detail-view__review-form-section"
                  :aria-label="t('groupDetail.reviewThisBook')"
                >
                  <h4>{{ t('groupDetail.reviewThisBook') }}</h4>
                  <form
                    class="group-detail-view__review-form"
                    novalidate
                    @submit.prevent="getEntryReturnedLoan(entry) && createReview(getEntryReturnedLoan(entry)!)"
                  >
                    <label class="group-detail-view__field">
                      <span>{{ t('groupDetail.rating') }}</span>
                      <select v-model="reviewForms[getEntryReturnedLoan(entry)!.id].rating" name="rating">
                        <option value="5">5</option>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="2">2</option>
                        <option value="1">1</option>
                      </select>
                    </label>
                    <label class="group-detail-view__field">
                      <span>{{ t('groupDetail.comment') }}</span>
                      <textarea
                        v-model="reviewForms[getEntryReturnedLoan(entry)!.id].comment"
                        maxlength="2000"
                        name="comment"
                        :placeholder="t('groupDetail.reviewPlaceholder')"
                        rows="3"
                      ></textarea>
                    </label>
                    <BaseButton
                      :label="t('groupDetail.publishReview')"
                      :disabled="reviewingLoanId === getEntryReturnedLoan(entry)?.id"
                      :is-loading="reviewingLoanId === getEntryReturnedLoan(entry)?.id"
                      :type="BaseButtonHtmlType.Submit"
                    />
                  </form>
                </section>

                <section class="group-detail-view__reviews" :aria-label="t('groupDetail.reviews')">
                  <div class="group-detail-view__requests-header">
                    <h4>{{ t('groupDetail.reviews') }}</h4>
                    <span>{{ getEntryReviews(entry).length }}</span>
                  </div>

                  <div v-if="getEntryReviews(entry).length" class="group-detail-view__review-list">
                    <article v-for="review in getEntryReviews(entry)" :key="review.id" class="group-detail-view__review">
                      <p class="group-detail-view__review-title">
                        {{ review.authorUsername }} - {{ review.rating }}/5
                      </p>
                      <p v-if="review.comment" class="group-detail-view__review-comment">{{ review.comment }}</p>
                      <p v-if="review.returnNotes" class="group-detail-view__review-condition">
                        <strong>{{ t('groupDetail.returnCondition') }}:</strong>
                        {{ review.returnNotes }}
                      </p>
                    </article>
                  </div>

                  <p v-else class="group-detail-view__note">{{ t('groupDetail.noReviews') }}</p>
                </section>
              </article>
            </div>

            <div v-else class="group-detail-view__empty" role="status">
              <h2>{{ t('groupDetail.emptyCatalog') }}</h2>
              <p>{{ t('groupDetail.emptyCatalogText') }}</p>
            </div>
          </section>
        </section>
      </template>

      <div v-else class="group-detail-view__empty" role="status">
        <h2>{{ t('groupDetail.unavailable') }}</h2>
        <p>{{ t('groupDetail.unavailableText') }}</p>
      </div>
    </section>
  </main>
</template>
