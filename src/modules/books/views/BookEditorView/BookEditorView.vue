<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import BaseInput from '@/shared/components/BaseInput/BaseInput.vue';
import { MY_BOOKS_ROUTE_PATH } from '@/constants/routes.constants';
import { RouteName } from '@/enums/route-name.enum';
import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { t } from '@/services/localization.service';
import { BOOK_LANGUAGE_OPTIONS } from '../../constants/book-languages.constants';
import { BookFormState } from '../../interfaces/book-form-state.interface';
import { booksRepository } from '../../repositories/books.repository';
import { formatBookLanguage } from '../../services/book-language.service';
import { getBookCoverUrl, readFileAsDataUrl, saveBookCover } from '../../services/book-cover.service';
import './BookEditorView.css';

const MAX_COVER_SIZE_IN_BYTES = 3 * 1024 * 1024;

const route = useRoute();
const router = useRouter();
const bookId = computed(() => (route.name === RouteName.EditBook ? String(route.params.id) : ''));
const isEditing = computed(() => Boolean(bookId.value));

const form = ref<BookFormState>({
  title: '',
  author: '',
  isbn: '',
  genre: '',
  publicationYear: '',
  language: '',
  description: '',
  condition: '',
  status: 'available',
});

const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');
const statusMessage = ref('');
const coverPreviewUrl = ref('');

const completion = computed(() => {
  const fields = [form.value.title, form.value.author, form.value.genre, form.value.language, form.value.condition];
  const completed = fields.filter((value) => value.trim()).length;

  return Math.round((completed / fields.length) * 100);
});

const canSave = computed(() => Boolean(form.value.title.trim() && form.value.author.trim()));

function normalizePayload() {
  const publicationYear = Number(form.value.publicationYear);

  return {
    title: form.value.title.trim(),
    author: form.value.author.trim(),
    isbn: form.value.isbn.trim() || undefined,
    genre: form.value.genre.trim() || undefined,
    publicationYear: Number.isInteger(publicationYear) ? publicationYear : undefined,
    language: form.value.language.trim() || undefined,
    description: form.value.description.trim() || undefined,
    condition: form.value.condition.trim() || undefined,
  };
}

async function fetchBook() {
  if (!isEditing.value) {
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const book = await booksRepository.getById(bookId.value);

    form.value = {
      title: book.title,
      author: book.author,
      isbn: book.isbn ?? '',
      genre: book.genre ?? '',
      publicationYear: book.publicationYear ? String(book.publicationYear) : '',
      language: book.language ?? '',
      description: book.description ?? '',
      condition: book.condition ?? '',
      status: book.status,
    };
    coverPreviewUrl.value = getBookCoverUrl(book);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load book.';
  } finally {
    isLoading.value = false;
  }
}

async function saveBook() {
  if (!canSave.value) {
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';
  statusMessage.value = '';

  try {
    if (isEditing.value) {
      await booksRepository.update(bookId.value, {
        ...normalizePayload(),
        status: form.value.status,
      });
      saveBookCover(bookId.value, coverPreviewUrl.value);
      statusMessage.value = 'Book updated.';
    } else {
      const createdBook = await booksRepository.create(normalizePayload());
      saveBookCover(createdBook.id, coverPreviewUrl.value);
      statusMessage.value = 'Book added.';
    }

    await router.push(MY_BOOKS_ROUTE_PATH);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not save book.';
  } finally {
    isSaving.value = false;
  }
}

async function handleCoverChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  errorMessage.value = '';
  statusMessage.value = '';

  if (!file) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    errorMessage.value = t('editor.coverTypeError');
    input.value = '';
    return;
  }

  if (file.size > MAX_COVER_SIZE_IN_BYTES) {
    errorMessage.value = t('editor.coverSizeError');
    input.value = '';
    return;
  }

  try {
    coverPreviewUrl.value = await readFileAsDataUrl(file);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not read image file.';
  } finally {
    input.value = '';
  }
}

onMounted(fetchBook);
</script>

