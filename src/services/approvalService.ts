import { supabase } from '@/lib/supabase';

/**
 * PendingUser type definition for approval operations
 */
export interface PendingUser {
  id: string;
  email: string;
  name: string;
  generation: number;
  occupation: string;
  phone: string;
  messenger_id: string | null;
  profile_image: string | null;
  created_at: string;
  email_confirmed_at: string | null;
}

/**
 * Bulk operation result type
 */
export interface BulkOperationResult {
  success: number;
  failed: number;
}

/**
 * ApprovalService handles all member approval-related database operations
 *
 * Features:
 * - Fetch pending users awaiting approval
 * - Approve/reject individual users
 * - Bulk approve/reject multiple users (max 50 at once)
 * - Proper error handling and validation
 */
class ApprovalService {
  private readonly MAX_BULK_USERS = 50;

  /**
   * Validates user ID is a non-empty string
   */
  private validateUserId(userId: string, fieldName: string = 'userId'): void {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error(`Invalid ${fieldName}: must be a non-empty string`);
    }
  }

  /**
   * Validates array of user IDs for bulk operations
   */
  private validateUserIds(userIds: string[]): void {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('User IDs array cannot be empty');
    }

    if (userIds.length > this.MAX_BULK_USERS) {
      throw new Error(`Cannot process more than ${this.MAX_BULK_USERS} users at once. Received: ${userIds.length}`);
    }

    userIds.forEach((id, index) => {
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new Error(`Invalid user ID at index ${index}: must be a non-empty string`);
      }
    });
  }

  /**
   * Fetch all users with status='pending', ordered by created_at DESC
   * Email verification status is now stored in users table
   *
   * @returns Array of pending users awaiting approval
   * @throws Error if database query fails
   */
  async getPendingUsers(): Promise<PendingUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, generation, occupation, phone, messenger_id, profile_image, created_at, email_confirmed_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch pending users: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while fetching pending users');
    }
  }

  /**
   * Approve a single user
   * Updates status to 'active', sets approved_at timestamp, approved_by user ID, and optional note
   *
   * @param userId - ID of the user to approve
   * @param approverId - ID of the user performing the approval
   * @param note - Optional approval note
   * @throws Error if validation fails or database update fails
   */
  async approveUser(userId: string, approverId: string, note?: string): Promise<void> {
    try {
      this.validateUserId(userId, 'userId');
      this.validateUserId(approverId, 'approverId');

      const updateData: Record<string, any> = {
        status: 'active',
        approved_at: new Date().toISOString(),
        approved_by: approverId,
      };

      if (note && note.trim().length > 0) {
        updateData.approval_note = note.trim();
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .eq('status', 'pending'); // Only update if user is currently pending

      if (error) {
        throw new Error(`Failed to approve user ${userId}: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Unknown error occurred while approving user ${userId}`);
    }
  }

  /**
   * Reject a single user
   * Updates status to 'rejected', sets rejected_at timestamp, rejected_by user ID, and optional note
   *
   * @param userId - ID of the user to reject
   * @param rejecterId - ID of the user performing the rejection
   * @param note - Optional rejection note
   * @throws Error if validation fails or database update fails
   */
  async rejectUser(userId: string, rejecterId: string, note?: string): Promise<void> {
    try {
      this.validateUserId(userId, 'userId');
      this.validateUserId(rejecterId, 'rejecterId');

      const updateData: Record<string, any> = {
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: rejecterId,
      };

      if (note && note.trim().length > 0) {
        updateData.rejection_note = note.trim();
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .eq('status', 'pending'); // Only update if user is currently pending

      if (error) {
        throw new Error(`Failed to reject user ${userId}: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Unknown error occurred while rejecting user ${userId}`);
    }
  }

  /**
   * Bulk approve multiple users (max 50 at once)
   *
   * @param userIds - Array of user IDs to approve
   * @param approverId - ID of the user performing the approvals
   * @param note - Optional approval note applied to all users
   * @returns Object containing success and failed counts
   * @throws Error if validation fails
   */
  async bulkApprove(userIds: string[], approverId: string, note?: string): Promise<BulkOperationResult> {
    try {
      this.validateUserIds(userIds);
      this.validateUserId(approverId, 'approverId');

      const updateData: Record<string, any> = {
        status: 'active',
        approved_at: new Date().toISOString(),
        approved_by: approverId,
      };

      if (note && note.trim().length > 0) {
        updateData.approval_note = note.trim();
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .in('id', userIds)
        .eq('status', 'pending')
        .select('id');

      if (error) {
        throw new Error(`Failed to bulk approve users: ${error.message}`);
      }

      const successCount = data?.length || 0;
      const failedCount = userIds.length - successCount;

      return {
        success: successCount,
        failed: failedCount,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during bulk approval');
    }
  }

  /**
   * Bulk reject multiple users (max 50 at once)
   *
   * @param userIds - Array of user IDs to reject
   * @param rejecterId - ID of the user performing the rejections
   * @param note - Optional rejection note applied to all users
   * @returns Object containing success and failed counts
   * @throws Error if validation fails
   */
  async bulkReject(userIds: string[], rejecterId: string, note?: string): Promise<BulkOperationResult> {
    try {
      this.validateUserIds(userIds);
      this.validateUserId(rejecterId, 'rejecterId');

      const updateData: Record<string, any> = {
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: rejecterId,
      };

      if (note && note.trim().length > 0) {
        updateData.rejection_note = note.trim();
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .in('id', userIds)
        .eq('status', 'pending')
        .select('id');

      if (error) {
        throw new Error(`Failed to bulk reject users: ${error.message}`);
      }

      const successCount = data?.length || 0;
      const failedCount = userIds.length - successCount;

      return {
        success: successCount,
        failed: failedCount,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during bulk rejection');
    }
  }
}

// Export singleton instance
export const approvalService = new ApprovalService();

// Export class for testing purposes
export default ApprovalService;
