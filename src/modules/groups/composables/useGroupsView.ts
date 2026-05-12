import { ref } from 'vue';
import { t } from '@/services/localization.service';
import { UserProfile } from '@/modules/profile/interfaces/user-profile.interface';
import { usersRepository } from '@/modules/profile/repositories/users.repository';
import { GroupFormState } from '../interfaces/group-form-state.interface';
import { Group } from '../interfaces/group.interface';
import { groupsRepository } from '../repositories/groups.repository';

function createGroupPayload(form: GroupFormState) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    visibility: form.visibility,
  };
}

function createUpdateGroupPayload(form: GroupFormState) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    visibility: form.visibility,
  };
}

export function useGroupsView() {
  const myGroups = ref<Group[]>([]);
  const openGroups = ref<Group[]>([]);
  const currentUser = ref<UserProfile | null>(null);
  const searchQuery = ref('');
  const inviteCode = ref('');
  const form = ref<GroupFormState>({
    name: '',
    description: '',
    visibility: 'private',
  });
  const editingGroupId = ref<string | null>(null);
  const isLoadingMine = ref(false);
  const isSearching = ref(false);
  const isCreating = ref(false);
  const isUpdating = ref(false);
  const joiningGroupId = ref<string | null>(null);
  const deletingGroupId = ref<string | null>(null);
  const isJoiningPrivate = ref(false);
  const errorMessage = ref('');
  const statusMessage = ref('');

  function setError(error: unknown, fallback: string) {
    errorMessage.value = error instanceof Error ? error.message : fallback;
  }

  async function fetchCurrentUser() {
    try {
      currentUser.value = await usersRepository.getMe();
    } catch {
      currentUser.value = null;
    }
  }

  async function fetchMyGroups() {
    isLoadingMine.value = true;
    errorMessage.value = '';

    try {
      const [response] = await Promise.all([groupsRepository.getMyGroups(), fetchCurrentUser()]);
      myGroups.value = response.items;
    } catch (error) {
      setError(error, t('groups.loadError'));
    } finally {
      isLoadingMine.value = false;
    }
  }

  async function searchGroups() {
    isSearching.value = true;
    errorMessage.value = '';

    try {
      const response = await groupsRepository.searchOpen({
        query: searchQuery.value.trim() || undefined,
        page: 1,
        limit: 20,
      });
      openGroups.value = response.items;
    } catch (error) {
      setError(error, t('groups.searchError'));
    } finally {
      isSearching.value = false;
    }
  }

  async function createGroup() {
    isCreating.value = true;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      const createdGroup = await groupsRepository.create(createGroupPayload(form.value));
      form.value = {
        name: '',
        description: '',
        visibility: 'private',
      };
      statusMessage.value = t('groups.created').replace('{name}', createdGroup.name);
      await fetchMyGroups();
    } catch (error) {
      setError(error, t('groups.createError'));
    } finally {
      isCreating.value = false;
    }
  }

  function startEditingGroup(group: Group) {
    editingGroupId.value = group.id;
    statusMessage.value = '';
    errorMessage.value = '';
    form.value = {
      name: group.name,
      description: group.description ?? '',
      visibility: group.visibility,
    };
  }

  function cancelEditingGroup() {
    editingGroupId.value = null;
    form.value = {
      name: '',
      description: '',
      visibility: 'private',
    };
  }

  async function updateGroup() {
    if (!editingGroupId.value) {
      return;
    }

    isUpdating.value = true;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      const updatedGroup = await groupsRepository.update(editingGroupId.value, createUpdateGroupPayload(form.value));
      statusMessage.value = t('groups.updated').replace('{name}', updatedGroup.name);
      cancelEditingGroup();
      await fetchMyGroups();
      await searchGroups();
    } catch (error) {
      setError(error, t('groups.updateError'));
    } finally {
      isUpdating.value = false;
    }
  }

  async function joinOpenGroup(group: Group) {
    joiningGroupId.value = group.id;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      const joinedGroup = await groupsRepository.joinOpen(group.id);
      statusMessage.value = t('groups.joined').replace('{name}', joinedGroup.name);
      await fetchMyGroups();
      await searchGroups();
    } catch (error) {
      setError(error, t('groups.joinError'));
    } finally {
      joiningGroupId.value = null;
    }
  }

  async function joinPrivateGroup() {
    isJoiningPrivate.value = true;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      const joinedGroup = await groupsRepository.joinPrivate(inviteCode.value.trim());
      inviteCode.value = '';
      statusMessage.value = t('groups.joined').replace('{name}', joinedGroup.name);
      await fetchMyGroups();
    } catch (error) {
      setError(error, t('groups.joinPrivateError'));
    } finally {
      isJoiningPrivate.value = false;
    }
  }

  async function leaveGroup(group: Group) {
    deletingGroupId.value = group.id;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      await groupsRepository.leave(group.id);
      statusMessage.value = t('groups.left').replace('{name}', group.name);
      await fetchMyGroups();
      await searchGroups();
    } catch (error) {
      setError(error, t('groups.leaveError'));
    } finally {
      deletingGroupId.value = null;
    }
  }

  return {
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
  };
}
