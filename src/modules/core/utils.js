/**
 * Generic utility helpers.
 * JSON parsing and saving wrappers.
 */
export const parseJSON = (str, fallback = {}) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
};

export const saveJSON = (key, obj) => {
  localStorage.setItem(key, JSON.stringify(obj));
};
