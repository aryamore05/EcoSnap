import {
  Recycle,
  Leaf,
  Droplets,
  Laptop,
  Apple,
  Trash2,
  HelpCircle,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import type { WasteCategory } from './types';

export const categoryIcon: Record<WasteCategory, LucideIcon> = {
  Plastic: Recycle,
  'Paper and cardboard': Leaf,
  Glass: Droplets,
  Metal: Recycle,
  'Organic waste': Apple,
  'Electronic waste': Laptop,
  'Mixed or unknown waste': HelpCircle,
};

export const categoryColors: Record<WasteCategory, { bg: string; text: string; border: string }> = {
  Plastic: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  'Paper and cardboard': { bg: 'bg-earth-50', text: 'text-earth-700', border: 'border-earth-200' },
  Glass: { bg: 'bg-leaf-50', text: 'text-leaf-700', border: 'border-leaf-200' },
  Metal: { bg: 'bg-sand-50', text: 'text-sand-700', border: 'border-sand-300' },
  'Organic waste': { bg: 'bg-forest-50', text: 'text-forest-700', border: 'border-forest-200' },
  'Electronic waste': { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300' },
  'Mixed or unknown waste': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

export const confidenceColors: Record<string, string> = {
  Likely: 'bg-leaf-100 text-leaf-800',
  Uncertain: 'bg-earth-100 text-earth-800',
  'Needs manual verification': 'bg-red-100 text-red-800',
};

export interface EcoTip {
  icon: LucideIcon;
  title: string;
  text: string;
}

export const ecoTips: EcoTip[] = [
  {
    icon: Droplets,
    title: 'Carry a reusable water bottle',
    text: 'A single reusable bottle can replace hundreds of single-use plastic bottles each year. Choose stainless steel or glass for durability.',
  },
  {
    icon: Leaf,
    title: 'Avoid disturbing wildlife',
    text: 'When exploring outdoors, observe animals from a distance. Do not feed them, and stay on marked trails to protect habitats.',
  },
  {
    icon: ShieldAlert,
    title: 'Never touch suspicious waste',
    text: 'If you find unidentified chemicals, medical waste, or sharp objects, do not touch them. Contact your local waste authority immediately.',
  },
  {
    icon: Recycle,
    title: 'Check local waste separation rules',
    text: 'Recycling rules vary by city and country. Look up your local council guidelines to make sure items go in the correct bin.',
  },
  {
    icon: Leaf,
    title: 'Join a supervised community cleanup',
    text: 'Community cleanups are a great way to make a visible difference. Join organised events with proper safety equipment and guidance.',
  },
  {
    icon: Trash2,
    title: 'Reduce before you recycle',
    text: 'The most effective way to cut waste is to avoid creating it. Buy in bulk, choose products with minimal packaging, and repair instead of replacing.',
  },
];
