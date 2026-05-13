<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { RouteName } from '@/enums/route-name.enum';
import { t, currentLocale } from '@/services/localization.service';
import { Loan } from '@/modules/groups/interfaces/loan.interface';
import { bookReviewsRepository } from '@/modules/groups/repositories/book-reviews.repository';
import { loansRepository } from '@/modules/groups/repositories/loans.repository';
import './MyLoansView.css';

const loans = ref<Loan[]>([]);
const returnedLoans = ref<Loan[]>([]);
const returnNotes = ref<Record<string, string>>({});
const reviewForms = ref<Record<string, { rating: string; comment: string }>>({});
const returningLoanId = ref<string | null>(null);
const reviewingLoanId = ref<string | null>(null);
const isLoading = ref(false);
const errorMessage = ref('');
const statusMessage = ref('');

const activeLoansCount = computed(() => loans.value.length);
const hasAnyLoans = computed(() => loans.value.length > 0 || returnedLoans.value.length > 0);

function formatDate(value: string) {
  return new Intl.DateTimeFormat(currentLocale.value === 'uk' ? 'uk-UA' : 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatStatus(status: string) {
  return t(`status.${status}` as Parameters<typeof t>[0]);
}

async function fetchLoans() {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    loans.value = await loansRepository.getMyLoans();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t('loans.loadError');
  } finally {
    isLoading.value = false;
  }
}

async function returnLoan(loan: Loan) {
  returningLoanId.value = loan.id;
  errorMessage.value = '';
  statusMessage.value = '';

  try {
    const response = await loansRepository.returnLoan(loan.id, returnNotes.value[loan.id]);
    loans.value = loans.value.filter((item) => item.id !== loan.id);
    returnedLoans.value = [response.returnedLoan, ...returnedLoans.value];
    reviewForms.value = {
      ...reviewForms.value,
      [loan.id]: {
        rating: '5',
        comment: '',
      },
    };
    returnNotes.value = {
      ...returnNotes.value,
      [loan.id]: '',
    };
    statusMessage.value = t('loans.readyToReview').replace('{title}', loan.bookTitle);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t('loans.returnError');
  } finally {
    returningLoanId.value = null;
  }
}

async function publishReview(loan: Loan) {
  const form = reviewForms.value[loan.id];
  const rating = Number(form?.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errorMessage.value = t('loans.ratingError');
    return;
  }

  reviewingLoanId.value = loan.id;
  errorMessage.value = '';
  statusMessage.value = '';

  try {
    await bookReviewsRepository.create(loan.id, rating, form.comment);
    returnedLoans.value = returnedLoans.value.filter((item) => item.id !== loan.id);
    statusMessage.value = t('loans.reviewPublished').replace('{title}', loan.bookTitle);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t('loans.reviewError');
  } finally {
    reviewingLoanId.value = null;
  }
}

function skipReview(loan: Loan) {
  returnedLoans.value = returnedLoans.value.filter((item) => item.id !== loan.id);
  statusMessage.value = t('loans.returned').replace('{title}', loan.bookTitle);
}

onMounted(fetchLoans);
</script>

<template>
  <main class="my-loans-view">
    <section class="my-loans-view__shell">
      <div class="my-loans-view__header">
        <div>
          <p class="my-loans-view__eyebrow">{{ t('loans.eyebrow') }}</p>
          <h1>{{ t('loans.title') }}</h1>
          <p>{{ t('loans.subtitle') }}</p>
        </div>
        <div class="my-loans-view__summary">
          <span>{{ t('loans.active') }}</span>
          <strong>{{ activeLoansCount }}</strong>
        </div>
      </div>

      <BaseError :message="errorMessage" />
      <p v-if="statusMessage" class="my-loans-view__success" role="status">{{ statusMessage }}</p>

      <div v-if="isLoading" class="my-loans-view__loading" aria-live="polite">
        <span class="my-loans-view__spinner" aria-hidden="true"></span>
        <span>{{ t('loans.loading') }}</span>
      </div>

      <section v-else-if="hasAnyLoans" class="my-loans-view__list" :aria-label="t('loans.title')">
        <article v-for="loan in returnedLoans" :key="`review-${loan.id}`" class="my-loans-view__loan my-loans-view__loan--review">
          <div class="my-loans-view__cover" aria-hidden="true">{{ loan.bookTitle.at(0)?.toUpperCase() }}</div>

          <div class="my-loans-view__content">
            <div class="my-loans-view__loan-header">
              <div>
                <p class="my-loans-view__status my-loans-view__status--returned">{{ t('loans.returnedStatus') }}</p>
                <h2>
                  <RouterLink :to="{ name: RouteName.BookDetail, params: { id: loan.bookId } }">
                    {{ loan.bookTitle }}
                  </RouterLink>
                </h2>
                <p>{{ loan.bookAuthor }}</p>
              </div>
            </div>

            <form class="my-loans-view__review-form" novalidate @submit.prevent="publishReview(loan)">
              <div class="my-loans-view__review-intro">
                <h3>{{ t('loans.reviewTitle') }}</h3>
                <p>{{ t('loans.reviewText') }}</p>
              </div>

              <div v-if="loan.notes" class="my-loans-view__condition-note">
                <span>{{ t('groupDetail.returnCondition') }}</span>
                <p>{{ loan.notes }}</p>
                <small>{{ t('loans.conditionShownWithReview') }}</small>
              </div>

              <label>
                <span>{{ t('loans.rating') }}</span>
                <select v-model="reviewForms[loan.id].rating">
                  <option value="5">5</option>
                  <option value="4">4</option>
                  <option value="3">3</option>
                  <option value="2">2</option>
                  <option value="1">1</option>
                </select>
              </label>

              <label>
                <span>{{ t('loans.comment') }}</span>
                <textarea
                  v-model="reviewForms[loan.id].comment"
                  maxlength="2000"
                  :placeholder="t('loans.reviewPlaceholder')"
                  rows="3"
                ></textarea>
              </label>

              <div class="my-loans-view__review-actions">
                <BaseButton
                  :label="t('loans.publishReview')"
                  :is-loading="reviewingLoanId === loan.id"
                  :type="BaseButtonHtmlType.Submit"
                />
                <BaseButton
                  :label="t('loans.skipReview')"
                  :disabled="reviewingLoanId === loan.id"
                  :variant="BaseButtonVariant.Secondary"
                  @click="skipReview(loan)"
                />
              </div>
            </form>
          </div>
        </article>

        <article v-for="loan in loans" :key="loan.id" class="my-loans-view__loan">
          <div class="my-loans-view__cover" aria-hidden="true">{{ loan.bookTitle.at(0)?.toUpperCase() }}</div>

          <div class="my-loans-view__content">
            <div class="my-loans-view__loan-header">
              <div>
                <p class="my-loans-view__status">{{ formatStatus(loan.status) }}</p>
                <h2>
                  <RouterLink :to="{ name: RouteName.BookDetail, params: { id: loan.bookId } }">
                    {{ loan.bookTitle }}
                  </RouterLink>
                </h2>
                <p>{{ loan.bookAuthor }}</p>
              </div>
              <dl class="my-loans-view__meta">
                <div>
                  <dt>{{ t('loans.owner') }}</dt>
                  <dd>{{ loan.ownerUsername }}</dd>
                </div>
                <div>
                  <dt>{{ t('loans.dueAt') }}</dt>
                  <dd>{{ formatDate(loan.dueAt) }}</dd>
                </div>
              </dl>
            </div>

            <form class="my-loans-view__return-form" novalidate @submit.prevent="returnLoan(loan)">
              <label>
                <span>{{ t('loans.returnNotes') }}</span>
                <textarea
                  v-model="returnNotes[loan.id]"
                  maxlength="1000"
                  :placeholder="t('loans.returnPlaceholder')"
                  rows="3"
                ></textarea>
              </label>
              <BaseButton
                :label="t('loans.returnBook')"
                :is-loading="returningLoanId === loan.id"
                :type="BaseButtonHtmlType.Submit"
              />
            </form>
          </div>
        </article>
      </section>

      <section v-else class="my-loans-view__empty" role="status">
        <h2>{{ t('loans.emptyTitle') }}</h2>
        <p>{{ t('loans.emptyText') }}</p>
      </section>
    </section>
  </main>
</template>
