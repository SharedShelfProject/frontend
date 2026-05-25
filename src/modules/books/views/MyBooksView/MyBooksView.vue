<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import { RouteName } from '@/enums/route-name.enum';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { currentLocale, t } from '@/services/localization.service';
import { Book } from '../../interfaces/book.interface';
import { useMyBooksView } from '../../composables/useMyBooksView';
import { formatBookLanguage } from '../../services/book-language.service';
import { getBookCoverUrl } from '../../services/book-cover.service';
import './MyBooksView.css';

const {
  books,
  isLoading,
  deletingBookId,
  errorMessage,
  statusMessage,
  fetchBooks,
  deleteBook,
} = useMyBooksView();

const searchQuery = ref('');
const statusFilter = ref('all');
const sortMode = ref('newest');
const viewMode = ref<'grid' | 'list'>('grid');

const bookCountLabel = computed(() => {
  const count = books.value.length;

  return formatBookCount(count);
});

const filteredBooks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return [...books.value]
    .filter((book) => {
      const matchesQuery = !query || [book.title, book.author, book.genre, book.language]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
      const matchesStatus = statusFilter.value === 'all' || book.status === statusFilter.value;

      return matchesQuery && matchesStatus;
    })
    .sort((firstBook, secondBook) => {
      if (sortMode.value === 'title') {
        return firstBook.title.localeCompare(secondBook.title);
      }

      if (sortMode.value === 'author') {
        return firstBook.author.localeCompare(secondBook.author);
      }

      return new Date(secondBook.createdAt).getTime() - new Date(firstBook.createdAt).getTime();
    });
});

const availableCount = computed(() => books.value.filter((book) => book.status === 'available').length);
const sharedReadyCount = computed(() => books.value.filter((book) => book.status !== 'borrowed').length);

onMounted(fetchBooks);

