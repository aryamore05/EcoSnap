export type WasteCategory =
  | 'Plastic'
  | 'Paper and cardboard'
  | 'Glass'
  | 'Metal'
  | 'Organic waste'
  | 'Electronic waste'
  | 'Mixed or unknown waste';

export type ConfidenceLabel = 'Likely' | 'Uncertain' | 'Needs manual verification';

export interface AnalysisResult {
  item_name: string;
  category: WasteCategory;
  explanation: string;
  confidence: ConfidenceLabel;
  disposal_action: string;
  safety_warnings: string;
  needs_professional: boolean;
}

export interface Observation extends AnalysisResult {
  id: number;
  image_filename: string | null;
  created_at: string;
}

export interface CleanupActivity {
  id: number;
  description: string;
  items_collected: number;
  created_at: string;
}

export interface Stats {
  total_observations: number;
  total_items_collected: number;
  total_cleanups: number;
  category_breakdown: Record<string, number>;
  recent_observations: Observation[];
  recent_cleanups: CleanupActivity[];
}

export interface HealthStatus {
  backend: 'online' | 'offline';
  ai_service: 'online' | 'offline' | 'demo';
  model_name: string | null;
  message: string;
}

export type Page = 'home' | 'scan' | 'impact' | 'tips' | 'about';
