import { ref } from 'vue';
import { usersRepository } from '../repositories/users.repository';

export function useEditProfile() {
  const isSaving = ref(false);
  const isUploadingAvatar = ref(false);

  async function updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    bio?: string;
  }) {
    isSaving.value = true;

    try {
      return await usersRepository.updateMe(payload);
    } finally {
      isSaving.value = false;
    }
  }

  async function uploadAvatar(file: File) {
    isUploadingAvatar.value = true;

    try {
      return await usersRepository.uploadAvatar(file);
    } finally {
      isUploadingAvatar.value = false;
    }
  }

  return {
    isSaving,
    isUploadingAvatar,
    updateProfile,
    uploadAvatar,
  };
}