function formatDate(value: string) {
  return new Intl.DateTimeFormat(currentLocale.value === 'uk' ? 'uk-UA' : 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatStatus(status: string) {
  return t(`status.${status}` as Parameters<typeof t>[0]);
}

function formatBookCount(count: number) {
  if (currentLocale.value !== 'uk') {
    return `${count} ${count === 1 ? t('books.countOne') : t('books.countMany')}`;
  }

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  const label = lastDigit === 1 && lastTwoDigits !== 11
    ? t('books.countOne')
    : lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)
      ? t('books.countFew')
      : t('books.countMany');

  return `${count} ${label}`;
}

function handleDelete(book: Book) {
  if (window.confirm(t('books.confirmDelete').replace('{title}', book.title))) {
    void deleteBook(book);
  }
}

</script>

<template>
  <main class="my-books-view">
    <section class="my-books-view__shell">
      <div class="my-books-view__header">
        <div>
          <p class="my-books-view__eyebrow">{{ t('books.eyebrow') }}</p>
          <h1 class="my-books-view__title">{{ t('books.title') }}</h1>
        </div>
        <div class="my-books-view__header-actions">
          <p class="my-books-view__count">{{ bookCountLabel }}</p>
          <BaseButton :label="t('books.addBook')" @click="$router.push({ name: RouteName.NewBook })" />
        </div>
      </div>

      <BaseError :message="errorMessage" />
      <p v-if="statusMessage" class="my-books-view__success" role="status">{{ statusMessage }}</p>

      <section class="my-books-view__insights" :aria-label="t('books.summaryLabel')">
        <article>
          <span>{{ t('books.total') }}</span>
          <strong>{{ books.length }}</strong>
        </article>
        <article>
          <span>{{ t('home.available') }}</span>
          <strong>{{ availableCount }}</strong>
        </article>
        <article>
          <span>{{ t('books.ready') }}</span>
          <strong>{{ sharedReadyCount }}</strong>
        </article>
      </section>

      <section class="my-books-view__toolbar" :aria-label="t('books.controlsLabel')">
        <label class="my-books-view__search">
          <span>{{ t('books.search') }}</span>
          <input v-model="searchQuery" :placeholder="t('books.searchPlaceholder')" type="search" />
        </label>
        <label>
          <span>{{ t('books.status') }}</span>
          <select v-model="statusFilter">
            <option value="all">{{ t('books.all') }}</option>
            <option value="available">{{ t('status.available') }}</option>
            <option value="queued">{{ t('status.queued') }}</option>
            <option value="borrowed">{{ t('status.borrowed') }}</option>
            <option value="unavailable">{{ t('status.unavailable') }}</option>
          </select>
        </label>
        <label>
          <span>{{ t('books.sort') }}</span>
          <select v-model="sortMode">
            <option value="newest">{{ t('books.newest') }}</option>
            <option value="title">{{ t('books.titleSort') }}</option>
            <option value="author">{{ t('books.authorSort') }}</option>
          </select>
        </label>
        <div class="my-books-view__toggle" :aria-label="t('books.viewModeLabel')">
          <button :class="{ 'is-active': viewMode === 'grid' }" type="button" @click="viewMode = 'grid'">{{ t('books.grid') }}</button>
          <button :class="{ 'is-active': viewMode === 'list' }" type="button" @click="viewMode = 'list'">{{ t('books.list') }}</button>
        </div>
      </section>

      <section class="my-books-view__list-section" :aria-label="t('books.listLabel')">
        <div v-if="isLoading" class="my-books-view__loading" aria-live="polite">
          <span class="my-books-view__spinner" aria-hidden="true"></span>
          <span>{{ t('books.loading') }}</span>
        </div>

        <div v-else-if="filteredBooks.length" class="my-books-view__list" :class="`my-books-view__list--${viewMode}`">
          <article
            v-for="book in filteredBooks"
            :key="book.id"
            class="my-books-view__book"
          >
            <RouterLink class="my-books-view__cover" :to="{ name: RouteName.BookDetail, params: { id: book.id } }" :aria-label="`${t('books.open')} ${book.title}`">
              <img v-if="getBookCoverUrl(book)" :src="getBookCoverUrl(book)" alt="" />
              <span v-else aria-hidden="true">{{ book.title.at(0)?.toUpperCase() }}</span>
            </RouterLink>
            <div class="my-books-view__book-main">
              <div>
                <p class="my-books-view__book-status" :class="`my-books-view__book-status--${book.status}`">
                  {{ formatStatus(book.status) }}
                </p>
                <h2>
                  <RouterLink
                    class="my-books-view__book-link"
                    :to="{ name: RouteName.BookDetail, params: { id: book.id } }"
                  >
                    {{ book.title }}
                  </RouterLink>
                </h2>
                <p class="my-books-view__author">{{ book.author }}</p>
              </div>
              <div class="my-books-view__book-actions">
                <BaseButton :label="t('books.edit')" :variant="BaseButtonVariant.Secondary" @click="$router.push({ name: RouteName.EditBook, params: { id: book.id } })" />
                <BaseButton
                  :label="t('books.delete')"
                  :disabled="deletingBookId === book.id"
                  :is-loading="deletingBookId === book.id"
                  :variant="BaseButtonVariant.Secondary"
                  @click="handleDelete(book)"
                />
              </div>
            </div>

            <p v-if="book.description" class="my-books-view__description">{{ book.description }}</p>

            <dl class="my-books-view__meta">
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
              <div>
                <dt>{{ t('books.added') }}</dt>
                <dd>{{ formatDate(book.createdAt) }}</dd>
              </div>
            </dl>
          </article>
        </div>

        <div v-else class="my-books-view__empty" role="status">
          <div class="my-books-view__empty-icon" aria-hidden="true">+</div>
          <h2>{{ t('books.emptyTitle') }}</h2>
          <p>{{ t('books.emptyText') }}</p>
          <BaseButton :label="t('home.addFirstBook')" @click="$router.push({ name: RouteName.NewBook })" />
        </div>
      </section>
    </section>
  </main>
</template>
