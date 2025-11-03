import { createClient } from '@supabase/supabase-js';

// Supabase URL and Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// Database Types (will be updated after schema creation)
export type Tables = {
  users: {
    id: string;
    email: string;
    name: string;
    generation: number;
    occupation: string;
    phone: string;
    messenger_id: string | null;
    profile_image: string | null;
    role: 'president' | 'member';
    status: 'pending' | 'active' | 'inactive' | 'deleted';
    created_at: string;
    approved_at: string | null;
  };
  notices: {
    id: string;
    author_id: string;
    title: string;
    content: string;
    attachments: string[];
    is_pinned: boolean;
    viewed_by: string[];
    created_at: string;
    updated_at: string;
  };
  posts: {
    id: string;
    author_id: string;
    title: string;
    content: string;
    likes: number;
    comment_count: number;
    created_at: string;
    updated_at: string;
  };
  donations: {
    id: string;
    donor_id: string;
    amount: number;
    donated_at: string;
    created_at: string;
    updated_at: string;
  };
  comments: {
    id: string;
    post_id: string;
    post_type: 'notice' | 'post';
    author_id: string;
    content: string;
    created_at: string;
    updated_at: string;
  };
};

// Helper types
export type User = Tables['users'];
export type Notice = Tables['notices'];
export type Post = Tables['posts'];
export type Donation = Tables['donations'];
export type Comment = Tables['comments'];
