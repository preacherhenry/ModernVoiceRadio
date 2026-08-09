import podcastRepository from '../repositories/podcastRepository.js';
import ApiError from '../utils/ApiError.js';
import slugify from '../utils/slugify.js';

export const podcastService = {
  listCategories: async () => podcastRepository.listCategories(),

  list: async (listQuery) => podcastRepository.list(listQuery),

  getOne: async (idOrSlug) => {
    const podcast = await podcastRepository.findDetailByIdOrSlug(idOrSlug);
    if (!podcast) throw ApiError.notFound('Podcast not found');
    const episodes = await podcastRepository.listEpisodes(podcast.id);
    return { ...podcast, episodes };
  },

  create: async (data, file) => {
    let { slug } = data;
    if (!slug) slug = slugify(data.title);
    const existing = await podcastRepository.findBySlug(slug);
    if (existing) throw ApiError.conflict('A podcast with this slug already exists');

    return podcastRepository.create({
      ...data,
      slug,
      coverImageUrl: file ? file.path : undefined,
      coverPublicId: file ? file.filename : undefined,
    });
  },

  update: async (id, data, file) => {
    const existing = await podcastRepository.findById(id);
    if (!existing) throw ApiError.notFound('Podcast not found');

    if (data.slug && data.slug !== existing.slug) {
      const clash = await podcastRepository.findBySlug(data.slug);
      if (clash) throw ApiError.conflict('A podcast with this slug already exists');
    }

    const updated = await podcastRepository.update(id, {
      ...data,
      coverImageUrl: file ? file.path : undefined,
      coverPublicId: file ? file.filename : undefined,
    });
    return updated;
  },

  remove: async (id) => {
    const existing = await podcastRepository.findById(id);
    if (!existing) throw ApiError.notFound('Podcast not found');
    await podcastRepository.remove(id);
  },

  // --- Episodes ---------------------------------------------------------

  listEpisodes: async (podcastId) => {
    const podcast = await podcastRepository.findById(podcastId);
    if (!podcast) throw ApiError.notFound('Podcast not found');
    return podcastRepository.listEpisodes(podcastId);
  },

  createEpisode: async (podcastId, data, files) => {
    const podcast = await podcastRepository.findById(podcastId);
    if (!podcast) throw ApiError.notFound('Podcast not found');

    const audioFile = files?.audio?.[0];
    const coverFile = files?.cover?.[0];
    if (!audioFile) throw ApiError.badRequest('An audio file is required');

    return podcastRepository.createEpisode({
      ...data,
      podcastId,
      audioUrl: audioFile.path,
      audioPublicId: audioFile.filename,
      coverImageUrl: coverFile ? coverFile.path : undefined,
    });
  },

  updateEpisode: async (id, data, files) => {
    const existing = await podcastRepository.findEpisodeById(id);
    if (!existing) throw ApiError.notFound('Episode not found');

    const audioFile = files?.audio?.[0];
    const coverFile = files?.cover?.[0];

    const updated = await podcastRepository.updateEpisode(id, {
      ...data,
      audioUrl: audioFile ? audioFile.path : undefined,
      audioPublicId: audioFile ? audioFile.filename : undefined,
      coverImageUrl: coverFile ? coverFile.path : undefined,
    });
    return updated;
  },

  removeEpisode: async (id) => {
    const existing = await podcastRepository.findEpisodeById(id);
    if (!existing) throw ApiError.notFound('Episode not found');
    await podcastRepository.removeEpisode(id);
  },

  playEpisode: async (id) => {
    const existing = await podcastRepository.findEpisodeById(id);
    if (!existing) throw ApiError.notFound('Episode not found');
    return podcastRepository.incrementPlayCount(id);
  },

  // --- Progress -----------------------------------------------------------

  updateProgress: async (userId, episodeId, positionSeconds, isCompleted) => {
    const episode = await podcastRepository.findEpisodeById(episodeId);
    if (!episode) throw ApiError.notFound('Episode not found');
    return podcastRepository.upsertProgress(userId, episodeId, positionSeconds, isCompleted);
  },

  continueListening: async (userId) => podcastRepository.continueListening(userId),
};

export default podcastService;
