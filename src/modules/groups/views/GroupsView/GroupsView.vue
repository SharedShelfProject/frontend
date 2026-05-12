<script setup lang="ts">
import { onMounted } from 'vue';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import BaseInput from '@/shared/components/BaseInput/BaseInput.vue';
import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { RouteName } from '@/enums/route-name.enum';
import { useGroupsView } from '../../composables/useGroupsView';
import { Group } from '../../interfaces/group.interface';
import './GroupsView.css';

const {
  myGroups,
  openGroups,
  searchQuery,
  inviteCode,
  form,
  isLoadingMine,
  isSearching,
  isCreating,
  joiningGroupId,
  isJoiningPrivate,
  errorMessage,
  statusMessage,
  fetchMyGroups,
  searchGroups,
  createGroup,
  joinOpenGroup,
  joinPrivateGroup,
} = useGroupsView();

onMounted(async () => {
  await Promise.all([fetchMyGroups(), searchGroups()]);
});

function formatVisibility(group: Group) {
  return group.visibility === 'open' ? 'Open' : 'Private';
}
</script>

<template>
  <main class="groups-view">
    <section class="groups-view__shell">
      <div class="groups-view__header">
        <div>
          <p class="groups-view__eyebrow">Reading circles</p>
          <h1 class="groups-view__title">Groups</h1>
          <p class="groups-view__subtitle">Create private reading rooms, discover open groups, and share catalog shelves with people you trust.</p>
        </div>
      </div>

      <BaseError :message="errorMessage" />
      <p v-if="statusMessage" class="groups-view__success" role="status">{{ statusMessage }}</p>

      <section class="groups-view__layout">
        <div class="groups-view__column">
          <section class="groups-view__panel" aria-label="Your groups">
            <div class="groups-view__panel-header">
              <div>
                <h2>My groups</h2>
                <p>Groups where your membership is active.</p>
              </div>
            </div>

            <div v-if="isLoadingMine" class="groups-view__loading" aria-live="polite">
              <span class="groups-view__spinner" aria-hidden="true"></span>
              <span>Loading groups...</span>
            </div>

            <div v-else-if="myGroups.length" class="groups-view__list">
              <article v-for="group in myGroups" :key="group.id" class="groups-view__group">
                <div class="groups-view__group-main">
                  <div>
                    <p class="groups-view__badge" :class="`groups-view__badge--${group.visibility}`">
                      {{ formatVisibility(group) }}
                    </p>
                    <h3>
                      <RouterLink
                        class="groups-view__group-link"
                        :to="{ name: RouteName.GroupDetail, params: { id: group.id } }"
                      >
                        {{ group.name }}
                      </RouterLink>
                    </h3>
                  </div>
                </div>
                <p v-if="group.description" class="groups-view__description">{{ group.description }}</p>
                <p v-if="group.inviteCode" class="groups-view__invite">Invite code: {{ group.inviteCode }}</p>
              </article>
            </div>

            <div v-else class="groups-view__empty" role="status">
              <h3>No groups yet</h3>
              <p>Create a group or join one below.</p>
            </div>
          </section>

          <section class="groups-view__panel" aria-label="Join private group">
            <div class="groups-view__panel-header">
              <div>
                <h2>Join private group</h2>
                <p>Use an invite code from another member.</p>
              </div>
            </div>

            <form class="groups-view__inline-form" novalidate @submit.prevent="joinPrivateGroup">
              <BaseInput
                v-model="inviteCode"
                autocomplete="off"
                label="Invite code"
                name="inviteCode"
                placeholder="Paste code"
              />
              <BaseButton
                label="Join private"
                :disabled="!inviteCode.trim()"
                :is-loading="isJoiningPrivate"
                :type="BaseButtonHtmlType.Submit"
              />
            </form>
          </section>
        </div>

        <div class="groups-view__column">
          <section class="groups-view__panel" aria-label="Create group">
            <div class="groups-view__panel-header">
              <div>
                <h2>Create group</h2>
                <p>Private groups generate an invite code automatically.</p>
              </div>
            </div>

            <form class="groups-view__form" novalidate @submit.prevent="createGroup">
              <BaseInput v-model="form.name" autocomplete="off" label="Name" name="name" placeholder="Weekend readers" />

              <label class="groups-view__field">
                <span>Description</span>
                <textarea
                  v-model="form.description"
                  name="description"
                  placeholder="What this group reads or how members exchange books."
                  rows="4"
                ></textarea>
              </label>

              <label class="groups-view__field">
                <span>Visibility</span>
                <select v-model="form.visibility" name="visibility">
                  <option value="private">Private</option>
                  <option value="open">Open</option>
                </select>
                <small>{{ form.visibility === 'private' ? 'Best for invite-only circles. An invite code will be generated.' : 'Anyone can find and join this group.' }}</small>
              </label>

              <div class="groups-view__actions">
                <BaseButton
                  label="Create group"
                  :disabled="!form.name.trim()"
                  :is-loading="isCreating"
                  :type="BaseButtonHtmlType.Submit"
                />
              </div>
            </form>
          </section>

          <section class="groups-view__panel" aria-label="Find open groups">
            <div class="groups-view__panel-header">
              <div>
                <h2>Find open groups</h2>
                <p>Search public groups you can join directly.</p>
              </div>
            </div>

            <form class="groups-view__inline-form" novalidate @submit.prevent="searchGroups">
              <BaseInput
                v-model="searchQuery"
                autocomplete="off"
                label="Search"
                name="query"
                placeholder="Group name"
              />
              <BaseButton
                label="Search"
                :is-loading="isSearching"
                :type="BaseButtonHtmlType.Submit"
                :variant="BaseButtonVariant.Secondary"
              />
            </form>

            <div v-if="openGroups.length" class="groups-view__list">
              <article v-for="group in openGroups" :key="group.id" class="groups-view__group">
                <div class="groups-view__group-main">
                  <div>
                    <p class="groups-view__badge groups-view__badge--open">Open</p>
                    <h3>
                      <RouterLink
                        class="groups-view__group-link"
                        :to="{ name: RouteName.GroupDetail, params: { id: group.id } }"
                      >
                        {{ group.name }}
                      </RouterLink>
                    </h3>
                  </div>
                  <BaseButton
                    label="Join"
                    :disabled="joiningGroupId === group.id"
                    :is-loading="joiningGroupId === group.id"
                    @click="joinOpenGroup(group)"
                  />
                </div>
                <p v-if="group.description" class="groups-view__description">{{ group.description }}</p>
              </article>
            </div>

            <div v-else class="groups-view__empty" role="status">
              <h3>No open groups found</h3>
              <p>Try another search or create your own group.</p>
            </div>
          </section>
        </div>
      </section>
    </section>
  </main>
</template>
