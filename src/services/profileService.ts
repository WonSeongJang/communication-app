import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/supabase';

export interface UpdateProfileInput {
  name?: string;
  occupation?: string;
  phone?: string;
  messenger_id?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

class ProfileService {
  /**
   * 프로필 정보 업데이트
   * 수정 가능 필드: name, occupation, phone, messenger_id
   */
  async updateProfile(userId: string, data: UpdateProfileInput): Promise<User> {
    try {
      // 업데이트 데이터 준비
      const updateData: any = {};

      if (data.name !== undefined) {
        const trimmedName = data.name.trim();
        if (!trimmedName) {
          throw new Error('이름을 입력해주세요.');
        }
        updateData.name = trimmedName;
      }

      if (data.occupation !== undefined) {
        const trimmedOccupation = data.occupation.trim();
        if (!trimmedOccupation) {
          throw new Error('직업을 입력해주세요.');
        }
        updateData.occupation = trimmedOccupation;
      }

      if (data.phone !== undefined) {
        const trimmedPhone = data.phone.trim();
        if (!trimmedPhone) {
          throw new Error('전화번호를 입력해주세요.');
        }
        // 전화번호 형식 검증 (숫자와 하이픈만 허용)
        if (!/^[0-9-]+$/.test(trimmedPhone)) {
          throw new Error('전화번호는 숫자와 하이픈(-)만 입력 가능합니다.');
        }
        updateData.phone = trimmedPhone;
      }

      if (data.messenger_id !== undefined) {
        updateData.messenger_id = data.messenger_id?.trim() || null;
      }

      // 업데이트할 데이터가 없는 경우
      if (Object.keys(updateData).length === 0) {
        throw new Error('변경된 정보가 없습니다.');
      }

      // 데이터베이스 업데이트
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!updatedUser) throw new Error('프로필 업데이트에 실패했습니다.');

      return updatedUser;
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      const errorMessage =
        error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다.';
      throw new Error(errorMessage);
    }
  }

  /**
   * 비밀번호 변경
   * Supabase Auth의 updateUser 사용
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // 새 비밀번호 유효성 검증
      if (!newPassword || newPassword.length < 6) {
        throw new Error('새 비밀번호는 최소 6자 이상이어야 합니다.');
      }

      // 현재 사용자 세션 확인
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
      }

      // 현재 비밀번호로 재인증 (보안)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('현재 비밀번호가 일치하지 않습니다.');
      }

      // 비밀번호 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      const errorMessage =
        error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.';
      throw new Error(errorMessage);
    }
  }

  /**
   * 현재 사용자 프로필 조회
   */
  async getCurrentProfile(): Promise<User> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      if (!user) throw new Error('사용자 정보를 찾을 수 없습니다.');

      return user;
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      const errorMessage =
        error instanceof Error ? error.message : '프로필 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }
  }
}

export const profileService = new ProfileService();
