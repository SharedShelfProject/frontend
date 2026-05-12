<script setup lang="ts">
import { computed, onMounted } from 'vue';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import BaseInput from '@/shared/components/BaseInput/BaseInput.vue';
import { RouteName } from '@/enums/route-name.enum';
import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { BOOK_LANGUAGE_OPTIONS } from '../../constants/book-languages.constants';
import { Book } from '../../interfaces/book.interface';
import { useMyBooksView } from '../../composables/useMyBooksView';
import './MyBooksView.css';

const {
  books,
  form,
  editingBookId,
  isEditing,
  isLoading,
  isSaving,
  deletingBookId,
  errorMessage,
  statusMessage,
  fetchBooks,
  resetForm,
  startEditing,
  saveBook,
  deleteBook,
} = useMyBooksView();

const bookCountLabel = computed(() => {
  const count = books.value.length;

  return `${count} ${count === 1 ? 'book' : 'books'}`;
});

const canChooseStatus = computed(() => form.value.status === 'available' || form.value.status === 'unavailable');

onMounted(fetchBooks);

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function handleDelete(book: Book) {
  if (window.confirm(`Remove "${book.title}" from your collection?`)) {
    void deleteBook(book);
  }
}
</script>

<template>
  <main class="my-books-view">
    <section class="my-books-view__shell">
      <div class="my-books-view__header">
        <div>
          <p class="my-books-view__eyebrow">Personal collection</p>
          <h1 class="my-books-view__title">My books</h1>
        </div>
        <p class="my-books-view__count">{{ bookCountLabel }}</p>
      </div>

      <BaseError :message="errorMessage" />
      <p v-if="statusMessage" class="my-books-view__success" role="status">{{ statusMessage }}</p>

      <section class="my-books-view__panel" aria-label="Book editor">
        <div class="my-books-view__panel-header">
          <div>
            <h2>{{ isEditing ? 'Edit book' : 'Add a book' }}</h2>
            <p>{{ isEditing ? 'Update details in your personal collection.' : 'Start with title and author, then add details if you have them.' }}</p>
          </div>
        </div>

        <form class="my-books-view__form" novalidate @submit.prevent="saveBook">
          <div class="my-books-view__form-section">
            <span>Core information</span>
            <div class="my-books-view__form-grid">
              <BaseInput
                v-model="form.title"
                autocomplete="off"
                label="Title"
                name="title"
                placeholder="The Left Hand of Darkness"
              />
              <BaseInput
                v-model="form.author"
                autocomplete="off"
                label="Author"
                name="author"
                placeholder="Ursula K. Le Guin"
              />
            </div>
          </div>

          <div class="my-books-view__form-section">
            <span>Book details</span>
            <div class="my-books-view__form-grid my-books-view__form-grid--details">
              <BaseInput v-model="form.genre" autocomplete="off" label="Genre" name="genre" placeholder="Science fiction" />
              <label class="my-books-view__field">
                <span>Language</span>
                <select v-model="form.language" name="language">
                  <option value="">Not specified</option>
                  <option v-for="language in BOOK_LANGUAGE_OPTIONS" :key="language" :value="language">
                    {{ language }}
                  </option>
                </select>
              </label>
            </div>
          </div>

          <div class="my-books-view__form-section">
            <span>Edition and availability</span>
            <div class="my-books-view__form-grid my-books-view__form-grid--edition">
              <BaseInput v-model="form.isbn" autocomplete="off" label="ISBN" name="isbn" placeholder="978..." />
              <BaseInput
                v-model="form.publicationYear"
                autocomplete="off"
                label="Publication year"
                name="publicationYear"
                placeholder="1969"
                type="number"
              />
              <label class="my-books-view__field">
                <span>Condition</span>
                <input v-model="form.condition" name="condition" placeholder="Good, annotated, hardcover..." />
              </label>
              <label v-if="isEditing" class="my-books-view__field">
                <span>Status</span>
                <select v-model="form.status" :disabled="!canChooseStatus" name="status">
                  <option v-if="!canChooseStatus" :value="form.status">{{ formatStatus(form.status) }}</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </label>
            </div>
          </div>

          <label class="my-books-view__textarea-field">
            <span>Description</span>
            <textarea
              v-model="form.description"
              class="my-books-view__textarea"
              name="description"
              placeholder="A short note about this copy, edition, or why someone might enjoy it."
              rows="5"
            ></textarea>
          </label>

          <p v-if="isEditing && !canChooseStatus" class="my-books-view__status-note">
            This status is controlled by active requests or loans.
          </p>

          <div class="my-books-view__actions">
            <BaseButton
              :label="isEditing ? 'Save changes' : 'Add book'"
              :disabled="!form.title.trim() || !form.author.trim()"
              :is-loading="isSaving"
              :type="BaseButtonHtmlType.Submit"
            />
            <BaseButton
              v-if="isEditing"
              label="Cancel edit"
              :disabled="isSaving"
              :variant="BaseButtonVariant.Secondary"
              @click="resetForm"
            />
          </div>
        </form>
      </section>

      <section class="my-books-view__list-section" aria-label="Your books">
        <div v-if="isLoading" class="my-books-view__loading" aria-live="polite">
          <span class="my-books-view__spinner" aria-hidden="true"></span>
          <span>Loading books...</span>
        </div>

        <div v-else-if="books.length" class="my-books-view__list">
          <article
            v-for="book in books"
            :key="book.id"
            class="my-books-view__book"
            :class="{ 'my-books-view__book--active': editingBookId === book.id }"
          >
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
                <BaseButton label="Edit" :variant="BaseButtonVariant.Secondary" @click="startEditing(book)" />
                <BaseButton
                  label="Delete"
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
              <div>
                <dt>Added</dt>
                <dd>{{ formatDate(book.createdAt) }}</dd>
              </div>
            </dl>
          </article>
        </div>

        <div v-else class="my-books-view__empty" role="status">
          <h2>Your collection is empty</h2>
          <p>Add your first book above. Later, you will be able to share it inside group catalogs.</p>
        </div>
      </section>
    </section>
  </main>
</template>