<template>
  <main class="book-editor-view">
    <section class="book-editor-view__shell">
      <RouterLink class="book-editor-view__back-link" :to="MY_BOOKS_ROUTE_PATH">{{ t('editor.back') }}</RouterLink>

      <section class="book-editor-view__hero">
        <div>
          <p class="book-editor-view__eyebrow">{{ isEditing ? t('editor.edit') : t('editor.new') }}</p>
          <h1>{{ isEditing ? t('editor.editTitle') : t('editor.newTitle') }}</h1>
          <p>{{ t('editor.description') }}</p>
        </div>
        <div class="book-editor-view__progress" :aria-label="t('editor.formCompletionLabel')">
          <strong>{{ completion }}%</strong>
          <span>{{ t('editor.complete') }}</span>
        </div>
      </section>

      <BaseError :message="errorMessage" />
      <p v-if="statusMessage" class="book-editor-view__success" role="status">{{ statusMessage }}</p>

      <div v-if="isLoading" class="book-editor-view__loading" aria-live="polite">{{ t('editor.loading') }}</div>

      <form v-else class="book-editor-view__form" novalidate @submit.prevent="saveBook">
        <section class="book-editor-view__section">
          <div>
            <span class="book-editor-view__step">01</span>
            <h2>{{ t('editor.basic') }}</h2>
            <p>{{ t('editor.basicText') }}</p>
          </div>
          <div class="book-editor-view__basic-layout">
            <label class="book-editor-view__cover-upload">
              <span>{{ t('editor.cover') }}</span>
              <input type="file" accept="image/*" @change="handleCoverChange" />
              <img v-if="coverPreviewUrl" :src="coverPreviewUrl" alt="" />
              <strong v-else aria-hidden="true">{{ form.title.at(0)?.toUpperCase() || '+' }}</strong>
              <small>{{ t('editor.coverHint') }}</small>
            </label>

            <div class="book-editor-view__grid">
              <BaseInput v-model="form.title" autocomplete="off" :label="t('editor.titleLabel')" name="title" :placeholder="t('editor.titlePlaceholder')" />
              <BaseInput v-model="form.author" autocomplete="off" :label="t('editor.authorLabel')" name="author" :placeholder="t('editor.authorPlaceholder')" />
            </div>
          </div>
        </section>

        <section class="book-editor-view__section">
          <div>
            <span class="book-editor-view__step">02</span>
            <h2>{{ t('editor.details') }}</h2>
            <p>{{ t('editor.detailsText') }}</p>
          </div>
          <div class="book-editor-view__grid book-editor-view__grid--details">
            <BaseInput v-model="form.genre" autocomplete="off" :label="t('books.genre')" name="genre" :placeholder="t('editor.genrePlaceholder')" />
            <label class="book-editor-view__field">
              <span>{{ t('books.language') }}</span>
              <select v-model="form.language" name="language">
                <option value="">{{ t('editor.notSpecified') }}</option>
                <option v-for="language in BOOK_LANGUAGE_OPTIONS" :key="language" :value="language">
                  {{ formatBookLanguage(language) }}
                </option>
              </select>
            </label>
            <BaseInput v-model="form.isbn" autocomplete="off" :label="t('editor.isbn')" name="isbn" placeholder="978..." />
            <BaseInput v-model="form.publicationYear" autocomplete="off" :label="t('books.year')" name="publicationYear" type="number" :placeholder="t('editor.yearPlaceholder')" />
          </div>
        </section>

        <section class="book-editor-view__section">
          <div>
            <span class="book-editor-view__step">03</span>
            <h2>{{ t('editor.availability') }}</h2>
            <p>{{ t('editor.availabilityText') }}</p>
          </div>
          <div class="book-editor-view__grid book-editor-view__grid--details">
            <label class="book-editor-view__field">
              <span>{{ t('books.condition') }}</span>
              <input v-model="form.condition" name="condition" :placeholder="t('editor.conditionPlaceholder')" />
            </label>
            <label v-if="isEditing" class="book-editor-view__field">
              <span>{{ t('books.status') }}</span>
              <select v-model="form.status" name="status">
                <option value="available">{{ t('status.available') }}</option>
                <option value="unavailable">{{ t('status.unavailable') }}</option>
              </select>
            </label>
          </div>
        </section>

        <section class="book-editor-view__section">
          <div>
            <span class="book-editor-view__step">04</span>
            <h2>{{ t('editor.preview') }}</h2>
            <p>{{ t('editor.previewText') }}</p>
          </div>
          <label class="book-editor-view__field">
            <span>{{ t('editor.descriptionLabel') }}</span>
            <textarea v-model="form.description" name="description" rows="5" :placeholder="t('editor.descriptionPlaceholder')"></textarea>
          </label>
        </section>

        <footer class="book-editor-view__actions">
          <RouterLink class="book-editor-view__cancel" :to="MY_BOOKS_ROUTE_PATH">{{ t('editor.cancel') }}</RouterLink>
          <BaseButton
            :label="isEditing ? t('editor.save') : t('editor.add')"
            :disabled="!canSave"
            :is-loading="isSaving"
            :type="BaseButtonHtmlType.Submit"
          />
          <BaseButton
            v-if="isEditing"
            :label="t('editor.view')"
            :variant="BaseButtonVariant.Secondary"
            @click="router.push({ name: RouteName.BookDetail, params: { id: bookId } })"
          />
        </footer>
      </form>
    </section>
  </main>
</template>
