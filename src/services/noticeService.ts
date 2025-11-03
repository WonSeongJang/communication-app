import { supabase } from '@/lib/supabase';
import type { Notice } from '@/types';

export interface CreateNoticeInput {
  title: string;
  content: string;
  isPinned?: boolean;
  attachments?: string[];
}

export interface UpdateNoticeInput {
  title?: string;
  content?: string;
  isPinned?: boolean;
  attachments?: string[];
}

class NoticeService {
  /**
   * Fetch all notices (pinned first, then by created_at DESC)
   */
  async getNotices(): Promise<Notice[]> {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('공지사항 목록을 불러오는데 실패했습니다:', error);
      throw new Error('공지사항 목록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * Fetch single notice and mark as viewed
   */
  async getNoticeById(id: string, userId: string): Promise<Notice> {
    try {
      // Fetch the notice
      const { data: notice, error: fetchError } = await supabase
        .from('notices')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!notice) throw new Error('공지사항을 찾을 수 없습니다.');

      // Update viewed_by if user hasn't viewed it yet
      if (!notice.viewed_by.includes(userId)) {
        const updatedViewedBy = [...notice.viewed_by, userId];

        const { error: updateError } = await supabase
          .from('notices')
          .update({ viewed_by: updatedViewedBy })
          .eq('id', id);

        if (updateError) {
          console.error('조회수 업데이트 실패:', updateError);
          // Don't throw - viewing is more important than tracking
        }

        // Return updated notice
        return { ...notice, viewed_by: updatedViewedBy };
      }

      return notice;
    } catch (error) {
      console.error('공지사항을 불러오는데 실패했습니다:', error);
      throw new Error('공지사항을 불러오는데 실패했습니다.');
    }
  }

  /**
   * Create notice (president only)
   */
  async createNotice(data: CreateNoticeInput, authorId: string): Promise<Notice> {
    try {
      const noticeData = {
        author_id: authorId,
        title: data.title.trim(),
        content: data.content.trim(),
        attachments: data.attachments || [],
        is_pinned: data.isPinned || false,
        viewed_by: [],
      };

      const { data: notice, error } = await supabase
        .from('notices')
        .insert(noticeData)
        .select()
        .single();

      if (error) throw error;
      if (!notice) throw new Error('공지사항 생성에 실패했습니다.');

      return notice;
    } catch (error) {
      console.error('공지사항 생성 실패:', error);
      throw new Error('공지사항 생성에 실패했습니다.');
    }
  }

  /**
   * Update notice (president only)
   */
  async updateNotice(id: string, data: UpdateNoticeInput): Promise<Notice> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.title !== undefined) {
        updateData.title = data.title.trim();
      }
      if (data.content !== undefined) {
        updateData.content = data.content.trim();
      }
      if (data.isPinned !== undefined) {
        updateData.is_pinned = data.isPinned;
      }
      if (data.attachments !== undefined) {
        updateData.attachments = data.attachments;
      }

      const { data: notice, error } = await supabase
        .from('notices')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!notice) throw new Error('공지사항 수정에 실패했습니다.');

      return notice;
    } catch (error) {
      console.error('공지사항 수정 실패:', error);
      throw new Error('공지사항 수정에 실패했습니다.');
    }
  }

  /**
   * Delete notice (president only)
   */
  async deleteNotice(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      throw new Error('공지사항 삭제에 실패했습니다.');
    }
  }

  /**
   * Toggle pin status
   */
  async togglePin(id: string, isPinned: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('notices')
        .update({
          is_pinned: isPinned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('고정 상태 변경 실패:', error);
      throw new Error('고정 상태 변경에 실패했습니다.');
    }
  }

  /**
   * Get author name for a notice
   */
  async getAuthorName(authorId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('id', authorId)
        .single();

      if (error) throw error;
      return data?.name || '알 수 없음';
    } catch (error) {
      console.error('작성자 정보 조회 실패:', error);
      return '알 수 없음';
    }
  }
}

export const noticeService = new NoticeService();
