import { create } from 'zustand';
import { approvalService, type PendingUser } from '@/services/approvalService';
import { useAuthStore } from '@/store/authStore';

interface ApprovalStore {
  // State
  pendingUsers: PendingUser[];
  selectedUserIds: Set<string>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPendingUsers: () => Promise<void>;
  approveUser: (userId: string, note?: string) => Promise<void>;
  rejectUser: (userId: string, note?: string) => Promise<void>;
  bulkApprove: (note?: string) => Promise<void>;
  bulkReject: (note?: string) => Promise<void>;

  // Selection
  toggleUserSelection: (userId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Utility
  clearError: () => void;
}

export const useApprovalStore = create<ApprovalStore>((set, get) => ({
  // Initial state
  pendingUsers: [],
  selectedUserIds: new Set<string>(),
  isLoading: false,
  error: null,

  // Fetch pending users
  fetchPendingUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await approvalService.getPendingUsers();
      set({ pendingUsers: users, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '대기 중인 사용자를 불러오는데 실패했습니다.';
      set({ error: errorMessage, isLoading: false, pendingUsers: [] });
    }
  },

  // Approve single user
  approveUser: async (userId: string, note?: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      set({ error: '로그인이 필요합니다.' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await approvalService.approveUser(userId, currentUser.id, note);

      // Refetch pending users and clear selection
      await get().fetchPendingUsers();

      // Remove from selection if exists
      const newSelection = new Set(get().selectedUserIds);
      newSelection.delete(userId);
      set({ selectedUserIds: newSelection });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '사용자 승인에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Reject single user
  rejectUser: async (userId: string, note?: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      set({ error: '로그인이 필요합니다.' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await approvalService.rejectUser(userId, currentUser.id, note);

      // Refetch pending users and clear selection
      await get().fetchPendingUsers();

      // Remove from selection if exists
      const newSelection = new Set(get().selectedUserIds);
      newSelection.delete(userId);
      set({ selectedUserIds: newSelection });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '사용자 거부에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Bulk approve
  bulkApprove: async (note?: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      set({ error: '로그인이 필요합니다.' });
      return;
    }

    const { selectedUserIds } = get();
    if (selectedUserIds.size === 0) {
      set({ error: '승인할 사용자를 선택해주세요.' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const userIdsArray = Array.from(selectedUserIds);
      const result = await approvalService.bulkApprove(userIdsArray, currentUser.id, note);

      // Refetch pending users and clear selection
      await get().fetchPendingUsers();
      set({ selectedUserIds: new Set<string>() });

      // Show success/failure message
      if (result.failed > 0) {
        set({
          error: `${result.success}명 승인 완료, ${result.failed}명 실패`
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '일괄 승인에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Bulk reject
  bulkReject: async (note?: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      set({ error: '로그인이 필요합니다.' });
      return;
    }

    const { selectedUserIds } = get();
    if (selectedUserIds.size === 0) {
      set({ error: '거부할 사용자를 선택해주세요.' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const userIdsArray = Array.from(selectedUserIds);
      const result = await approvalService.bulkReject(userIdsArray, currentUser.id, note);

      // Refetch pending users and clear selection
      await get().fetchPendingUsers();
      set({ selectedUserIds: new Set<string>() });

      // Show success/failure message
      if (result.failed > 0) {
        set({
          error: `${result.success}명 거부 완료, ${result.failed}명 실패`
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '일괄 거부에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Toggle user selection
  toggleUserSelection: (userId: string) => {
    const newSelection = new Set(get().selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    set({ selectedUserIds: newSelection });
  },

  // Select all users
  selectAll: () => {
    const allUserIds = get().pendingUsers.map(user => user.id);
    set({ selectedUserIds: new Set(allUserIds) });
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedUserIds: new Set<string>() });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
