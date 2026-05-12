<script setup lang="ts">
import { GROUPS_ROUTE_PATH, MY_BOOKS_ROUTE_PATH, PROFILE_ROUTE_PATH } from '@/constants/routes.constants';
import './HomeView.css';
</script>

<template>
  <main class="home-view">
    <section class="home-view__shell">
      <div class="home-view__welcome">
        <div class="home-view__welcome-copy">
          <p class="home-view__eyebrow">Shared Shelf</p>
          <h1 class="home-view__title">Your reading space</h1>
          <p class="home-view__description">
            Manage your books, join reading groups, share catalog entries, and keep borrowing requests in one place.
          </p>
        </div>

        <div class="home-view__snapshot" aria-label="Workspace summary">
          <div>
            <span>Collection</span>
            <strong>Personal shelf</strong>
          </div>
          <div>
            <span>Groups</span>
            <strong>Shared catalogs</strong>
          </div>
          <div>
            <span>Requests</span>
            <strong>Queue control</strong>
          </div>
        </div>
      </div>

      <section class="home-view__quick-actions" aria-label="Quick actions">
        <RouterLink class="home-view__primary-action" :to="MY_BOOKS_ROUTE_PATH">
          <small>01</small>
          <span>My books</span>
          <strong>Add and organize your collection</strong>
        </RouterLink>
        <RouterLink class="home-view__primary-action" :to="GROUPS_ROUTE_PATH">
          <small>02</small>
          <span>Groups</span>
          <strong>Find, create, and manage reading circles</strong>
        </RouterLink>
      </section>

      <section class="home-view__workflow" aria-label="Shared Shelf workflow">
        <article>
          <span>1</span>
          <h2>Add books</h2>
          <p>Keep your personal shelf tidy with language, condition, status, and descriptions.</p>
        </article>
        <article>
          <span>2</span>
          <h2>Share in groups</h2>
          <p>Put selected books into a group catalog and control visibility when needed.</p>
        </article>
        <article>
          <span>3</span>
          <h2>Handle requests</h2>
          <p>Approve, reject, cancel, return, and review borrowed books through the group view.</p>
        </article>
      </section>

      <section class="home-view__profile-strip" aria-label="Account shortcut">
        <div>
          <h2>Account settings</h2>
          <p>Update your profile, avatar, bio, and check your reputation score.</p>
        </div>
        <RouterLink class="home-view__secondary-action" :to="PROFILE_ROUTE_PATH">Open profile</RouterLink>
      </section>
    </section>
  </main>
</template>
