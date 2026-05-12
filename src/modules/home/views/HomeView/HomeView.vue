<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { GROUPS_ROUTE_PATH, MY_BOOKS_ROUTE_PATH, PROFILE_ROUTE_PATH } from '@/constants/routes.constants';
import { RouteName } from '@/enums/route-name.enum';
import { Book } from '@/modules/books/interfaces/book.interface';
import { booksRepository } from '@/modules/books/repositories/books.repository';
import { getBookCoverUrl } from '@/modules/books/services/book-cover.service';
import { Group } from '@/modules/groups/interfaces/group.interface';
import { groupsRepository } from '@/modules/groups/repositories/groups.repository';
import { t } from '@/services/localization.service';
import './HomeView.css';

const books = ref<Book[]>([]);
const groups = ref<Group[]>([]);
const isLoading = ref(false);

const recentBooks = computed(() => books.value.slice(0, 3));
const availableBooks = computed(() => books.value.filter((book) => book.status === 'available').length);

onMounted(async () => {
  isLoading.value = true;

  try {
    const [booksResponse, groupsResponse] = await Promise.all([
      booksRepository.getMyBooks(),
      groupsRepository.getMyGroups(),
    ]);

    books.value = booksResponse;
    groups.value = groupsResponse.items;
  } catch {
    books.value = [];
    groups.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <main class="home-view">
    <div class="home-view__side-stickers home-view__side-stickers--left" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="home-view__side-stickers home-view__side-stickers--right" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <section class="home-view__shell">
      <div class="home-view__welcome">
        <div class="home-view__stickers home-view__stickers--left" aria-hidden="true">
          <span></span>
          <span></span>
        </div>
        <div class="home-view__stickers home-view__stickers--right" aria-hidden="true">
          <span></span>
          <span></span>
        </div>
        <div class="home-view__welcome-copy">
          <p class="home-view__eyebrow">Shared Shelf</p>
          <h1 class="home-view__title">{{ t('home.title') }}</h1>
          <p class="home-view__description">
            {{ t('home.description') }}
          </p>
        </div>

        <div class="home-view__snapshot" aria-label="Workspace summary">
          <div>
            <span>{{ t('home.collection') }}</span>
            <strong>{{ isLoading ? '...' : books.length }}</strong>
          </div>
          <div>
            <span>{{ t('home.groups') }}</span>
            <strong>{{ isLoading ? '...' : groups.length }}</strong>
          </div>
          <div>
            <span>{{ t('home.available') }}</span>
            <strong>{{ isLoading ? '...' : availableBooks }}</strong>
          </div>
        </div>
      </div>

      <section class="home-view__quick-actions" aria-label="Quick actions">
        <RouterLink class="home-view__primary-action" :to="MY_BOOKS_ROUTE_PATH">
          <small>01</small>
          <span>{{ t('home.myBooks') }}</span>
          <strong>{{ t('home.myBooksHint') }}</strong>
        </RouterLink>
        <RouterLink class="home-view__primary-action" :to="GROUPS_ROUTE_PATH">
          <small>02</small>
          <span>{{ t('home.groups') }}</span>
          <strong>{{ t('home.groupsHint') }}</strong>
        </RouterLink>
      </section>

      <section class="home-view__dashboard-grid" aria-label="Dashboard overview">
        <section class="home-view__panel home-view__panel--wide">
          <div class="home-view__panel-header">
            <div>
              <p class="home-view__eyebrow">{{ t('home.recent') }}</p>
              <h2>{{ t('home.latestBooks') }}</h2>
            </div>
            <RouterLink :to="MY_BOOKS_ROUTE_PATH">{{ t('home.viewLibrary') }}</RouterLink>
          </div>

          <div v-if="recentBooks.length" class="home-view__recent-books">
            <article v-for="book in recentBooks" :key="book.id">
              <RouterLink class="home-view__book-cover" :to="{ name: RouteName.BookDetail, params: { id: book.id } }" :aria-label="book.title">
                <img v-if="getBookCoverUrl(book)" :src="getBookCoverUrl(book)" alt="" />
                <span v-else aria-hidden="true">{{ book.title.at(0)?.toUpperCase() }}</span>
              </RouterLink>
              <div>
                <h3>{{ book.title }}</h3>
                <p>{{ book.author }}</p>
              </div>
              <span>{{ book.status }}</span>
            </article>
          </div>

          <div v-else class="home-view__empty-state">
            <strong>{{ t('home.noBooks') }}</strong>
            <p>{{ t('home.noBooksHint') }}</p>
            <RouterLink :to="{ name: RouteName.NewBook }">{{ t('home.addFirstBook') }}</RouterLink>
          </div>
        </section>

        <section class="home-view__panel">
          <div class="home-view__panel-header">
            <div>
              <p class="home-view__eyebrow">{{ t('home.groupActivity') }}</p>
              <h2>{{ t('home.yourCircles') }}</h2>
            </div>
          </div>

          <div v-if="groups.length" class="home-view__group-list">
            <RouterLink v-for="group in groups.slice(0, 4)" :key="group.id" :to="{ name: RouteName.GroupDetail, params: { id: group.id } }">
              <span>{{ group.name.at(0)?.toUpperCase() }}</span>
              <strong>{{ group.name }}</strong>
            </RouterLink>
          </div>

          <div v-else class="home-view__empty-state">
            <strong>{{ t('home.noGroups') }}</strong>
            <p>{{ t('home.noGroupsHint') }}</p>
            <RouterLink :to="GROUPS_ROUTE_PATH">{{ t('home.browseGroups') }}</RouterLink>
          </div>
        </section>
      </section>

      <section class="home-view__workflow" aria-label="Shared Shelf workflow">
        <article>
          <span>1</span>
          <h2>{{ t('home.workflow.addTitle') }}</h2>
          <p>{{ t('home.workflow.addText') }}</p>
        </article>
        <article>
          <span>2</span>
          <h2>{{ t('home.workflow.shareTitle') }}</h2>
          <p>{{ t('home.workflow.shareText') }}</p>
        </article>
        <article>
          <span>3</span>
          <h2>{{ t('home.workflow.requestsTitle') }}</h2>
          <p>{{ t('home.workflow.requestsText') }}</p>
        </article>
      </section>

      <section class="home-view__profile-strip" aria-label="Account shortcut">
        <div>
          <h2>{{ t('home.profileSettings') }}</h2>
          <p>{{ t('home.profileText') }}</p>
        </div>
        <RouterLink class="home-view__secondary-action" :to="PROFILE_ROUTE_PATH">{{ t('home.openProfile') }}</RouterLink>
      </section>
    </section>
  </main>
</template>
