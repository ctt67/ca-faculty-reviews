export interface Faculty {
  id: number;
  slug: string;
  faculty_name: string;
  subject: string;
  level: string;
  language: string | null;
  mode: string | null;
  website: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  faculty_slug: string;
  user_id: string;
  approved: boolean;
  created_at: string;
  attempt: string | null;
  student_type: string | null;
  course_type: string | null;
  teacher_style: string | null;
  course_progress: string | null;
  class_environment: string | null;
  best_for: string[] | null;
  would_recommend: boolean | null;
  actual_duration_hours: number | null;
  pros: string | null;
  cons: string | null;
  review_text: string | null;
  rating_reasons: Record<string, string> | null;
  understandability: number | null;
  exam_focus: number | null;
  study_material_quality: number | null;
  mock_coverage: number | null;
  coverage_of_questions: number | null;
  doubt_resolution: number | null;
  revision_support: number | null;
  notes_quality: number | null;
  pace_of_teaching: number | null;
  time_efficiency: number | null;
  value_for_money: number | null;
  expectation_match: number | null;
}
