import { createClient } from '@supabase/supabase-js';
import type {
  AnalysisResult,
  Observation,
  CleanupActivity,
  Stats,
  HealthStatus,
} from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT = 60000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// --- AI analysis (still uses Python backend with Ollama) ---

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      backend: 'offline',
      ai_service: 'offline',
      model_name: null,
      message: 'Backend is not running. Start the FastAPI server to enable AI analysis.',
    };
  }
}

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetchWithTimeout(`${API_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorBody.detail || `Server returned ${res.status}`);
  }

  return await res.json();
}

// --- Observations (Supabase) ---

export async function getObservations(): Promise<Observation[]> {
  const { data, error } = await supabase
    .from('observations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapObservation);
}

export async function saveObservation(
  result: AnalysisResult,
  imageFilename: string | null
): Promise<Observation> {
  const { data, error } = await supabase
    .from('observations')
    .insert({
      item_name: result.item_name,
      category: result.category,
      explanation: result.explanation,
      confidence: result.confidence,
      disposal_action: result.disposal_action,
      safety_warnings: result.safety_warnings,
      needs_professional: result.needs_professional,
      image_filename: imageFilename,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapObservation(data);
}

export async function deleteObservation(id: number): Promise<void> {
  const { error } = await supabase.from('observations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- Cleanups (Supabase) ---

export async function recordCleanup(
  description: string,
  itemsCollected: number
): Promise<CleanupActivity> {
  const { data, error } = await supabase
    .from('cleanups')
    .insert({
      description,
      items_collected: itemsCollected,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapCleanup(data);
}

// --- Stats (Supabase) ---

export async function getStats(): Promise<Stats> {
  const [obsResult, cleanupsResult] = await Promise.all([
    supabase.from('observations').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('cleanups').select('*').order('created_at', { ascending: false }).limit(100),
  ]);

  if (obsResult.error) throw new Error(obsResult.error.message);
  if (cleanupsResult.error) throw new Error(cleanupsResult.error.message);

  const observations = (obsResult.data ?? []).map(mapObservation);
  const cleanups = (cleanupsResult.data ?? []).map(mapCleanup);

  const categoryBreakdown: Record<string, number> = {};
  for (const obs of observations) {
    categoryBreakdown[obs.category] = (categoryBreakdown[obs.category] ?? 0) + 1;
  }

  const totalItemsCollected = cleanups.reduce((sum, c) => sum + c.items_collected, 0);

  return {
    total_observations: observations.length,
    total_items_collected: totalItemsCollected,
    total_cleanups: cleanups.length,
    category_breakdown: categoryBreakdown,
    recent_observations: observations.slice(0, 10),
    recent_cleanups: cleanups.slice(0, 10),
  };
}

// --- Mappers ---

interface SupabaseObservation {
  id: number;
  item_name: string;
  category: string;
  explanation: string;
  confidence: string;
  disposal_action: string;
  safety_warnings: string;
  needs_professional: boolean;
  image_filename: string | null;
  created_at: string;
}

interface SupabaseCleanup {
  id: number;
  description: string;
  items_collected: number;
  created_at: string;
}

function mapObservation(row: SupabaseObservation): Observation {
  return {
    id: row.id,
    item_name: row.item_name,
    category: row.category as Observation['category'],
    explanation: row.explanation,
    confidence: row.confidence as Observation['confidence'],
    disposal_action: row.disposal_action,
    safety_warnings: row.safety_warnings,
    needs_professional: row.needs_professional,
    image_filename: row.image_filename,
    created_at: row.created_at,
  };
}

function mapCleanup(row: SupabaseCleanup): CleanupActivity {
  return {
    id: row.id,
    description: row.description,
    items_collected: row.items_collected,
    created_at: row.created_at,
  };
}

export { API_URL };
