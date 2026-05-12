<script setup lang="ts">
import { onMounted } from 'vue';
import { computed, ref } from 'vue';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import BaseInput from '@/shared/components/BaseInput/BaseInput.vue';
import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { RouteName } from '@/enums/route-name.enum';
import { t } from '@/services/localization.service';
import { useGroupsView } from '../../composables/useGroupsView';
import { Group } from '../../interfaces/group.interface';
import './GroupsView.css';

const {
  myGroups,
  openGroups,
  currentUser,
  searchQuery,
  inviteCode,
  form,
  editingGroupId,
  isLoadingMine,
  isSearching,
  isCreating,
  isUpdating,
  joiningGroupId,
  deletingGroupId,
  isJoiningPrivate,
  errorMessage,
  statusMessage,
  fetchMyGroups,
  searchGroups,
  createGroup,
  startEditingGroup,
  cancelEditingGroup,
  updateGroup,
  joinOpenGroup,
  joinPrivateGroup,
  leaveGroup,
} = useGroupsView();

const activeTab = ref<'mine' | 'discover' | 'invites'>('mine');
const isEditingGroup = computed(() => Boolean(editingGroupId.value));

onMounted(async () => {
  await Promise.all([fetchMyGroups(), searchGroups()]);
});

function formatVisibility(group: Group) {
  return group.visibility === 'open' ? t('groups.open') : t('groups.private');
}

function isGroupOwner(group: Group) {
  return Boolean(
    currentUser.value &&
    (group.ownerId === currentUser.value.id || group.ownerUsername === currentUser.value.username),
  );
}

function handleLeaveGroup(group: Group) {
  if (window.confirm(t('groups.leaveConfirm').replace('{name}', group.name))) {
    void leaveGroup(group);
  }
}

function handleGroupFormSubmit() {
  if (isEditingGroup.value) {
    void updateGroup();
    return;
  }

  void createGroup();
}
</script>

