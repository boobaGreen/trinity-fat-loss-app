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
  // Add user to matching queue (prevent duplicates)
  async addToQueue(userId: string): Promise<MatchingQueueEntry> {
    // First, clean any existing duplicate entries
    await this.cleanDuplicateEntries(userId);

    // Check if user is already in active queue
    const { data: existing, error: existingError } = await supabase
      .from("matching_queue")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingError) throw existingError;

    // If user already exists in queue, return existing entry
    if (existing && existing.length > 0) {
      console.log("🔄 User already in queue, returning existing entry");
      return existing[0];
    }

    // Create new queue entry
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
    console.log("✅ New queue entry created");
    return data;
  },

  // Clean duplicate queue entries for a user (keep only the most recent)
  async cleanDuplicateEntries(userId: string): Promise<void> {
    // Get all entries for user, ordered by creation time (newest first)
    const { data: entries, error: fetchError } = await supabase
      .from("matching_queue")
      .select("id, created_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;
    if (!entries || entries.length <= 1) return; // No duplicates to clean

    // Keep the first (newest) entry, delete the rest
    const entriesToDelete = entries.slice(1).map((entry) => entry.id);

    if (entriesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("matching_queue")
        .delete()
        .in("id", entriesToDelete);

      if (deleteError) throw deleteError;
      console.log(
        `🧹 Cleaned ${entriesToDelete.length} duplicate queue entries`
      );
    }
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
    // First get user's creation time (use limit(1) instead of single() to handle duplicates)
    const { data: userData, error: userError } = await supabase
      .from("matching_queue")
      .select("created_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (userError) throw userError;
    if (!userData || userData.length === 0) return 0;

    const userCreatedAt = userData[0].created_at;

    // Then count users created before this user
    const { count, error } = await supabase
      .from("matching_queue")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .lt("created_at", userCreatedAt);

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

  // Remove user from matching queue
  async removeFromQueue(userId: string): Promise<void> {
    const { error } = await supabase
      .from("matching_queue")
      .delete()
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) throw error;
    console.log("🗑️ User removed from matching queue");
  },

  // Update queue wait time (called by cron job every 30 min)
  async updateWaitTimes(): Promise<void> {
    const { error } = await supabase.rpc("update_queue_wait_times");
    if (error) throw error;
  },
};
