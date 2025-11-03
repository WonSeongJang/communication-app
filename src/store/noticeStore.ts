import { create } from 'zustand';
import type { Notice } from '@/types';
import {
  noticeService,
  type CreateNoticeInput,
  type UpdateNoticeInput,
} from '@/services/noticeService';

interface NoticeStore {
  notices: Notice[];
  selectedNotice: Notice | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotices: () => Promise<void>;
  fetchNoticeById: (id: string, userId: string) => Promise<void>;
  createNotice: (data: CreateNoticeInput, authorId: string) => Promise<void>;
  updateNotice: (id: string, data: UpdateNoticeInput) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  togglePin: (id: string, isPinned: boolean) => Promise<void>;
  clearError: () => void;
  clearSelectedNotice: () => void;
}

export const useNoticeStore = create<NoticeStore>((set, get) => ({
  notices: [],
  selectedNotice: null,
  isLoading: false,
  error: null,

  fetchNotices: async () => {
    try {
      set({ isLoading: true, error: null });
      const notices = await noticeService.getNotices();
      set({ notices, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '공지사항 목록을 불러오는데 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchNoticeById: async (id: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const notice = await noticeService.getNoticeById(id, userId);
      set({ selectedNotice: notice, isLoading: false });

      // Update the notice in the list if it exists
      const { notices } = get();
      const updatedNotices = notices.map((n) =>
        n.id === notice.id ? notice : n
      );
      set({ notices: updatedNotices });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '공지사항을 불러오는데 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createNotice: async (data: CreateNoticeInput, authorId: string) => {
    try {
      set({ isLoading: true, error: null });
      const notice = await noticeService.createNotice(data, authorId);

      // Add the new notice to the list
      const { notices } = get();
      const updatedNotices = [notice, ...notices];
      set({ notices: updatedNotices, selectedNotice: notice, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '공지사항 생성에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateNotice: async (id: string, data: UpdateNoticeInput) => {
    try {
      set({ isLoading: true, error: null });
      const notice = await noticeService.updateNotice(id, data);

      // Update the notice in the list
      const { notices } = get();
      const updatedNotices = notices.map((n) =>
        n.id === notice.id ? notice : n
      );
      set({ notices: updatedNotices, selectedNotice: notice, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '공지사항 수정에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteNotice: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await noticeService.deleteNotice(id);

      // Remove the notice from the list
      const { notices } = get();
      const updatedNotices = notices.filter((n) => n.id !== id);
      set({ notices: updatedNotices, selectedNotice: null, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '공지사항 삭제에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  togglePin: async (id: string, isPinned: boolean) => {
    try {
      set({ isLoading: true, error: null });
      await noticeService.togglePin(id, isPinned);

      // Update the notice in the list and re-sort
      const { notices } = get();
      const updatedNotices = notices
        .map((n) => (n.id === id ? { ...n, is_pinned: isPinned } : n))
        .sort((a, b) => {
          // Sort by is_pinned DESC, then created_at DESC
          if (a.is_pinned !== b.is_pinned) {
            return a.is_pinned ? -1 : 1;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      // Update selectedNotice if it's the one being toggled
      const { selectedNotice } = get();
      const updatedSelectedNotice =
        selectedNotice?.id === id
          ? { ...selectedNotice, is_pinned: isPinned }
          : selectedNotice;

      set({
        notices: updatedNotices,
        selectedNotice: updatedSelectedNotice,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '고정 상태 변경에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  clearSelectedNotice: () => set({ selectedNotice: null }),
}));
