import programRepository from '../repositories/programRepository.js';
import ApiError from '../utils/ApiError.js';
import slugify from '../utils/slugify.js';

const parsePresenterIds = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value).split(',').map((v) => v.trim()).filter(Boolean);
  }
};

export const programService = {
  list: async (listQuery) => programRepository.list(listQuery),

  getOne: async (idOrSlug) => {
    const program = await programRepository.findByIdOrSlug(idOrSlug);
    if (!program) throw ApiError.notFound('Program not found');

    const [presenters, schedule] = await Promise.all([
      programRepository.getPresenters(program.id),
      programRepository.getSchedule(program.id),
    ]);

    return { ...program, presenters, schedule };
  },

  create: async (data, file) => {
    let { slug } = data;
    if (!slug) slug = slugify(data.title);
    const existing = await programRepository.findBySlug(slug);
    if (existing) throw ApiError.conflict('A program with this slug already exists');

    const program = await programRepository.create({
      ...data,
      slug,
      coverImageUrl: file ? file.path : undefined,
      coverPublicId: file ? file.filename : undefined,
    });

    const presenterIds = parsePresenterIds(data.presenterIds);
    if (presenterIds.length) await programRepository.setPresenters(program.id, presenterIds);

    return programService.getOne(program.id);
  },

  update: async (id, data, file) => {
    const existing = await programRepository.findById(id);
    if (!existing) throw ApiError.notFound('Program not found');

    if (data.slug && data.slug !== existing.slug) {
      const clash = await programRepository.findBySlug(data.slug);
      if (clash) throw ApiError.conflict('A program with this slug already exists');
    }

    await programRepository.update(id, {
      ...data,
      coverImageUrl: file ? file.path : undefined,
      coverPublicId: file ? file.filename : undefined,
    });

    if (data.presenterIds !== undefined) {
      await programRepository.setPresenters(id, parsePresenterIds(data.presenterIds));
    }

    return programService.getOne(id);
  },

  remove: async (id) => {
    const existing = await programRepository.findById(id);
    if (!existing) throw ApiError.notFound('Program not found');
    await programRepository.remove(id);
  },
};

export default programService;
