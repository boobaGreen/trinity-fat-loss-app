import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

interface Task {
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
  // Metadati UI che teniamo in memoria
  name: string;
  emoji: string;
  type: "boolean" | "number";
}

// Interface per i task dal database
interface DbTask {
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
  reminder_sent?: boolean;
  celebration_notification_sent?: boolean;
  [key: string]: unknown; // Per altri campi che potrebbero essere presenti
}

interface DailyCheckInProps {
  onTasksUpdated?: (completedCount: number, totalCount: number) => void;
  date?: Date; // Opzionale, default a oggi
}

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  onTasksUpdated,
  date = new Date(),
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Formatta la data in modo leggibile
  const formattedDate = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  // Formatta la data per il database (YYYY-MM-DD)
  const formattedDateForDB = date.toISOString().split("T")[0];

  // Estrai updateCompletionStats in una funzione useCallback per evitare l'avviso di dipendenze
  const updateCompletionStats = useCallback(
    (currentTasks: Task[]) => {
      if (onTasksUpdated) {
        const completedCount = currentTasks.filter((t) => t.completed).length;
        onTasksUpdated(completedCount, currentTasks.length);
      }
    },
    [onTasksUpdated]
  );

  // Aggiunge metadati UI ai task dal database
  const enrichTasksWithUIData = useCallback((dbTasks: DbTask[]): Task[] => {
    return dbTasks.map((task) => {
      // Metadati UI basati sul tipo di task
      let name = "";
      let emoji = "";
      let type: "boolean" | "number" = "boolean";

      switch (task.task_type) {
        case "deficit_calorico":
          name = "Deficit Calorico";
          emoji = "🍽️";
          break;
        case "protein_target":
          name = "Protein Target";
          emoji = "💪";
          break;
        case "hydration":
          name = "Hydration";
          emoji = "💧";
          break;
        case "meal_logging":
          name = "Meal Logging";
          emoji = "📝";
          break;
        case "sleep_quality":
          name = "Sleep Quality";
          emoji = "😴";
          break;
        case "steps":
          name = "Steps";
          emoji = "👟";
          type = "number";
          break;
        case "cardio":
          name = "Cardio";
          emoji = "❤️";
          type = "number";
          break;
        default:
          name = task.task_type;
          emoji = "✅";
      }

      return {
        ...task,
        name,
        emoji,
        type,
      } as Task;
    });
  }, []);

  // Crea i task predefiniti per una nuova giornata
  const createDefaultDailyTasks = async (
    userId: string,
    trioId: string,
    dateString: string
  ): Promise<DbTask[]> => {
    const defaultTasks = [
      {
        user_id: userId,
        trio_id: trioId,
        task_date: dateString,
        task_type: "deficit_calorico",
        completed: false,
        completed_at: null,
        target_value: null,
        actual_value: null,
        target_unit: null,
        notes: null,
        reminder_sent: false,
        celebration_notification_sent: false,
      },
      {
        user_id: userId,
        trio_id: trioId,
        task_date: dateString,
        task_type: "protein_target",
        completed: false,
        completed_at: null,
        target_value: null,
        actual_value: null,
        target_unit: null,
        notes: null,
        reminder_sent: false,
        celebration_notification_sent: false,
      },
      {
        user_id: userId,
        trio_id: trioId,
        task_date: dateString,
        task_type: "hydration",
        completed: false,
        completed_at: null,
        target_value: null,
        actual_value: null,
        target_unit: null,
        notes: null,
        reminder_sent: false,
        celebration_notification_sent: false,
      },
      {
        user_id: userId,
        trio_id: trioId,
        task_date: dateString,
        task_type: "meal_logging",
        completed: false,
        completed_at: null,
        target_value: null,
        actual_value: null,
        target_unit: null,
        notes: null,
        reminder_sent: false,
        celebration_notification_sent: false,
      },
      {
        user_id: userId,
        trio_id: trioId,
        task_date: dateString,
        task_type: "sleep_quality",
        completed: false,
        completed_at: null,
        target_value: null,
        actual_value: null,
        target_unit: null,
        notes: null,
        reminder_sent: false,
        celebration_notification_sent: false,
      },
      {
        user_id: userId,
        trio_id: trioId,
        task_date: dateString,
        task_type: "steps",
        completed: false,
        completed_at: null,
        target_value: 8000,
        actual_value: 0,
        target_unit: "steps",
        notes: null,
        reminder_sent: false,
        celebration_notification_sent: false,
      },
      {
        user_id: userId,
        trio_id: trioId,
        task_date: dateString,
        task_type: "cardio",
        completed: false,
        completed_at: null,
        target_value: 20,
        actual_value: 0,
        target_unit: "min",
        notes: null,
        reminder_sent: false,
        celebration_notification_sent: false,
      },
    ];

    const { data, error } = await supabase
      .from("daily_tasks")
      .insert(defaultTasks)
      .select();

    if (error) throw error;

    return data as DbTask[];
  };

  // Recupera i task dal database
  useEffect(() => {
    // Evita chiamate multiple
    if (isInitialized || !user) return;

    const fetchTasks = async () => {
      setLoading(true);

      try {
        // Recupera il trio_id dell'utente
        const { data: userProfile, error: userError } = await supabase
          .from("users")
          .select("current_trio_id")
          .eq("id", user.id)
          .single();

        if (userError) throw userError;
        if (!userProfile?.current_trio_id) {
          throw new Error("Utente non associato ad un trio");
        }

        // Recupera i task giornalieri per l'utente e la data specificata
        const { data, error } = await supabase
          .from("daily_tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("task_date", formattedDateForDB);

        if (error) throw error;

        // Se non ci sono task per oggi, crea i task predefiniti
        if (!data || data.length === 0) {
          const defaultTasks = await createDefaultDailyTasks(
            user.id,
            userProfile.current_trio_id,
            formattedDateForDB
          );

          // Arricchisci i task con metadati UI
          const enrichedTasks = enrichTasksWithUIData(defaultTasks);
          setTasks(enrichedTasks);
          updateCompletionStats(enrichedTasks);
        } else {
          // Arricchisci i task esistenti con metadati UI
          const enrichedTasks = enrichTasksWithUIData(data);
          setTasks(enrichedTasks);
          updateCompletionStats(enrichedTasks);
        }
      } catch (err) {
        console.error("Errore nel recupero task:", err);
        setError("Impossibile caricare i task giornalieri");
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    fetchTasks();
  }, [
    user,
    formattedDateForDB,
    updateCompletionStats,
    enrichTasksWithUIData,
    isInitialized,
  ]);

  // Gestisce il toggle dei task booleani
  const toggleTask = async (taskId: string) => {
    if (!user) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.type !== "boolean") return;

    const updatedTask = {
      ...task,
      completed: !task.completed,
      completed_at: !task.completed ? new Date().toISOString() : null,
    };

    // Aggiorna l'UI immediatamente
    const updatedTasks = tasks.map((t) => (t.id === taskId ? updatedTask : t));

    setTasks(updatedTasks);
    updateCompletionStats(updatedTasks);

    // Salva nel database
    setSaving(true);

    try {
      const { error } = await supabase
        .from("daily_tasks")
        .update({
          completed: updatedTask.completed,
          completed_at: updatedTask.completed_at,
        })
        .eq("id", taskId);

      if (error) throw error;
    } catch (err) {
      console.error("Error saving task:", err);
      setError("Errore nel salvataggio dei dati");

      // Ripristina lo stato precedente in caso di errore
      setTasks(tasks);
      updateCompletionStats(tasks);
    } finally {
      setSaving(false);
    }
  };

  // Gestisce l'aggiornamento dei task numerici
  const updateNumericTask = async (taskId: string, value: number) => {
    if (!user) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.type !== "number") return;

    const target = task.target_value || 0;
    const completed = value >= target;

    const updatedTask = {
      ...task,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      actual_value: value,
    };

    // Aggiorna l'UI immediatamente
    const updatedTasks = tasks.map((t) => (t.id === taskId ? updatedTask : t));

    setTasks(updatedTasks);
    updateCompletionStats(updatedTasks);

    // Salva nel database
    setSaving(true);

    try {
      const { error } = await supabase
        .from("daily_tasks")
        .update({
          completed: updatedTask.completed,
          completed_at: updatedTask.completed_at,
          actual_value: updatedTask.actual_value,
        })
        .eq("id", taskId);

      if (error) throw error;
    } catch (err) {
      console.error("Error saving task:", err);
      setError("Errore nel salvataggio dei dati");

      // Ripristina lo stato precedente in caso di errore
      setTasks(tasks);
      updateCompletionStats(tasks);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-pulse text-blue-500">Caricamento tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
        <button
          className="ml-2 underline"
          onClick={() => window.location.reload()}
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">📋 Daily Check-In</h3>
        <span className="text-sm text-gray-500">{formattedDate}</span>
        {saving && (
          <span className="text-xs text-blue-500 animate-pulse">
            Salvando...
          </span>
        )}
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center space-x-3">
            {task.type === "boolean" ? (
              <>
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm transition-colors duration-200 ${
                    task.completed
                      ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                      : "bg-gray-200/80 text-gray-400 hover:bg-gray-300"
                  }`}
                >
                  {task.completed ? "✓" : ""}
                </button>
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-lg">{task.emoji}</span>
                  <span
                    className={
                      task.completed ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {task.name}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm ${
                    task.completed
                      ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                      : "bg-gray-200/80 text-gray-400"
                  }`}
                >
                  {task.completed ? "✓" : ""}
                </div>
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-lg">{task.emoji}</span>
                  <span className="text-gray-900">{task.name}</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={task.actual_value || 0}
                    onChange={(e) =>
                      updateNumericTask(task.id, parseInt(e.target.value) || 0)
                    }
                    className="w-16 h-8 rounded border border-gray-300 text-center text-sm"
                    min="0"
                    max={task.target_value ? task.target_value * 2 : 9999}
                  />
                  <span className="ml-1 text-sm text-gray-500">
                    /{task.target_value} {task.target_unit}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
