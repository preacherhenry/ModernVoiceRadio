/**
 * Seeds baseline reference data + sample content so the app and admin
 * dashboard are usable immediately after `npm run migrate`.
 * Idempotent: safe to run multiple times (uses ON CONFLICT DO NOTHING / UPSERT).
 */
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from '../config/database.js';
import logger from '../config/logger.js';

dotenv.config();

const ROLES = [
  { name: 'super_admin', description: 'Full system access', is_system: true },
  { name: 'admin', description: 'Manage content, users and settings', is_system: true },
  { name: 'editor', description: 'Manage news, podcasts, programs, gallery', is_system: true },
  { name: 'moderator', description: 'Moderate live chat and song requests', is_system: true },
  { name: 'listener', description: 'Standard mobile app user', is_system: true },
];

const PERMISSION_MODULES = ['users', 'news', 'podcasts', 'programs', 'presenters', 'gallery', 'advertisements', 'notifications', 'chat', 'settings', 'analytics'];
const ACTIONS = ['view', 'create', 'update', 'delete'];

async function seedRolesAndPermissions() {
  for (const role of ROLES) {
    await pool.query(
      `INSERT INTO roles (name, description, is_system) VALUES ($1,$2,$3)
       ON CONFLICT (name) DO NOTHING`,
      [role.name, role.description, role.is_system],
    );
  }

  const permissionCodes = [];
  for (const mod of PERMISSION_MODULES) {
    for (const action of ACTIONS) {
      const code = `${mod}.${action}`;
      permissionCodes.push({ code, module: mod });
      await pool.query(
        `INSERT INTO permissions (code, module, description) VALUES ($1,$2,$3)
         ON CONFLICT (code) DO NOTHING`,
        [code, mod, `${action} ${mod}`],
      );
    }
  }

  const { rows: superAdminRole } = await pool.query("SELECT id FROM roles WHERE name = 'super_admin'");
  const { rows: allPermissions } = await pool.query('SELECT id FROM permissions');
  for (const perm of allPermissions) {
    await pool.query(
      `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1,$2)
       ON CONFLICT DO NOTHING`,
      [superAdminRole[0].id, perm.id],
    );
  }

  logger.info('Seeded roles & permissions.');
}

async function seedAdminUser() {
  const { rows: role } = await pool.query("SELECT id FROM roles WHERE name = 'super_admin'");
  const passwordHash = await bcrypt.hash('ChangeMe!2026', 12);
  await pool.query(
    `INSERT INTO users (role_id, full_name, email, password_hash, is_verified, is_active)
     VALUES ($1,$2,$3,$4,true,true)
     ON CONFLICT (email) WHERE email IS NOT NULL DO NOTHING`,
    [role[0].id, 'Station Administrator', 'admin@modernvoiceradio.com', passwordHash],
  );
  logger.info('Seeded default admin user (admin@modernvoiceradio.com / ChangeMe!2026 — rotate immediately).');
}

async function seedAudioStreams() {
  await pool.query(
    `INSERT INTO audio_streams (name, protocol, url, bitrate_kbps, format, is_default, is_active, metadata_url)
     SELECT 'Modern Voice Radio — Main', 'icecast', $1, 128, 'mp3', true, true, $2
     WHERE NOT EXISTS (SELECT 1 FROM audio_streams WHERE is_default = true)`,
    [process.env.DEFAULT_STREAM_URL || 'http://node.stream-africa.com:8000/ModernVoiceFM',
      process.env.ICECAST_STATUS_URL || 'http://node.stream-africa.com:8000/status-json.xsl'],
  );
  logger.info('Seeded audio streams.');
}

async function seedPresenters() {
  const presenters = [
    { full_name: 'Amara Okafor', slug: 'amara-okafor', role_title: 'Breakfast Show Host', bio: 'Amara wakes the city up every morning with energy, news and the best throwback hits.' },
    { full_name: 'Daniel Mensah', slug: 'daniel-mensah', role_title: 'Drive Time Presenter', bio: 'Daniel guides listeners home with the biggest hits and honest commentary on the day\'s events.' },
    { full_name: 'Zuri Bello', slug: 'zuri-bello', role_title: 'Weekend Vibes Host', bio: 'Zuri curates weekend energy with Afrobeats, interviews and listener call-ins.' },
  ];
  for (const p of presenters) {
    await pool.query(
      `INSERT INTO presenters (full_name, slug, role_title, bio, is_active, is_featured)
       VALUES ($1,$2,$3,$4,true,true)
       ON CONFLICT (slug) DO NOTHING`,
      [p.full_name, p.slug, p.role_title, p.bio],
    );
  }
  logger.info('Seeded presenters.');
}

