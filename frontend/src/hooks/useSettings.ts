import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/authApi';
import { UpdateProfileInput, ChangePasswordInput } from '@/types/auth';

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (payload: UpdateProfileInput) => authApi.updateProfile(payload),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordInput) => authApi.changePassword(payload),
  });
}
