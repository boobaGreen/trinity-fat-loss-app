import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

interface WeeklyGoal {
  id: string;
  task_type: string;
  completed: boolean;
  data: {
    category: string;
    description: string;
    emoji: string;
  };
}

interface WeeklyProgress {
  id: string;
  data: {
    start: number | null;
    current: number | null;
    change: number | null;
    weekNumber: number;
    weekStartDate: string;
    weekEndDate: string;
  };
}

interface WeeklyReflection {
  id: string;
  data: {
    text: string;
  };
}

interface WeeklyTask {
  id: string;
  user_id: string;
  trio_id: string;
  week_start: string;
  task_type: string;
  completed: boolean;
  completion_date: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

interface WeeklyCheckInProps {
  onClose?: () => void;
}

export const WeeklyCheckIn: React.FC<WeeklyCheckInProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [progress, setProgress] = useState<WeeklyProgress | null>(null);
  const [reflection, setReflection] = useState<WeeklyReflection | null>(null);
  const [weight, setWeight] = useState<number | "">("");
  const [reflectionText, setReflectionText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [weekStartDate] = useState<Date>(getWeekStartDate()); // Rimuoviamo setWeekStartDate che non viene usato

  // Funzione per calcolare la data di inizio settimana (lunedì)
  function getWeekStartDate(): Date {
    const today = new Date();
    const day = today.getDay();
    // Calcola lunedì della settimana corrente (considerando lunedì = 1, domenica = 0)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  // Formatta la data per il database (YYYY-MM-DD)
  const formattedWeekStart = weekStartDate.toISOString().split("T")[0];

  // Recupera i dati dal database
  useEffect(() => {
    const fetchWeeklyData = async () => {
      if (!user) return;

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

        // Recupera i task settimanali per l'utente e la settimana specificata
        const { data, error } = await supabase
          .from("weekly_tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("week_start", formattedWeekStart);

        if (error) throw error;

        // Se non ci sono task per questa settimana, crea i task predefiniti
        if (!data || data.length === 0) {
          const defaultTasks = await createDefaultWeeklyTasks(
            user.id,
            userProfile.current_trio_id,
            formattedWeekStart
          );

          // Organizza i dati
          processWeeklyTasks(defaultTasks);
        } else {
          // Organizza i dati esistenti
          processWeeklyTasks(data);
        }
      } catch (err) {
        console.error("Errore nel recupero dei dati settimanali:", err);
        setError("Impossibile caricare i dati del check-in settimanale");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, [user, formattedWeekStart]);

  // Organizza i task settimanali nei vari stati
  const processWeeklyTasks = (tasks: WeeklyTask[]) => {
    // Invece di any, usiamo WeeklyTask[]
    // Filtra gli obiettivi
    const goalTasks = tasks.filter((task) =>
      [
        "nutrition_goal",
        "exercise_goal",
        "cardio_goal",
        "habits_goal",
      ].includes(task.task_type)
    );

    // Trova il task del peso
    const weightTask = tasks.find((task) => task.task_type === "weight");

    // Trova il task della riflessione
    const reflectionTask = tasks.find(
      (task) => task.task_type === "reflection"
    );

    setGoals(goalTasks as unknown as WeeklyGoal[]);

    if (weightTask) {
      setProgress(weightTask as unknown as WeeklyProgress);
      // Se c'è già un peso corrente, inizializza il campo weight
      if (weightTask.data?.current) {
        setWeight(weightTask.data.current);
      }
    }

    if (reflectionTask) {
      setReflection(reflectionTask as unknown as WeeklyReflection);
      setReflectionText(reflectionTask.data?.text || "");
    }
  };

  // Crea i task predefiniti per una nuova settimana
  const createDefaultWeeklyTasks = async (
    userId: string,
    trioId: string,
    weekStartStr: string
  ) => {
    // Calcola la data di fine settimana (7 giorni dopo l'inizio)
    const weekStart = new Date(weekStartStr);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    // Recupera i dati di peso dall'ultima settimana se disponibili
    const { data: lastWeekData } = await supabase
      .from("weekly_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("task_type", "weight")
      .order("week_start", { ascending: false })
      .limit(1);

    const lastWeight =
      lastWeekData && lastWeekData.length > 0
        ? lastWeekData[0].data?.current || null
        : null;

    // Calcola il numero della settimana
    let weekNumber = 1;
    if (
      lastWeekData &&
      lastWeekData.length > 0 &&
      lastWeekData[0].data?.weekNumber
    ) {
      weekNumber = lastWeekData[0].data.weekNumber + 1;
    }

    const defaultTasks = [
      {
        user_id: userId,
        trio_id: trioId,
        week_start: weekStartStr,
        task_type: "nutrition_goal",
        completed: false,
        completion_date: null,
        data: {
          category: "Nutrition",
          description: "Stay within calorie deficit 5+ days",
          emoji: "🍽️",
        },
      },
      {
        user_id: userId,
        trio_id: trioId,
        week_start: weekStartStr,
        task_type: "exercise_goal",
        completed: false,
        completion_date: null,
        data: {
          category: "Exercise",
          description: "Complete 3 strength training sessions",
          emoji: "💪",
        },
      },
      {
        user_id: userId,
        trio_id: trioId,
        week_start: weekStartStr,
        task_type: "cardio_goal",
        completed: false,
        completion_date: null,
        data: {
          category: "Cardio",
          description: "Achieve 8,000+ steps daily",
          emoji: "👟",
        },
      },
      {
        user_id: userId,
        trio_id: trioId,
        week_start: weekStartStr,
        task_type: "habits_goal",
        completed: false,
        completion_date: null,
        data: {
          category: "Habits",
          description: "Get 7+ hours sleep consistently",
          emoji: "😴",
        },
      },
      {
        user_id: userId,
        trio_id: trioId,
        week_start: weekStartStr,
        task_type: "weight",
        completed: false,
        completion_date: null,
        data: {
          start: lastWeight,
          current: null,
          change: null,
          weekNumber: weekNumber,
          weekStartDate: weekStartStr,
          weekEndDate: weekEndStr,
        },
      },
      {
        user_id: userId,
        trio_id: trioId,
        week_start: weekStartStr,
        task_type: "reflection",
        completed: false,
        completion_date: null,
        data: {
          text: "",
        },
      },
    ];

    const { data, error } = await supabase
      .from("weekly_tasks")
      .insert(defaultTasks)
      .select();

    if (error) throw error;

    return data;
  };

  // Toggle completamento degli obiettivi
  const toggleGoal = (goalId: string) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        return { ...goal, completed: !goal.completed };
      }
      return goal;
    });

    setGoals(updatedGoals);
  };

  // Salva il check-in settimanale
  const saveWeeklyCheckIn = async () => {
    if (weight === "") {
      setError("Inserisci il tuo peso attuale");
      return;
    }

    setSaving(true);

    try {
      // 1. Aggiorna il peso
      if (progress) {
        const weightChange =
          progress.data.start && typeof weight === "number"
            ? weight - progress.data.start
            : 0;

        const { error: weightError } = await supabase
          .from("weekly_tasks")
          .update({
            completed: true,
            completion_date: new Date().toISOString().split("T")[0],
            data: {
              ...progress.data,
              current: weight,
              change: weightChange,
            },
          })
          .eq("id", progress.id);

        if (weightError) throw weightError;

        // Aggiorna lo stato locale
        setProgress({
          ...progress,
          data: {
            ...progress.data,
            current: typeof weight === "number" ? weight : null,
            change: weightChange,
          },
        });
      }

      // 2. Aggiorna la riflessione
      if (reflection) {
        const { error: reflectionError } = await supabase
          .from("weekly_tasks")
          .update({
            completed: reflectionText.trim().length > 0,
            completion_date:
              reflectionText.trim().length > 0
                ? new Date().toISOString().split("T")[0]
                : null,
            data: {
              ...reflection.data,
              text: reflectionText,
            },
          })
          .eq("id", reflection.id);

        if (reflectionError) throw reflectionError;
      }

      // 3. Aggiorna gli obiettivi
      for (const goal of goals) {
        const { error: goalError } = await supabase
          .from("weekly_tasks")
          .update({
            completed: goal.completed,
            completion_date: goal.completed
              ? new Date().toISOString().split("T")[0]
              : null,
          })
          .eq("id", goal.id);

        if (goalError) throw goalError;
      }

      // Feedback di successo
      alert("Check-in settimanale salvato con successo!");

      // Chiudi il componente se richiesto
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("Error saving weekly check-in:", err);
      setError("Errore nel salvataggio dei dati");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-pulse text-blue-500">
          Caricamento dati settimanali...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
        <button className="ml-2 underline" onClick={() => setError(null)}>
          Chiudi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          📅 Weekly Check-In {progress && `- Week ${progress.data.weekNumber}`}
        </h2>
        {progress && (
          <div className="text-sm text-gray-500">
            {progress.data.weekStartDate} - {progress.data.weekEndDate}
          </div>
        )}
      </div>

      {/* Progress Summary */}
      {progress && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Weekly Progress</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600">Start Weight</div>
              <div className="font-bold text-lg">
                {progress.data.start
                  ? `${progress.data.start} kg`
                  : "Non disponibile"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Current Weight</div>
              <div className="font-bold text-lg">
                {progress.data.current
                  ? `${progress.data.current} kg`
                  : "Non inserito"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Change</div>
              <div
                className={`font-bold text-lg ${
                  progress.data.change === null
                    ? "text-gray-400"
                    : progress.data.change <= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {progress.data.change === null
                  ? "-"
                  : `${progress.data.change <= 0 ? "" : "+"}${
                      progress.data.change
                    } kg`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Goals Review */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">
          Weekly Goals Review
        </h3>
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center space-x-3">
              <button
                onClick={() => toggleGoal(goal.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm transition-colors duration-200 ${
                  goal.completed
                    ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                    : "bg-gray-200/80 text-gray-400 hover:bg-gray-300"
                }`}
              >
                {goal.completed ? "✓" : ""}
              </button>
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-lg">{goal.data.emoji}</span>
                <div>
                  <div className="text-sm font-medium">
                    {goal.data.category}
                  </div>
                  <div className="text-gray-700">{goal.data.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Weight Input */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Current Weight (kg)
        </label>
        <input
          type="number"
          value={weight}
          onChange={(e) =>
            setWeight(e.target.value === "" ? "" : parseFloat(e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          step="0.1"
          placeholder="Enter your current weight"
        />
      </div>

      {/* Weekly Reflection */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Weekly Reflection
        </label>
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
          placeholder="Reflect on your week. What went well? What challenges did you face? What will you focus on next week?"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={saveWeeklyCheckIn}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md disabled:opacity-70"
        >
          {saving ? "Saving..." : "Complete Weekly Check-In"}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
