/**
 * Storage helpers for admin configuration.
 */
import { parseJSON, saveJSON } from '../core/utils.js';

const KEY = 'AdminSwapConfig';

export const getConfig = () => parseJSON(localStorage.getItem(KEY), {});
export const setConfig = (cfg) => saveJSON(KEY, cfg);