async function seedProgramsAndSchedule() {
  const { rows: presenters } = await pool.query('SELECT id, slug FROM presenters');
  const byline = Object.fromEntries(presenters.map((p) => [p.slug, p.id]));

  const programs = [
    { title: 'Morning Rush', slug: 'morning-rush', category: 'Talk', description: 'News, traffic and the day\'s biggest stories to start your morning right.', presenter: 'amara-okafor', days: [1, 2, 3, 4, 5], start: '06:00', end: '09:00' },
    { title: 'Drive Time Live', slug: 'drive-time-live', category: 'Music', description: 'The soundtrack to your commute home.', presenter: 'daniel-mensah', days: [1, 2, 3, 4, 5], start: '16:00', end: '19:00' },
    { title: 'Weekend Vibes', slug: 'weekend-vibes', category: 'Music', description: 'Non-stop Afrobeats and feel-good energy all weekend long.', presenter: 'zuri-bello', days: [6, 0], start: '10:00', end: '13:00' },
  ];

  for (const prog of programs) {
    const { rows } = await pool.query(
      `INSERT INTO programs (title, slug, category, description, is_active)
       VALUES ($1,$2,$3,$4,true)
       ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
       RETURNING id`,
      [prog.title, prog.slug, prog.category, prog.description],
    );
    const programId = rows[0].id;
    const presenterId = byline[prog.presenter];
    if (presenterId) {
      await pool.query(
        `INSERT INTO program_presenters (program_id, presenter_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [programId, presenterId],
      );
    }
    for (const day of prog.days) {
      await pool.query(
        `INSERT INTO schedule (program_id, day_of_week, start_time, end_time)
         SELECT $1,$2,$3,$4
         WHERE NOT EXISTS (
           SELECT 1 FROM schedule WHERE program_id = $1 AND day_of_week = $2 AND start_time = $3
         )`,
        [programId, day, prog.start, prog.end],
      );
    }
  }
  logger.info('Seeded programs & weekly schedule.');
}

async function seedPodcasts() {
  const categories = ['News & Talk', 'Music & Entertainment', 'Sports', 'Culture'];
  const categoryIds = {};
  for (const name of categories) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { rows } = await pool.query(
      `INSERT INTO podcast_categories (name, slug) VALUES ($1,$2)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [name, slug],
    );
    categoryIds[name] = rows[0].id;
  }

  const { rows: podcastRows } = await pool.query(
    `INSERT INTO podcasts (category_id, title, slug, description, is_featured, is_active)
     VALUES ($1,$2,$3,$4,true,true)
     ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
     RETURNING id`,
    [categoryIds['News & Talk'], 'The Weekly Debrief', 'the-weekly-debrief', 'A deep dive into the week\'s biggest headlines with the newsroom team.'],
  );
  const podcastId = podcastRows[0].id;

  for (let i = 1; i <= 3; i += 1) {
    await pool.query(
      `INSERT INTO podcast_episodes (podcast_id, title, description, audio_url, duration_seconds, episode_number, is_published)
       SELECT $1,$2,$3,$4,$5,$6,true
       WHERE NOT EXISTS (SELECT 1 FROM podcast_episodes WHERE podcast_id = $1 AND episode_number = $6)`,
      [podcastId, `Episode ${i}: This Week in Review`, 'Sample seed episode — replace audio_url with a real Cloudinary asset.', 'https://res.cloudinary.com/demo/video/upload/sample.mp3', 1800, i],
    );
  }
  logger.info('Seeded podcast categories, podcast and episodes.');
}

async function seedNews() {
  const { rows: catRows } = await pool.query(
    `INSERT INTO news_categories (name, slug) VALUES ('Station News','station-news')
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
  );
  await pool.query(
    `INSERT INTO news (category_id, title, slug, excerpt, content, is_breaking, is_published)
     VALUES ($1,$2,$3,$4,$5,false,true)
     ON CONFLICT (slug) DO NOTHING`,
    [catRows[0].id, 'Welcome to the new Modern Voice Radio app', 'welcome-to-modern-voice-radio-app',
      'Stream live, catch up on podcasts and never miss a show.',
      'We are thrilled to launch the all-new Modern Voice Radio mobile app, bringing you live radio, on-demand podcasts, breaking news and more — all in one place.'],
  );
  logger.info('Seeded news category & welcome article.');
}

async function seedSettingsAndContact() {
  const defaults = [
    { key: 'app_name', value: { value: 'Modern Voice Radio' } },
    { key: 'sleep_timer_presets_minutes', value: { value: [15, 30, 45, 60, 90] } },
    { key: 'equalizer_presets', value: { value: ['Flat', 'Bass Boost', 'Vocal', 'Treble Boost'] } },
    { key: 'audio_quality_options_kbps', value: { value: [64, 128, 256] } },
  ];
  for (const s of defaults) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1,$2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [s.key, s.value],
    );
  }

  await pool.query(
    `INSERT INTO contact_information (station_name, phone, whatsapp, email, address, latitude, longitude, facebook_url, instagram_url, tiktok_url, youtube_url, website_url)
     SELECT 'Modern Voice Radio', '+1 234 567 8900', '+1 234 567 8900', 'hello@modernvoiceradio.com',
            '123 Broadcast Avenue, Media City', 6.5244, 3.3792,
            'https://facebook.com/modernvoiceradio', 'https://instagram.com/modernvoiceradio',
            'https://tiktok.com/@modernvoiceradio', 'https://youtube.com/@modernvoiceradio', 'https://modernvoiceradio.com'
     WHERE NOT EXISTS (SELECT 1 FROM contact_information)`,
  );
  logger.info('Seeded settings & contact information.');
}

(async () => {
  try {
    await seedRolesAndPermissions();
    await seedAdminUser();
    await seedAudioStreams();
    await seedPresenters();
    await seedProgramsAndSchedule();
    await seedPodcasts();
    await seedNews();
    await seedSettingsAndContact();
    logger.info('Database seed complete.');
  } catch (err) {
    logger.error(err.stack || err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
