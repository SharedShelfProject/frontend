import { ref } from 'vue';
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

export function useGroupsView() {
  const myGroups = ref<Group[]>([]);
  const openGroups = ref<Group[]>([]);
  const searchQuery = ref('');
  const inviteCode = ref('');
  const form = ref<GroupFormState>({
    name: '',
    description: '',
    visibility: 'private',
  });
  const isLoadingMine = ref(false);
  const isSearching = ref(false);
  const isCreating = ref(false);
  const joiningGroupId = ref<string | null>(null);
  const isJoiningPrivate = ref(false);
  const errorMessage = ref('');
  const statusMessage = ref('');

  function setError(error: unknown, fallback: string) {
    errorMessage.value = error instanceof Error ? error.message : fallback;
  }

  async function fetchMyGroups() {
    isLoadingMine.value = true;
    errorMessage.value = '';

    try {
      const response = await groupsRepository.getMyGroups();
      myGroups.value = response.items;
    } catch (error) {
      setError(error, 'Could not load your groups.');
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
      setError(error, 'Could not search groups.');
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
      statusMessage.value = `"${createdGroup.name}" was created.`;
      await fetchMyGroups();
    } catch (error) {
      setError(error, 'Could not create group.');
    } finally {
      isCreating.value = false;
    }
  }

  async function joinOpenGroup(group: Group) {
    joiningGroupId.value = group.id;
    errorMessage.value = '';
    statusMessage.value = '';

    try {
      const joinedGroup = await groupsRepository.joinOpen(group.id);
      statusMessage.value = `You joined "${joinedGroup.name}".`;
      await fetchMyGroups();
      await searchGroups();
    } catch (error) {
      setError(error, 'Could not join group.');
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
      statusMessage.value = `You joined "${joinedGroup.name}".`;
      await fetchMyGroups();
    } catch (error) {
      setError(error, 'Could not join private group.');
    } finally {
      isJoiningPrivate.value = false;
    }
  }

  return {
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
  };
}
