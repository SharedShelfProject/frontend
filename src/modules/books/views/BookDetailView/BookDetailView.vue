<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import { MY_BOOKS_ROUTE_PATH } from '@/constants/routes.constants';
import { currentLocale, t } from '@/services/localization.service';
import { useBookDetailView } from '../../composables/useBookDetailView';
import { formatBookLanguage } from '../../services/book-language.service';
import { getBookCoverUrl } from '../../services/book-cover.service';
import './BookDetailView.css';

const route = useRoute();
const bookId = String(route.params.id);
const { book, reviews, isLoading, errorMessage, fetchBookPage } = useBookDetailView(bookId);

const reviewCountLabel = computed(() => {
  const count = reviews.value.length;

  return `${count} ${count === 1 ? t('bookDetail.reviewOne') : t('bookDetail.reviewMany')}`;
});

onMounted(fetchBookPage);

function formatStatus(status: string) {
  return t(`status.${status}` as Parameters<typeof t>[0]);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(currentLocale.value === 'uk' ? 'uk-UA' : 'en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}
</script>

<template>
  <main class="book-detail-view">
    <section class="book-detail-view__shell">
      <RouterLink class="book-detail-view__back-link" :to="MY_BOOKS_ROUTE_PATH">{{ t('bookDetail.back') }}</RouterLink>

      <div v-if="isLoading" class="book-detail-view__loading" aria-live="polite">
        <span class="book-detail-view__spinner" aria-hidden="true"></span>
        <span>{{ t('bookDetail.loading') }}</span>
      </div>

      <template v-else-if="book">
        <BaseError :message="errorMessage" />

        <section class="book-detail-view__hero" :aria-label="t('bookDetail.details')">
          <div class="book-detail-view__cover" aria-hidden="true">
            <img v-if="getBookCoverUrl(book)" :src="getBookCoverUrl(book)" alt="" />
            <span v-else>{{ book.title.at(0)?.toUpperCase() }}</span>
          </div>
          <div>
            <p class="book-detail-view__eyebrow">{{ t('bookDetail.details') }}</p>
            <h1 class="book-detail-view__title">{{ book.title }}</h1>
            <p class="book-detail-view__author">{{ book.author }}</p>
          </div>
          <span class="book-detail-view__status" :class="`book-detail-view__status--${book.status}`">
            {{ formatStatus(book.status) }}
          </span>
        </section>

        <section class="book-detail-view__layout">
          <section class="book-detail-view__panel" :aria-label="t('bookDetail.aboutLabel')">
            <h2>{{ t('bookDetail.about') }}</h2>
            <p v-if="book.description" class="book-detail-view__description">{{ book.description }}</p>
            <p v-else class="book-detail-view__description">{{ t('bookDetail.noDescription') }}</p>

            <dl class="book-detail-view__meta">
              <div v-if="book.ownerUsername">
                <dt>{{ t('bookDetail.owner') }}</dt>
                <dd>{{ book.ownerUsername }}</dd>
              </div>
              <div v-if="book.genre">
                <dt>{{ t('books.genre') }}</dt>
                <dd>{{ book.genre }}</dd>
              </div>
              <div v-if="book.language">
                <dt>{{ t('books.language') }}</dt>
                <dd>{{ formatBookLanguage(book.language) }}</dd>
              </div>
              <div v-if="book.publicationYear">
                <dt>{{ t('books.year') }}</dt>
                <dd>{{ book.publicationYear }}</dd>
              </div>
              <div v-if="book.condition">
                <dt>{{ t('books.condition') }}</dt>
                <dd>{{ book.condition }}</dd>
              </div>
              <div v-if="book.isbn">
                <dt>ISBN</dt>
                <dd>{{ book.isbn }}</dd>
              </div>
              <div>
                <dt>{{ t('books.added') }}</dt>
                <dd>{{ formatDate(book.createdAt) }}</dd>
              </div>
            </dl>
          </section>

          <section class="book-detail-view__panel" :aria-label="t('bookDetail.reviewsLabel')">
            <div class="book-detail-view__reviews-header">
              <h2>{{ t('bookDetail.reviews') }}</h2>
              <span>{{ reviewCountLabel }}</span>
            </div>

            <div v-if="reviews.length" class="book-detail-view__reviews">
              <article v-for="review in reviews" :key="review.id" class="book-detail-view__review">
                <div class="book-detail-view__review-main">
                  <h3>{{ review.authorUsername }}</h3>
                  <span>{{ review.rating }}/5</span>
                </div>
                <p v-if="review.comment">{{ review.comment }}</p>
                <p v-if="review.returnNotes" class="book-detail-view__review-condition">
                  <strong>{{ t('groupDetail.returnCondition') }}:</strong>
                  {{ review.returnNotes }}
                </p>
                <time :datetime="review.createdAt">{{ formatDate(review.createdAt) }}</time>
              </article>
            </div>

            <div v-else class="book-detail-view__empty" role="status">
              <h3>{{ t('bookDetail.noReviews') }}</h3>
              <p>{{ t('bookDetail.noReviewsText') }}</p>
            </div>
          </section>
        </section>
      </template>

      <div v-else class="book-detail-view__empty" role="status">
        <h2>{{ t('bookDetail.unavailableTitle') }}</h2>
        <p>{{ t('bookDetail.unavailableText') }}</p>
      </div>
    </section>
  </main>
</template>
