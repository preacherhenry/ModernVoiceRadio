import contactRepository from '../repositories/contactRepository.js';

export const contactService = {
  get: async () => contactRepository.get(),

  upsert: async (data) => {
    const existing = await contactRepository.get();
    if (existing) return contactRepository.update(existing.id, data);
    return contactRepository.create(data);
  },
};

export default contactService;
