import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  dailyTasksService,
  type DailyTask as DbDailyTask,
} from "../../lib/services/dailyTasks";
import { supabase } from "../../lib/supabase";

interface Task extends DbDailyTask {
  name: string;
  emoji: string;
  description: string;
}

interface DailyCheckInProps {
  onTasksUpdated?: (completedCount: number, totalCount: number) => void;
  date?: Date;
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
  const [isEditable, setIsEditable] = useState(false);

  // Formatta la data in modo leggibile
  const formattedDate = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  // Formatta la data per il database (YYYY-MM-DD)
  const formattedDateForDB = date.toISOString().split("T")[0];

  // Estrai updateCompletionStats in una funzione useCallback
  const updateCompletionStats = useCallback(
    (currentTasks: Task[]) => {
      if (onTasksUpdated) {
        const completedCount = currentTasks.filter((t) => t.completed).length;
        onTasksUpdated(completedCount, currentTasks.length);
      }
    },
    [onTasksUpdated]
  );

  // Aggiunge metadati UI aos task dal database
  const enrichTasksWithUIData = useCallback(
    (dbTasks: DbDailyTask[]): Task[] => {
      return dbTasks.map((task) => {
        let name = "";
        let emoji = "";
        let description = "";

        switch (task.task_type) {
          case "deficit_calorico":
            name = "Deficit Calorico";
            emoji = "🍽️";
            description = "Mantieni un deficit calorico";
            break;
          case "protein_target":
            name = "Protein Target";
            emoji = "💪";
            description = "Raggiungi il tuo target proteico";
            break;
          case "hydration":
            name = "Hydration";
            emoji = "💧";
            description = "Bevi almeno 2.5 litri di acqua";
            break;
          case "meal_logging":
            name = "Meal Logging";
            emoji = "📝";
            description = "Registra tutti i tuoi pasti";
            break;
          case "sleep_quality":
            name = "Sleep Quality";
            emoji = "😴";
            description = "Dormi almeno 8 ore";
            break;
          case "steps":
            name = "Steps";
            emoji = "👟";
            description = "Raggiungi min. 8000 passi";
            break;
          case "cardio":
            name = "Cardio";
            emoji = "❤️";
            description = "Completa min. 20 min di cardio";
            break;
          default:
            name = task.task_type;
            emoji = "✅";
            description = "";
        }

        return {
          ...task,
          name,
          emoji,
          description,
        } as Task;
      });
    },
    []
  );

  // Crea i task predefiniti per una nuova giornata
  const createDefaultDailyTasks = async (
    userId: string,
    trioId: string,
    dateString: string
  ): Promise<DbDailyTask[]> => {
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
        target_value: 2.5,
        actual_value: null,
        target_unit: "litri",
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
        target_value: 8,
        actual_value: null,
        target_unit: "ore",
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
        actual_value: null,
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
        actual_value: null,
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

    return data || [];
  };

  // Recupera i task dal database
  useEffect(() => {
    if (isInitialized || !user) return;

    const fetchTasks = async () => {
      setLoading(true);

      try {
        setIsEditable(dailyTasksService.isDateEditable(date));

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

        // Recupera i task giornalieri
        const data = await dailyTasksService.getDailyTasks(user.id, date);

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
    date,
    formattedDateForDB,
    updateCompletionStats,
    enrichTasksWithUIData,
    isInitialized,
  ]);

  // Gestisce il toggle dei task
  const toggleTask = async (taskId: string) => {
    if (!user || !isEditable) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setSaving(true);

    try {
      await dailyTasksService.updateTaskStatus(taskId, !task.completed);

      // Aggiorna l'UI
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      setTasks(updatedTasks);
      updateCompletionStats(updatedTasks);
    } catch (err) {
      console.error("Error saving task:", err);
      // Gestione corretta dell'errore di tipo unknown
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Non mostrare errore se è solo un doppio click (stato identico)
      if (!errorMessage.includes("no longer editable")) {
        setError("Errore nel salvataggio dei dati");
      }
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
            <button
              onClick={() => toggleTask(task.id)}
              disabled={!isEditable}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm transition-colors duration-200 ${
                task.completed
                  ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                  : isEditable
                  ? "bg-gray-200/80 text-gray-400 hover:bg-gray-300"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              {task.completed ? "✓" : ""}
            </button>
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-lg">{task.emoji}</span>
              <div className="flex flex-col">
                <span
                  className={task.completed ? "text-gray-900" : "text-gray-500"}
                >
                  {task.name}
                </span>
                <span className="text-xs text-gray-500">
                  {task.description}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isEditable && (
        <div className="text-sm text-gray-500 text-center mt-4">
          ℹ️ Tasks can only be modified on the same day or before 3:00 AM the
          next day
        </div>
      )}
    </div>
  );
};
