import presenterRepository from '../repositories/presenterRepository.js';
import ApiError from '../utils/ApiError.js';
import slugify from '../utils/slugify.js';

export const presenterService = {
  list: async (listQuery) => {
    const { rows, total } = await presenterRepository.list(listQuery);
    return { rows, total };
  },

  getOne: async (idOrSlug) => {
    const presenter = await presenterRepository.findByIdOrSlug(idOrSlug);
    if (!presenter) throw ApiError.notFound('Presenter not found');

    const [programs, podcasts] = await Promise.all([
      presenterRepository.getPrograms(presenter.id),
      presenterRepository.getPodcasts(presenter.id),
    ]);

    return { ...presenter, programs, podcasts };
  },

  create: async (data, file) => {
    let { slug } = data;
    if (!slug) slug = slugify(data.fullName);
    const existing = await presenterRepository.findBySlug(slug);
    if (existing) throw ApiError.conflict('A presenter with this slug already exists');

    return presenterRepository.create({
      ...data,
      slug,
      photoUrl: file ? file.path : undefined,
      photoPublicId: file ? file.filename : undefined,
    });
  },

  update: async (id, data, file) => {
    const existing = await presenterRepository.findById(id);
    if (!existing) throw ApiError.notFound('Presenter not found');

    if (data.slug && data.slug !== existing.slug) {
      const clash = await presenterRepository.findBySlug(data.slug);
      if (clash) throw ApiError.conflict('A presenter with this slug already exists');
    }

    const updated = await presenterRepository.update(id, {
      ...data,
      photoUrl: file ? file.path : undefined,
      photoPublicId: file ? file.filename : undefined,
    });
    return updated;
  },

  remove: async (id) => {
    const existing = await presenterRepository.findById(id);
    if (!existing) throw ApiError.notFound('Presenter not found');
    await presenterRepository.remove(id);
  },
};

export default presenterService;
