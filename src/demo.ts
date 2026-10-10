import type { AnalysisResult } from '@/types';

const demoResults: AnalysisResult[] = [
  {
    item_name: 'Plastic water bottle',
    category: 'Plastic',
    explanation:
      'The object appears to be a single-use plastic bottle, likely made of PET plastic. This is a demo result — no real AI analysis was performed.',
    confidence: 'Needs manual verification',
    disposal_action:
      'Empty any remaining liquid, replace the cap, and place it in your plastic recycling bin. Check local rules about whether caps should be left on or removed.',
    safety_warnings:
      'This is a demo result. No real safety assessment was performed. Do not reuse single-use plastic bottles for drinking water.',
    needs_professional: false,
  },
  {
    item_name: 'Cardboard box',
    category: 'Paper and cardboard',
    explanation:
      'The image shows a brown corrugated cardboard box. This is a demo result — no real AI analysis was performed.',
    confidence: 'Needs manual verification',
    disposal_action:
      'Flatten the box to save space and place it in your cardboard/paper recycling bin. Remove any tape, labels, or staples if your local rules require it.',
    safety_warnings:
      'This is a demo result. No real safety assessment was performed.',
    needs_professional: false,
  },
  {
    item_name: 'Glass jar',
    category: 'Glass',
    explanation:
      'The object appears to be a clear glass jar or container. This is a demo result — no real AI analysis was performed.',
    confidence: 'Needs manual verification',
    disposal_action:
      'Rinse the jar and remove the lid. Place glass in your glass recycling container. Some areas require separated colours — check your local rules.',
    safety_warnings:
      'This is a demo result. Be careful with broken glass — do not pick up sharp pieces with bare hands. Wrap broken glass in paper before disposal.',
    needs_professional: false,
  },
  {
    item_name: 'Aluminum can',
    category: 'Metal',
    explanation:
      'The object appears to be an aluminum beverage can. This is a demo result — no real AI analysis was performed.',
    confidence: 'Needs manual verification',
    disposal_action:
      'Empty the can completely. Place it in your metal recycling bin. Aluminum is infinitely recyclable and one of the most valuable materials to recycle.',
    safety_warnings:
      'This is a demo result. Watch for sharp edges on crushed or damaged cans.',
    needs_professional: false,
  },
  {
    item_name: 'Food waste / organic scrap',
    category: 'Organic waste',
    explanation:
      'The image shows what appears to be food waste or organic material. This is a demo result — no real AI analysis was performed.',
    confidence: 'Needs manual verification',
    disposal_action:
      'Place food scraps in your organic waste or compost bin if available. If you have a compost pile, most fruit and vegetable scraps can be composted at home.',
    safety_warnings:
      'This is a demo result. Do not compost meat, dairy, or oils in home compost systems as they attract pests.',
    needs_professional: false,
  },
  {
    item_name: 'Unknown item',
    category: 'Mixed or unknown waste',
    explanation:
      'The AI could not confidently identify this item. This is a demo result — no real AI analysis was performed.',
    confidence: 'Needs manual verification',
    disposal_action:
      'If you are unsure what the item is, do not handle it. Check with your local waste authority for guidance on proper disposal of unknown materials.',
    safety_warnings:
      'This is a demo result. Do not touch or open containers with unknown contents. If the item looks hazardous, contact your local waste authority.',
    needs_professional: true,
  },
];

let demoIndex = 0;

export function getDemoResult(): AnalysisResult {
  const result = demoResults[demoIndex % demoResults.length];
  demoIndex++;
  return result;
}
