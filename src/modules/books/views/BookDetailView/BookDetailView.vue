<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import { MY_BOOKS_ROUTE_PATH } from '@/constants/routes.constants';
import { useBookDetailView } from '../../composables/useBookDetailView';
import { getBookCoverUrl } from '../../services/book-cover.service';
import './BookDetailView.css';

const route = useRoute();
const bookId = String(route.params.id);
const { book, reviews, isLoading, errorMessage, fetchBookPage } = useBookDetailView(bookId);

const reviewCountLabel = computed(() => {
  const count = reviews.value.length;

  return `${count} ${count === 1 ? 'review' : 'reviews'}`;
});

onMounted(fetchBookPage);

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}
</script>

<template>
  <main class="book-detail-view">
    <section class="book-detail-view__shell">
      <RouterLink class="book-detail-view__back-link" :to="MY_BOOKS_ROUTE_PATH">Back to my books</RouterLink>

      <div v-if="isLoading" class="book-detail-view__loading" aria-live="polite">
        <span class="book-detail-view__spinner" aria-hidden="true"></span>
        <span>Loading book...</span>
      </div>

      <template v-else-if="book">
        <BaseError :message="errorMessage" />

        <section class="book-detail-view__hero" aria-label="Book details">
          <div class="book-detail-view__cover" aria-hidden="true">
            <img v-if="getBookCoverUrl(book)" :src="getBookCoverUrl(book)" alt="" />
            <span v-else>{{ book.title.at(0)?.toUpperCase() }}</span>
          </div>
          <div>
            <p class="book-detail-view__eyebrow">Book details</p>
            <h1 class="book-detail-view__title">{{ book.title }}</h1>
            <p class="book-detail-view__author">{{ book.author }}</p>
          </div>
          <span class="book-detail-view__status" :class="`book-detail-view__status--${book.status}`">
            {{ formatStatus(book.status) }}
          </span>
        </section>

        <section class="book-detail-view__layout">
          <section class="book-detail-view__panel" aria-label="About book">
            <h2>About</h2>
            <p v-if="book.description" class="book-detail-view__description">{{ book.description }}</p>
            <p v-else class="book-detail-view__description">No description yet.</p>

            <dl class="book-detail-view__meta">
              <div v-if="book.ownerUsername">
                <dt>Owner</dt>
                <dd>{{ book.ownerUsername }}</dd>
              </div>
              <div v-if="book.genre">
                <dt>Genre</dt>
                <dd>{{ book.genre }}</dd>
              </div>
              <div v-if="book.language">
                <dt>Language</dt>
                <dd>{{ book.language }}</dd>
              </div>
              <div v-if="book.publicationYear">
                <dt>Year</dt>
                <dd>{{ book.publicationYear }}</dd>
              </div>
              <div v-if="book.condition">
                <dt>Condition</dt>
                <dd>{{ book.condition }}</dd>
              </div>
              <div v-if="book.isbn">
                <dt>ISBN</dt>
                <dd>{{ book.isbn }}</dd>
              </div>
              <div>
                <dt>Added</dt>
                <dd>{{ formatDate(book.createdAt) }}</dd>
              </div>
            </dl>
          </section>

          <section class="book-detail-view__panel" aria-label="Book reviews">
            <div class="book-detail-view__reviews-header">
              <h2>Reviews</h2>
              <span>{{ reviewCountLabel }}</span>
            </div>

            <div v-if="reviews.length" class="book-detail-view__reviews">
              <article v-for="review in reviews" :key="review.id" class="book-detail-view__review">
                <div class="book-detail-view__review-main">
                  <h3>{{ review.authorUsername }}</h3>
                  <span>{{ review.rating }}/5</span>
                </div>
                <p v-if="review.comment">{{ review.comment }}</p>
                <time :datetime="review.createdAt">{{ formatDate(review.createdAt) }}</time>
              </article>
            </div>

            <div v-else class="book-detail-view__empty" role="status">
              <h3>No reviews yet</h3>
              <p>Reviews appear after completed loans.</p>
            </div>
          </section>
        </section>
      </template>

      <div v-else class="book-detail-view__empty" role="status">
        <h2>Book is unavailable</h2>
        <p>We could not load this book right now.</p>
      </div>
    </section>
  </main>
</template>
