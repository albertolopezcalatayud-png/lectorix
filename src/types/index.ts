// ─── Exercise Types ───
export interface Exercise {
  id: string;
  module: ModuleId;
  level: number;
  type: 'multiple_choice' | 'drag_order' | 'drag_fill' | 'write';
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
  word?: string;
  passage?: string;
  syllables?: string[];
  // Drag & drop fields
  pieces?: string[];           // Items to drag (shuffled for display)
  correctOrder?: string[];     // Correct ordering of pieces (for drag_order)
  sentence?: string;           // Sentence with ___ blanks (for drag_fill)
  blanks?: string[];           // Correct words for each blank (for drag_fill)
  distractors?: string[];      // Extra wrong items mixed in (for drag_fill)
  // Write exercise fields
  answer?: string;             // Correct answer text (for write exercises)
  hint?: string;               // Optional hint shown to the student
  acceptableAnswers?: string[]; // Alternative correct answers (case-insensitive)
  dictation?: boolean;          // The word/sentence is heard, not shown
}

export type ModuleId =
  | 'fonologia'
  | 'memoria_visual'
  | 'comprension_lectora'
  | 'escritura'
  | 'retos_rapidos';

export interface ModuleInfo {
  id: ModuleId;
  name: string;
  description: string;
  icon: string;
  color: string;
  colorPale: string;
  levels: number;
}

// ─── User & Progress ───
export interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'premium';
  total_xp: number;
  streak_days: number;
  last_session: string;
  created_at: string;
}

export interface StudentProgress {
  module: ModuleId;
  level: number;
  stars: number;
  best_score: number;
  attempts: number;
  unlocked: boolean;
  completed_at?: string;
}

export interface SessionResult {
  id: string;
  module: ModuleId;
  level: number;
  total_questions: number;
  correct_answers: number;
  score_percent: number;
  stars: number;
  xp_earned: number;
  time_ms: number;
  answers: AnswerResult[];
  completed_at: string;
  avg_time_per_exercise?: number; // ms average per exercise
  mode?: 'normal' | 'review' | 'exam' | 'dictation' | 'reading' | 'daily' | 'srs'; // session mode
  reading_id?: string; // guided reading text, when mode === 'reading'
}

export interface AnswerResult {
  exercise_id: string;
  selected: number;
  correct: number;
  is_correct: boolean;
  time_ms: number;
}

// ─── Gamification ───
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  earned: boolean;
  earned_at?: string;
}

// ─── Subscription ───
export type PlanId = 'free' | 'individual' | 'family';

export interface Subscription {
  plan_id: PlanId;
  status: 'active' | 'canceled' | 'expired' | 'trialing';
  started_at: string;
  expires_at?: string;
}
