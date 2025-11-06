import { create } from 'zustand';
import {
  postService,
  type CreatePostInput,
  type UpdatePostInput,
  type PostWithAuthor,
} from '@/services/postService';

interface PostStore {
  posts: PostWithAuthor[];
  selectedPost: PostWithAuthor | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPosts: () => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
  searchPosts: (query: string) => Promise<void>;
  createPost: (data: CreatePostInput, authorId: string) => Promise<void>;
  updatePost: (id: string, data: UpdatePostInput, userId: string) => Promise<void>;
  deletePost: (id: string, userId: string, userRole: string) => Promise<void>;
  clearError: () => void;
  clearSelectedPost: () => void;
}

export const usePostStore = create<PostStore>((set, get) => ({
  posts: [],
  selectedPost: null,
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    try {
      set({ isLoading: true, error: null });
      const posts = await postService.getPosts();
      set({ posts, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '게시글 목록을 불러오는데 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchPostById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const post = await postService.getPostById(id);
      set({ selectedPost: post, isLoading: false });

      // Update the post in the list if it exists
      const { posts } = get();
      const updatedPosts = posts.map((p) =>
        p.id === post.id ? post : p
      );
      set({ posts: updatedPosts });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '게시글을 불러오는데 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  searchPosts: async (query: string) => {
    try {
      set({ isLoading: true, error: null });
      const posts = await postService.searchPosts(query);
      set({ posts, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '게시글 검색에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createPost: async (data: CreatePostInput, authorId: string) => {
    try {
      set({ isLoading: true, error: null });
      await postService.createPost(data, authorId);

      // Refresh the posts list to include author info
      await get().fetchPosts();

      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '게시글 생성에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updatePost: async (id: string, data: UpdatePostInput, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      await postService.updatePost(id, data, userId);

      // Refresh the selected post to get updated data with author info
      await get().fetchPostById(id);

      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '게시글 수정에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deletePost: async (id: string, userId: string, userRole: string) => {
    try {
      set({ isLoading: true, error: null });
      await postService.deletePost(id, userId, userRole);

      // Remove the post from the list
      const { posts } = get();
      const updatedPosts = posts.filter((p) => p.id !== id);
      set({ posts: updatedPosts, selectedPost: null, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '게시글 삭제에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  clearSelectedPost: () => set({ selectedPost: null }),
}));