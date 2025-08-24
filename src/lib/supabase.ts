import { createClient } from "@supabase/supabase-js";

// ✅ Leggi le credenziali dalle variabili di ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "🚨 Missing Supabase credentials! Please check your .env.local file:\n" +
      "- VITE_SUPABASE_URL\n" +
      "- VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipi per il database (basati sul documento)
export interface UserProfile {
  id: string;
  email: string;
  name: string; // Changed from 'full_name' to 'name'
  age?: number;
  languages?: string[];
  weight_goal?: string;
  fitness_level?: string;
  created_at: string;
  updated_at: string;
}

export interface MatchingPreferences {
  id: string;
  user_id: string;
  age_min?: number;
  age_max?: number;
  languages: string[];
  fitness_level: string;
  weight_goal: string;
  created_at: string;
}

export interface UserMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  user3_id: string;
  status: "pending" | "active" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "match_found" | "trio_completed" | "reminder" | "system";
  is_read: boolean;
  created_at: string;
}

// 🆕 Matching System Types (basati sul tuo schema database)
export interface MatchingQueueEntry {
  id: string;
  user_id: string;
  priority: number;
  wait_time_hours: number;
  status: "active" | "paused" | "matched";
  flexible_age_range: boolean;
  flexible_fitness_level: boolean;
  flexible_goal: boolean;
  preferred_times?: string[];
  timezone_preference?: string;
  waiting_notification_sent: boolean;
  progress_notification_sent: boolean;
  extended_wait_notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

// 🆕 Matching Service Functions
export const matchingService = {
  // Add user to matching queue
  async addToQueue(userId: string): Promise<MatchingQueueEntry> {
    const { data, error } = await supabase
      .from("matching_queue")
      .insert({
        user_id: userId,
        status: "active",
        priority: 100,
        wait_time_hours: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Find compatible matches
  async findMatches(userData: {
    weight_goal: string;
    fitness_level: string;
    age: number;
    languages: string[];
    userId: string;
  }): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("matching_status", "available")
      .eq("weight_goal", userData.weight_goal)
      .eq("fitness_level", userData.fitness_level)
      .neq("id", userData.userId)
      .gte("age", userData.age - 10) // ±10 years age range
      .lte("age", userData.age + 10)
      .overlaps("languages", userData.languages) // Common language
      .limit(2);

    if (error) throw error;
    return data || [];
  },

  // Get queue position
  async getQueuePosition(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("matching_queue")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .lt(
        "created_at",
        (
          await supabase
            .from("matching_queue")
            .select("created_at")
            .eq("user_id", userId)
            .single()
        ).data?.created_at || new Date().toISOString()
      );

    if (error) throw error;
    return (count || 0) + 1;
  },

  // Update matching status
  async updateMatchingStatus(
    userId: string,
    status: "available" | "matching" | "in_trio"
  ): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({
        matching_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;
  },

  // Update queue wait time (called by cron job every 30 min)
  async updateWaitTimes(): Promise<void> {
    const { error } = await supabase.rpc("update_queue_wait_times");
    if (error) throw error;
  },
};
