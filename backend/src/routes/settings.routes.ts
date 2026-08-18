import { Router } from 'express';
import { getSettings, saveSettings } from '../settings';

const router = Router();
router.get('/', (_req, res) => res.json({ id: 'default', ...getSettings() }));
router.put('/', (req, res) => {
  try {
    const { restaurantName, address, phone, gstin, taxRate, printerType } = req.body;
    if (!restaurantName?.trim()) return res.status(400).json({ error: 'Restaurant name is required' });
    const rate = Number(taxRate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) return res.status(400).json({ error: 'Tax rate must be between 0 and 100' });
    res.json({ id: 'default', ...saveSettings({ restaurantName: restaurantName.trim(), address: address?.trim() || '', phone: phone?.trim() || '', gstin: gstin?.trim() || '', taxRate: rate, printerType: printerType || '80MM' }) });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to save restaurant settings' }); }
});
export default router;
