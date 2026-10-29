export const DEMO_STORAGE_KEY = 'nexus-residence-demo:v1';
export const lamps = [
  { id: 'living', name: 'Lâmpada da sala', room: 'Sala de estar', watts: 9 },
  { id: 'bedroom', name: 'Lâmpada do quarto', room: 'Quarto', watts: 7 },
] as const;
export const plugs = [
  { id: 'living', name: 'Tomada da sala', room: 'Sala de estar', watts: 45 },
  { id: 'office', name: 'Tomada do escritório', room: 'Escritório', watts: 65 },
] as const;
export const foods = [
  { id: 'milk', name: 'Leite', unit: 'caixas', minimum: 2 },
  { id: 'eggs', name: 'Ovos', unit: 'unidades', minimum: 6 },
  { id: 'apples', name: 'Maçãs', unit: 'unidades', minimum: 4 },
  { id: 'cheese', name: 'Queijo', unit: 'peças', minimum: 1 },
  { id: 'yogurt', name: 'Iogurte', unit: 'unidades', minimum: 4 },
  { id: 'tomatoes', name: 'Tomates', unit: 'unidades', minimum: 4 },
  { id: 'juice', name: 'Suco', unit: 'garrafas', minimum: 2 },
  { id: 'lettuce', name: 'Alface', unit: 'unidades', minimum: 1 },
] as const;
export const colors = [
  { value: '#00d9ff', name: 'Ciano' }, { value: '#8b5cf6', name: 'Roxo' },
  { value: '#ff365e', name: 'Vermelho' }, { value: '#00ff9c', name: 'Verde' },
  { value: '#fbbf24', name: 'Âmbar' }, { value: '#f1f5ff', name: 'Branco' },
];
export type DemoState = {
  version: 1;
  lamps: Record<string, { on: boolean; color: string; brightness: number }>;
  plugs: Record<string, boolean>;
  quantities: Record<string, number>;
};
export function initialResidence(): DemoState {
  return {
    version: 1,
    lamps: { living: { on: true, color: '#00d9ff', brightness: 80 }, bedroom: { on: false, color: '#8b5cf6', brightness: 55 } },
    plugs: { living: false, office: true },
    quantities: { milk: 0, eggs: 3, apples: 5, cheese: 1, yogurt: 0, tomatoes: 2, juice: 2, lettuce: 1 },
  };
}
export function shoppingFor(state: DemoState) {
  return foods.filter(food => state.quantities[food.id] < food.minimum)
    .map(food => ({ ...food, needed: food.minimum - state.quantities[food.id] }));
}
export function readResidence(value: string | null): DemoState | null {
  if (!value) return null;
  try {
    const state = JSON.parse(value) as DemoState;
    if (state.version !== 1 || !state.lamps || !state.plugs || !state.quantities) return null;
    for (const lamp of lamps) {
      const item = state.lamps[lamp.id];
      if (!item || typeof item.on !== 'boolean' || !/^#[\da-f]{6}$/i.test(item.color) ||
        !Number.isInteger(item.brightness) || item.brightness < 1 || item.brightness > 100) return null;
    }
    for (const plug of plugs) if (typeof state.plugs[plug.id] !== 'boolean') return null;
    for (const food of foods) {
      const amount = state.quantities[food.id];
      if (!Number.isInteger(amount) || amount < 0 || amount > 99) return null;
    }
    return state;
  } catch { return null; }
}
