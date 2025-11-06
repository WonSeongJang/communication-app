import { supabase } from '@/lib/supabase';
import type { Post, User } from '@/lib/supabase';

export interface CreatePostInput {
  title: string;
  content: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
}

export interface PostWithAuthor extends Post {
  author?: User;
}

class PostService {
  /**
   * Fetch all posts (sorted by created_at DESC)
   */
  async getPosts(): Promise<PostWithAuthor[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users!author_id (
            id,
            name,
            generation
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('게시글 목록을 불러오는데 실패했습니다:', error);
      throw new Error('게시글 목록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * Fetch single post with author info
   */
  async getPostById(id: string): Promise<PostWithAuthor> {
    try {
      const { data: post, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users!author_id (
            id,
            name,
            generation,
            role
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!post) throw new Error('게시글을 찾을 수 없습니다.');

      return post;
    } catch (error) {
      console.error('게시글을 불러오는데 실패했습니다:', error);
      throw new Error('게시글을 불러오는데 실패했습니다.');
    }
  }

  /**
   * Create post (any authenticated user)
   */
  async createPost(data: CreatePostInput, authorId: string): Promise<Post> {
    try {
      const postData = {
        author_id: authorId,
        title: data.title.trim(),
        content: data.content.trim(),
        likes: 0,
        comment_count: 0,
      };

      const { data: post, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;
      if (!post) throw new Error('게시글 생성에 실패했습니다.');

      return post;
    } catch (error) {
      console.error('게시글 생성 실패:', error);
      throw new Error('게시글 생성에 실패했습니다.');
    }
  }

  /**
   * Update post (author only)
   */
  async updatePost(id: string, data: UpdatePostInput, userId: string): Promise<Post> {
    try {
      // First check if the user is the author
      const { data: existingPost, error: checkError } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', id)
        .single();

      if (checkError) throw checkError;
      if (!existingPost) throw new Error('게시글을 찾을 수 없습니다.');
      if (existingPost.author_id !== userId) {
        throw new Error('본인이 작성한 게시글만 수정할 수 있습니다.');
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.title !== undefined) {
        updateData.title = data.title.trim();
      }
      if (data.content !== undefined) {
        updateData.content = data.content.trim();
      }

      const { data: post, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!post) throw new Error('게시글 수정에 실패했습니다.');

      return post;
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '게시글 수정에 실패했습니다.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete post (author or president only)
   */
  async deletePost(id: string, userId: string, userRole: string): Promise<void> {
    try {
      // If not president, check if user is the author
      if (userRole !== 'president') {
        const { data: existingPost, error: checkError } = await supabase
          .from('posts')
          .select('author_id')
          .eq('id', id)
          .single();

        if (checkError) throw checkError;
        if (!existingPost) throw new Error('게시글을 찾을 수 없습니다.');
        if (existingPost.author_id !== userId) {
          throw new Error('본인이 작성한 게시글만 삭제할 수 있습니다.');
        }
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '게시글 삭제에 실패했습니다.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Search posts by title or content
   */
  async searchPosts(query: string): Promise<PostWithAuthor[]> {
    try {
      if (!query.trim()) {
        return this.getPosts();
      }

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users!author_id (
            id,
            name,
            generation
          )
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('게시글 검색 실패:', error);
      throw new Error('게시글 검색에 실패했습니다.');
    }
  }
}

export const postService = new PostService();