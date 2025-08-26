// src/lib/services/dailyTasks.ts

import { supabase } from "../supabase";
import type { User } from "@supabase/supabase-js"; // Corretto l'import del tipo

// Interfacce per i valori nei record storici
interface TaskValue {
  completed: boolean;
  completed_at: string | null;
  target_value?: number;
  actual_value?: number;
  notes?: string;
}

export interface DailyTask {
  id: string;
  user_id: string;
  trio_id: string;
  task_date: string;
  task_type: string;
  completed: boolean;
  completed_at: string | null;
  target_value: number | null;
  actual_value: number | null;
  target_unit: string | null;
  notes: string | null;
  modified_at: string;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  user_id: string;
  action_type: "complete" | "uncomplete" | "modify" | "freeze";
  old_value: TaskValue; // Sostituito any con TaskValue
  new_value: TaskValue; // Sostituito any con TaskValue
  modified_at: string;
  modified_by: string;
  reason?: string;
}

export const dailyTasksService = {
  // Recupera i task per una data specifica
  async getDailyTasks(userId: string, date: Date): Promise<DailyTask[]> {
    const formattedDate = date.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("task_date", formattedDate);

    if (error) throw error;
    return data || [];
  },

  // Verifica se una data è modificabile (oggi o ieri prima delle 3:00)
  isDateEditable(date: Date): boolean {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(3, 0, 0, 0);

    return date >= yesterday && date <= now;
  },

  // Aggiorna lo stato di un task e registra la modifica
  async updateTaskStatus(
    taskId: string,
    completed: boolean,
    user: User,
    reason?: string
  ): Promise<void> {
    const { data: task, error: taskError } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError) throw taskError;

    // Verifica se la data è modificabile
    if (!this.isDateEditable(new Date(task.task_date))) {
      throw new Error("This task is no longer editable");
    }

    // Prepara i nuovi valori
    const now = new Date().toISOString();
    const newValues: TaskValue = {
      completed,
      completed_at: completed ? now : null,
    };

    // Aggiorna il task
    const { error: updateError } = await supabase
      .from("daily_tasks")
      .update({
        ...newValues,
        modified_at: now,
      })
      .eq("id", taskId);

    if (updateError) throw updateError;

    // Registra la modifica nello storico
    const oldValues: TaskValue = {
      completed: task.completed,
      completed_at: task.completed_at,
    };

    const { error: historyError } = await supabase
      .from("daily_tasks_history")
      .insert({
        task_id: taskId,
        user_id: task.user_id,
        action_type: completed ? "complete" : "uncomplete",
        old_value: oldValues,
        new_value: newValues,
        modified_by: user.id,
        reason,
      });

    if (historyError) throw historyError;
  },

  // Recupera lo storico delle modifiche per un task
  async getTaskHistory(taskId: string): Promise<TaskHistory[]> {
    const { data, error } = await supabase
      .from("daily_tasks_history")
      .select("*")
      .eq("task_id", taskId)
      .order("modified_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Recupera lo storico delle modifiche per un utente in un periodo
  async getUserHistory(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TaskHistory[]> {
    const { data, error } = await supabase
      .from("daily_tasks_history")
      .select("*, daily_tasks!inner(*)")
      .eq("user_id", userId)
      .gte("daily_tasks.task_date", startDate.toISOString().split("T")[0])
      .lte("daily_tasks.task_date", endDate.toISOString().split("T")[0])
      .order("modified_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
