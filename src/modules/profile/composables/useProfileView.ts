import { ref, onMounted } from 'vue';
import { usersRepository } from '../repositories/users.repository';
import { UserProfile } from '../interfaces/user-profile.interface';

export function useProfileView() {
  const user = ref<UserProfile | null>(null);
  const isLoading = ref(false);

  async function fetchProfile() {
    isLoading.value = true;

    try {
      user.value = await usersRepository.getMe();
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(fetchProfile);

  return {
    user,
    isLoading,
    fetchProfile,
  };
}