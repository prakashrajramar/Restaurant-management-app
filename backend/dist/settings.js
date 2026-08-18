"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
exports.saveSettings = saveSettings;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const defaults = {
    restaurantName: 'Prakashraj R',
    address: '123 Heritage Lane, Culinary District, City Center',
    phone: '+91 98765 43210',
    gstin: '33AAAAA0000A1Z5',
    taxRate: 5,
    printerType: '80MM',
};
const settingsPath = path_1.default.join(process.cwd(), 'data', 'settings.json');
function getSettings() {
    try {
        if (!fs_1.default.existsSync(settingsPath))
            return defaults;
        return { ...defaults, ...JSON.parse(fs_1.default.readFileSync(settingsPath, 'utf8')) };
    }
    catch {
        return defaults;
    }
}
function saveSettings(input) {
    const next = { ...getSettings(), ...input };
    fs_1.default.mkdirSync(path_1.default.dirname(settingsPath), { recursive: true });
    fs_1.default.writeFileSync(settingsPath, JSON.stringify(next, null, 2));
    return next;
}
