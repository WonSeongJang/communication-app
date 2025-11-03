import { create } from 'zustand';
import { donationService } from '@/services/donationService';
import type {
  DonationWithDonor,
  DonationSummary,
  CreateDonationInput,
  User,
} from '@/types';

interface DonationState {
  // Data
  donations: DonationWithDonor[];
  summary: DonationSummary[];
  totalAmount: number;
  activeMembers: Pick<User, 'id' | 'name' | 'generation' | 'email'>[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllDonations: () => Promise<void>;
  fetchDonationsSummary: () => Promise<void>;
  fetchActiveMembers: () => Promise<void>;
  createDonation: (input: CreateDonationInput) => Promise<void>;
  updateDonation: (id: string, amount: number) => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDonationStore = create<DonationState>((set, get) => ({
  // Initial state
  donations: [],
  summary: [],
  totalAmount: 0,
  activeMembers: [],
  isLoading: false,
  error: null,

  // Fetch all donations (for president - manage page)
  fetchAllDonations: async () => {
    set({ isLoading: true, error: null });
    try {
      const donations = await donationService.getAllDonations();
      const totalAmount = await donationService.getTotalAmount();
      set({ donations, totalAmount, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '후원 내역을 불러오는데 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Fetch donations summary (for members - view page)
  fetchDonationsSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const summary = await donationService.getDonationsSummary();
      const totalAmount = await donationService.getTotalAmount();
      set({ summary, totalAmount, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '후원 요약 정보를 불러오는데 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Fetch active members for donor selection
  fetchActiveMembers: async () => {
    try {
      const activeMembers = await donationService.getActiveMembers();
      set({ activeMembers });
    } catch (error) {
      console.error('활성 회원 목록 로드 실패:', error);
    }
  },

  // Create new donation
  createDonation: async (input: CreateDonationInput) => {
    set({ isLoading: true, error: null });
    try {
      await donationService.createDonation(input);
      // Refresh donations list
      await get().fetchAllDonations();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '후원 내역 등록에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update donation
  updateDonation: async (id: string, amount: number) => {
    set({ isLoading: true, error: null });
    try {
      await donationService.updateDonation(id, amount);
      // Refresh donations list
      await get().fetchAllDonations();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '후원 내역 수정에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Delete donation
  deleteDonation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await donationService.deleteDonation(id);
      // Refresh donations list
      await get().fetchAllDonations();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '후원 내역 삭제에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
