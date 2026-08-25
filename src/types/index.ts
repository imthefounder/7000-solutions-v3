export type Solution = {
  id: string;
  sprint: string;
  category: string;
  title: string;
  description: string;
  long_description?: string | null;
  ai_usage: string | null;
  impact: string[];
  city: string | null;
  similarity?: number;
  hasGuide?: boolean;
};

export type GuideStep = {
  title: string;
  detail: string;
};

export type SolutionGuide = {
  solution_id: string;
  steps: GuideStep[];
  estimated_cost: string | null;
  timeline: string | null;
  partners: string[];
  updated_at: string | null;
};

export type Profile = {
  id: string;
  email?: string | null;
  role: 'user' | 'city_official' | 'admin';
  city: string | null;
  organization: string | null;
  karma_balance: number;
};

export type Feedback = {
  id: string;
  solution_id: string;
  user_id: string;
  status: 'planned' | 'in_progress' | 'completed';
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TeachingEvent = {
  id: string;
  teacher_id: string;
  student_id: string;
  solution_id: string;
  verified: boolean;
  created_at: string;
};

export type KarmaTransaction = {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
};
