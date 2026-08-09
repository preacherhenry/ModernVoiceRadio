import settingsRepository from '../repositories/settingsRepository.js';

/** Seed data stores values as `{ value: <actual> }` — unwrap that shape when present. */
const unwrapValue = (raw) => {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && Object.prototype.hasOwnProperty.call(raw, 'value')) {
    return raw.value;
  }
  return raw;
};

export const settingsService = {
  getAll: async () => {
    const rows = await settingsRepository.listAll();
    return rows.reduce((map, row) => {
      map[row.key] = unwrapValue(row.value);
      return map;
    }, {});
  },

  set: async (key, value, description) => {
    const row = await settingsRepository.upsert(key, { value }, description);
    return { key: row.key, value: unwrapValue(row.value), description: row.description, updatedAt: row.updated_at };
  },
};

export default settingsService;
