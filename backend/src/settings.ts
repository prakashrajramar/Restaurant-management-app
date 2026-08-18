import fs from 'fs';
import path from 'path';

export interface RestaurantSettings {
  restaurantName: string;
  address: string;
  phone: string;
  gstin: string;
  taxRate: number;
  printerType: string;
}

const defaults: RestaurantSettings = {
  restaurantName: 'Prakashraj R',
  address: '123 Heritage Lane, Culinary District, City Center',
  phone: '+91 98765 43210',
  gstin: '33AAAAA0000A1Z5',
  taxRate: 5,
  printerType: '80MM',
};

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

export function getSettings(): RestaurantSettings {
  try {
    if (!fs.existsSync(settingsPath)) return defaults;
    return { ...defaults, ...JSON.parse(fs.readFileSync(settingsPath, 'utf8')) };
  } catch { return defaults; }
}

export function saveSettings(input: Partial<RestaurantSettings>): RestaurantSettings {
  const next = { ...getSettings(), ...input };
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(next, null, 2));
  return next;
}