<template>
  <main class="groups-view">
    <section class="groups-view__shell">
      <div class="groups-view__header">
        <div>
          <p class="groups-view__eyebrow">{{ t('groups.eyebrow') }}</p>
          <h1 class="groups-view__title">{{ t('groups.title') }}</h1>
          <p class="groups-view__subtitle">{{ t('groups.subtitle') }}</p>
        </div>
      </div>

      <BaseError :message="errorMessage" />
      <p v-if="statusMessage" class="groups-view__success" role="status">{{ statusMessage }}</p>

      <div class="groups-view__tabs" role="tablist" :aria-label="t('groups.sections')">
        <button :class="{ 'is-active': activeTab === 'mine' }" type="button" @click="activeTab = 'mine'">{{ t('groups.myGroups') }}</button>
        <button :class="{ 'is-active': activeTab === 'discover' }" type="button" @click="activeTab = 'discover'">{{ t('groups.discover') }}</button>
        <button :class="{ 'is-active': activeTab === 'invites' }" type="button" @click="activeTab = 'invites'">{{ t('groups.invitations') }}</button>
      </div>

      <section class="groups-view__layout" :class="`groups-view__layout--${activeTab}`">
        <div class="groups-view__column">
          <section v-show="activeTab === 'mine'" class="groups-view__panel" :aria-label="t('groups.yourGroups')">
            <div class="groups-view__panel-header">
              <div>
                <h2>{{ t('groups.myGroups') }}</h2>
                <p>{{ t('groups.myGroupsText') }}</p>
              </div>
            </div>

            <div v-if="isLoadingMine" class="groups-view__loading" aria-live="polite">
              <span class="groups-view__spinner" aria-hidden="true"></span>
              <span>{{ t('groups.loading') }}</span>
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
                <p v-if="group.inviteCode" class="groups-view__invite">{{ t('groups.inviteCode') }}: {{ group.inviteCode }}</p>
                <div class="groups-view__group-actions">
                  <BaseButton
                    :label="t('groups.openGroup')"
                    :variant="BaseButtonVariant.Secondary"
                    @click="$router.push({ name: RouteName.GroupDetail, params: { id: group.id } })"
                  />
                  <BaseButton
                    v-if="isGroupOwner(group)"
                    :label="t('groups.edit')"
                    :variant="BaseButtonVariant.Secondary"
                    @click="startEditingGroup(group)"
                  />
                  <BaseButton
                    v-if="!isGroupOwner(group)"
                    :label="t('groups.leave')"
                    :disabled="deletingGroupId === group.id"
                    :is-loading="deletingGroupId === group.id"
                    :variant="BaseButtonVariant.Secondary"
                    @click="handleLeaveGroup(group)"
                  />
                </div>
              </article>
            </div>

            <div v-else class="groups-view__empty" role="status">
              <h3>{{ t('groups.emptyMine') }}</h3>
              <p>{{ t('groups.emptyMineText') }}</p>
            </div>
          </section>

          <section v-show="activeTab === 'invites'" class="groups-view__panel groups-view__panel--accent" :aria-label="t('groups.joinPrivate')">
            <div class="groups-view__panel-header">
              <div>
                <h2>{{ t('groups.joinPrivate') }}</h2>
                <p>{{ t('groups.joinPrivateText') }}</p>
              </div>
            </div>

            <form class="groups-view__inline-form" novalidate @submit.prevent="joinPrivateGroup">
              <BaseInput
                v-model="inviteCode"
                autocomplete="off"
                :label="t('groups.inviteCode')"
                name="inviteCode"
                :placeholder="t('groups.invitePlaceholder')"
              />
              <BaseButton
                :label="t('groups.joinPrivateButton')"
                :disabled="!inviteCode.trim()"
                :is-loading="isJoiningPrivate"
                :type="BaseButtonHtmlType.Submit"
              />
            </form>
          </section>
        </div>

        <div class="groups-view__column">
          <section v-show="activeTab === 'mine' || activeTab === 'invites'" class="groups-view__panel" :aria-label="isEditingGroup ? t('groups.editGroup') : t('groups.create')">
            <div class="groups-view__panel-header">
              <div>
                <h2>{{ isEditingGroup ? t('groups.editGroup') : t('groups.create') }}</h2>
                <p>{{ isEditingGroup ? t('groups.editText') : t('groups.createText') }}</p>
              </div>
            </div>

            <form class="groups-view__form" novalidate @submit.prevent="handleGroupFormSubmit">
              <BaseInput v-model="form.name" autocomplete="off" :label="t('groups.name')" name="name" placeholder="Weekend readers" />

              <label class="groups-view__field">
                <span>{{ t('groups.description') }}</span>
                <textarea
                  v-model="form.description"
                  name="description"
                  :placeholder="t('groups.descriptionPlaceholder')"
                  rows="4"
                ></textarea>
              </label>

              <label class="groups-view__field">
                <span>{{ t('groups.visibility') }}</span>
                <select v-model="form.visibility" name="visibility">
                  <option value="private">{{ t('groups.private') }}</option>
                  <option value="open">{{ t('groups.open') }}</option>
                </select>
                <small>{{ form.visibility === 'private' ? t('groups.privateHelp') : t('groups.openHelp') }}</small>
              </label>

              <div class="groups-view__actions">
                <BaseButton
                  :label="isEditingGroup ? t('groups.save') : t('groups.create')"
                  :disabled="!form.name.trim()"
                  :is-loading="isEditingGroup ? isUpdating : isCreating"
                  :type="BaseButtonHtmlType.Submit"
                />
                <BaseButton
                  v-if="isEditingGroup"
                  :label="t('groups.cancelEdit')"
                  :disabled="isUpdating"
                  :variant="BaseButtonVariant.Secondary"
                  @click="cancelEditingGroup"
                />
              </div>
            </form>
          </section>

          <section v-show="activeTab === 'discover'" class="groups-view__panel groups-view__panel--wide" :aria-label="t('groups.findOpen')">
            <div class="groups-view__panel-header">
              <div>
                <h2>{{ t('groups.findOpen') }}</h2>
                <p>{{ t('groups.findOpenText') }}</p>
              </div>
            </div>

            <form class="groups-view__inline-form" novalidate @submit.prevent="searchGroups">
              <BaseInput
                v-model="searchQuery"
                autocomplete="off"
                :label="t('groups.search')"
                name="query"
                :placeholder="t('groups.searchPlaceholder')"
              />
              <BaseButton
                :label="t('groups.search')"
                :is-loading="isSearching"
                :type="BaseButtonHtmlType.Submit"
                :variant="BaseButtonVariant.Secondary"
              />
            </form>

            <div v-if="openGroups.length" class="groups-view__list">
              <article v-for="group in openGroups" :key="group.id" class="groups-view__group">
                <div class="groups-view__group-main">
                  <div>
                    <p class="groups-view__badge groups-view__badge--open">{{ t('groups.open') }}</p>
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
                    :label="t('groups.join')"
                    :disabled="joiningGroupId === group.id"
                    :is-loading="joiningGroupId === group.id"
                    @click="joinOpenGroup(group)"
                  />
                </div>
                <p v-if="group.description" class="groups-view__description">{{ group.description }}</p>
              </article>
            </div>

            <div v-else class="groups-view__empty" role="status">
              <h3>{{ t('groups.emptyDiscover') }}</h3>
              <p>{{ t('groups.emptyDiscoverText') }}</p>
            </div>
          </section>
        </div>
      </section>
    </section>
  </main>
</template>
