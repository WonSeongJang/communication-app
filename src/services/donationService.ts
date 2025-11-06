import { supabase } from '@/lib/supabase';
import type { Donation, User } from '@/lib/supabase';
import type {
  DonationWithDonor,
  DonationSummary,
  CreateDonationInput,
} from '@/types';

class DonationService {
  /**
   * Fetch all donations with donor info (for president - manage page)
   */
  async getAllDonations(): Promise<DonationWithDonor[]> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          donor:users!donor_id (
            name,
            generation
          )
        `)
        .order('donated_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('후원 내역을 불러오는데 실패했습니다:', error);
      throw new Error('후원 내역을 불러오는데 실패했습니다.');
    }
  }

  /**
   * Fetch donations summary grouped by donor (for members - view page)
   */
  async getDonationsSummary(): Promise<DonationSummary[]> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          donor_id,
          amount,
          donor:users!donor_id (
            name,
            generation
          )
        `);

      if (error) throw error;
      if (!data) return [];

      // Group by donor and sum amounts
      const summaryMap = new Map<string, DonationSummary>();

      data.forEach((donation: any) => {
        const donorId = donation.donor_id;
        const existing = summaryMap.get(donorId);

        if (existing) {
          existing.total_amount += donation.amount;
        } else {
          summaryMap.set(donorId, {
            donor_id: donorId,
            donor_name: donation.donor?.name || '알 수 없음',
            donor_generation: donation.donor?.generation || 0,
            total_amount: donation.amount,
          });
        }
      });

      // Sort by total amount descending
      return Array.from(summaryMap.values()).sort(
        (a, b) => b.total_amount - a.total_amount
      );
    } catch (error) {
      console.error('후원 요약 정보를 불러오는데 실패했습니다:', error);
      throw new Error('후원 요약 정보를 불러오는데 실패했습니다.');
    }
  }

  /**
   * Create new donation (president only)
   */
  async createDonation(input: CreateDonationInput): Promise<Donation> {
    try {
      const donationData = {
        donor_id: input.donor_id,
        amount: input.amount,
        donated_at: input.donated_at || new Date().toISOString(),
      };

      const { data: donation, error } = await supabase
        .from('donations')
        .insert(donationData)
        .select()
        .single();

      if (error) throw error;
      if (!donation) throw new Error('후원 내역 등록에 실패했습니다.');

      return donation;
    } catch (error) {
      console.error('후원 내역 등록 실패:', error);
      throw new Error('후원 내역 등록에 실패했습니다.');
    }
  }

  /**
   * Update donation amount (president only)
   */
  async updateDonation(id: string, amount: number): Promise<Donation> {
    try {
      const { data: donation, error } = await supabase
        .from('donations')
        .update({
          amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!donation) throw new Error('후원 내역 수정에 실패했습니다.');

      return donation;
    } catch (error) {
      console.error('후원 내역 수정 실패:', error);
      throw new Error('후원 내역 수정에 실패했습니다.');
    }
  }

  /**
   * Delete donation (president only)
   */
  async deleteDonation(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('donations').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('후원 내역 삭제 실패:', error);
      throw new Error('후원 내역 삭제에 실패했습니다.');
    }
  }

  /**
   * Get active members for donor selection (president only)
   */
  async getActiveMembers(): Promise<Pick<User, 'id' | 'name' | 'generation' | 'email'>[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, generation, email')
        .eq('status', 'active')
        .order('generation', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('활성 회원 목록을 불러오는데 실패했습니다:', error);
      throw new Error('활성 회원 목록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * Calculate total donation amount
   */
  async getTotalAmount(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('amount');

      if (error) throw error;
      if (!data) return 0;

      return data.reduce((sum, donation) => sum + donation.amount, 0);
    } catch (error) {
      console.error('총 후원 금액을 계산하는데 실패했습니다:', error);
      return 0;
    }
  }
}

export const donationService = new DonationService();
