import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { images } from "../src/data/images";

const prisma = new PrismaClient();

const presentersSeed = [
  {
    slug: "amara-nkosi",
    name: "Amara Nkosi",
    aka: null,
    role: "Morning Drive Host",
    bio: "Amara opens every weekday with the stories, songs and traffic updates that get the community moving. Twelve years on air and still first to the studio.",
    image: images.presenter3,
    twitter: "#",
    instagram: "#",
    facebook: "#",
  },
  {
    slug: "tapiwa-moyo",
    name: "Tapiwa Moyo",
    aka: null,
    role: "Afternoon Connect Host",
    bio: "Tapiwa keeps the midday hours energetic with listener call-ins, new releases and the sharpest shoutout segment on the dial.",
    image: images.presenter2,
    twitter: "#",
    instagram: "#",
    facebook: null,
  },
  {
    slug: "chiara-banda",
    name: "Chiara Banda",
    aka: null,
    role: "Evening Vibes Host",
    bio: "Chiara curates the soundtrack for the drive home and the nights that follow — R&B, Afrobeats and the deep cuts you didn't know you needed.",
    image: images.presenter1,
    twitter: null,
    instagram: "#",
    facebook: "#",
  },
  {
    slug: "kudzai-phiri",
    name: "Kudzai Phiri",
    aka: null,
    role: "News & Current Affairs Editor",
    bio: "Kudzai leads the newsroom, anchoring the hourly bulletins and long-form interviews that make Modern Voice the region's most trusted source.",
    image: images.presenter4,
    twitter: "#",
    instagram: null,
    facebook: "#",
  },
  {
    slug: "lindiwe-zulu",
    name: "Lindiwe Zulu",
    aka: null,
    role: "Weekend Takeover Host",
    bio: "Lindiwe brings the weekend energy — countdowns, live remotes and the biggest party mixes across the region every Saturday.",
    image: images.presenter5,
    twitter: "#",
    instagram: "#",
    facebook: null,
  },
  {
    slug: "farai-chikafu",
    name: "Farai Chikafu",
    aka: null,
    role: "Sports Desk Host",
    bio: "Farai covers the matches, the transfers and the locker-room talk with the same energy whether it's local league or international fixtures.",
    image: images.presenter6,
    twitter: "#",
    instagram: null,
    facebook: "#",
  },
];

const showsSeed = [
  {
    slug: "morning-drive",
    name: "Morning Drive",
    time: "6:00 AM — 10:00 AM",
    days: "Monday — Friday",
    hostSlug: "amara-nkosi",
    description:
      "News, traffic and the songs that set the tone for the day. The region's most-listened breakfast show.",
    image: images.showMorning,
    tag: "Breakfast",
    order: 1,
  },
  {
    slug: "afternoon-connect",
    name: "Afternoon Connect",
    time: "12:00 PM — 3:00 PM",
    days: "Monday — Friday",
    hostSlug: "tapiwa-moyo",
    description:
      "Listener call-ins, new music and the biggest shoutout block on the dial. Your midday reset.",
    image: images.showAfternoon,
    tag: "Talk & Music",
    order: 2,
  },
  {
    slug: "evening-vibes",
    name: "Evening Vibes",
    time: "6:00 PM — 10:00 PM",
    days: "Monday — Friday",
    hostSlug: "chiara-banda",
    description:
      "The soundtrack for the drive home — R&B, Afrobeats and deep cuts curated for the after-hours crowd.",
    image: images.showEvening,
    tag: "Music",
    order: 3,
  },
  {
    slug: "community-desk",
    name: "Community Desk",
    time: "5:00 PM — 6:00 PM",
    days: "Monday — Friday",
    hostSlug: "kudzai-phiri",
    description:
      "Local reporting, interviews and the current affairs that matter to the people of Chirundu and beyond.",
    image: images.newsLocal,
    tag: "News & Talk",
    order: 4,
  },
  {
    slug: "weekend-takeover",
    name: "Weekend Takeover",
    time: "10:00 AM — 2:00 PM",
    days: "Saturday",
    hostSlug: "lindiwe-zulu",
    description:
      "Countdowns, live remotes and the biggest party mixes across the region — the weekend starts here.",
    image: images.showWeekend,
    tag: "Weekend",
    order: 5,
  },
  {
    slug: "locker-room",
    name: "Locker Room",
    time: "7:00 PM — 9:00 PM",
    days: "Sunday",
    hostSlug: "farai-chikafu",
    description: "Match reports, transfer talk and the week in sport, local and international.",
    image: images.newsSport,
    tag: "Sport",
    order: 6,
  },
];

const articlesSeed = [
  {
    slug: "border-market-reopens",
    title: "Chirundu Border Market Reopens With Record Number of Traders",
    excerpt:
      "Over 400 new vendor stalls opened this week as the refurbished market welcomes traders from across the region.",
    content: [
      "The newly refurbished Chirundu Border Market opened its gates on Monday to the largest intake of registered traders in its history, with council officials confirming over 400 new vendor stalls across the textile, produce and hardware wings.",
      "The reopening follows an eight-month redevelopment project that added covered walkways, a dedicated loading bay for cross-border trucks, and upgraded sanitation facilities — improvements traders say were long overdue.",
      "\"We used to lose half a day's stock to rain during the wet season,\" said Grace Mumba, a textile trader who has worked the market for eleven years. \"Now we can actually plan around the weather.\"",
      "Council representatives say the market is expected to support an estimated 1,200 direct jobs once fully occupied, with a second phase of stalls planned for early next year. Modern Voice will continue following the story as traders settle into the new space.",
    ].join("\n\n"),
    category: "Local News",
    image: images.newsFeatured,
    date: new Date("2026-07-21"),
    author: "Kudzai Phiri",
    featured: true,
  },
  {
    slug: "afrobeats-chart-takeover",
    title: "Local Artists Take Over This Month's Afrobeats Chart",
    excerpt:
      "Three regional acts break into the national top ten for the first time, and Modern Voice has the first interviews.",
    content: [
      "For the first time in the chart's history, three acts from the Chirundu region have broken into the national Afrobeats top ten in the same month — a milestone local industry figures are calling a turning point for the regional scene.",
      "Leading the charge is Sable Ridge, whose single \"Golden Hour\" climbed to number four on the strength of heavy regional airplay and a viral dance clip that spread well beyond the border towns.",
      "\"This is years of grinding in small studios finally paying off,\" the trio told Modern Voice in an interview airing this week on Evening Vibes. \"We always believed the sound from here could travel.\"",
      "Industry watchers point to improved home-studio access and a wave of collaborations with producers in the capital as key drivers behind the surge. Modern Voice Sessions will feature extended interviews with all three acts over the coming weeks.",
    ].join("\n\n"),
    category: "Entertainment",
    image: images.newsEntertainment,
    date: new Date("2026-07-19"),
    author: "Chiara Banda",
    featured: false,
  },
  {
    slug: "youth-league-final",
    title: "Youth League Final Set for Sunday at Community Stadium",
    excerpt: "Two unbeaten sides face off in what's being called the biggest local fixture of the season.",
    content: [
      "Community Stadium will host what many are already calling the fixture of the season on Sunday, as two unbeaten sides meet in the Youth League final after a dramatic run of results across the past two months.",
      "Riverside Academy, unbeaten in fourteen matches, face a Border United side that has scored in every game this campaign. Both clubs have produced players who've gone on to trial with senior regional teams.",
      "\"The intensity in training this week has been different,\" Riverside's head coach told Locker Room. \"Everyone knows what Sunday means for the boys, win or lose.\"",
      "Kick-off is set for 3pm with gates opening at 1pm. Modern Voice's Locker Room team will broadcast live commentary throughout, with post-match reaction airing directly after the final whistle.",
    ].join("\n\n"),
    category: "Sports",
    image: images.newsSport,
    date: new Date("2026-07-18"),
    author: "Farai Chikafu",
    featured: false,
  },
  {
    slug: "road-upgrade-community-meeting",
    title: "Community Meeting Set to Discuss Highway Upgrade Timeline",
    excerpt: "Residents will get a first look at construction phases and detour routes at Thursday's town hall.",
    content: [
      "Residents will get their first detailed look at construction phasing for the long-awaited highway upgrade at a town hall meeting scheduled for Thursday evening at the Community Hall.",
      "The project, which will widen the main approach road and add a dedicated pedestrian crossing near the market district, has been a frequent topic on Community Desk over the past year as residents raised concerns about safety and disruption to trade.",
      "Council engineers are expected to present a phase-by-phase timeline along with proposed detour routes for the eighteen-month construction period, with a question and answer session to follow.",
      "\"We want people to know exactly what to expect before the first cone goes down,\" a council spokesperson said. Modern Voice will carry a full recap of the meeting on Community Desk this Friday.",
    ].join("\n\n"),
    category: "Community",
    image: images.newsCommunity,
    date: new Date("2026-07-16"),
    author: "Kudzai Phiri",
    featured: false,
  },
  {
    slug: "interview-mayor-town-vision",
    title: "In Conversation: The Mayor on Chirundu's Next Five Years",
    excerpt:
      "A wide-ranging interview covering infrastructure, youth employment and the town's growing creative economy.",
    content: [
      "In a wide-ranging conversation recorded live in our studio, the Mayor sat down with Modern Voice to discuss the priorities shaping Chirundu's development over the next five years.",
      "Infrastructure dominated much of the discussion, with the Mayor confirming that the market redevelopment and highway upgrade are the first of several planned projects targeting the town's busiest trade corridors.",
      "On youth employment, the Mayor pointed to partnerships with local training programmes — including Modern Voice's own youth broadcasting initiative — as a model the council hopes to expand into other creative and technical trades.",
      "\"Chirundu's advantage has always been its people,\" the Mayor said. \"Our job is to build the infrastructure that lets that talent stay here and grow here.\" The full unedited interview is available on Modern Voice Sessions.",
    ].join("\n\n"),
    category: "Interviews",
    image: images.micClose,
    date: new Date("2026-07-14"),
    author: "Amara Nkosi",
    featured: false,
  },
  {
    slug: "new-radio-drama-series",
    title: "Modern Voice Launches Original Weekly Radio Drama",
    excerpt:
      "A brand-new serialised drama debuts this weekend, produced entirely by the station's youth training programme.",
    content: [
      "Modern Voice will debut an original weekly radio drama this weekend, marking the first full production to come entirely out of the station's youth broadcasting training programme.",
      "The series, written, performed and produced by programme graduates, follows a fictional household navigating life along the border — themes producers say will feel immediately familiar to local listeners.",
      "\"Every voice you hear, every sound effect, every line of the script — that's our trainees,\" said the programme's lead mentor. \"This is exactly what the programme was built to do.\"",
      "The first episode airs Saturday during Weekend Takeover, with new instalments continuing weekly. Episodes will also be available shortly after broadcast through the Podcasts section of the site.",
    ].join("\n\n"),
    category: "Entertainment",
    image: images.headphonesDesk,
    date: new Date("2026-07-11"),
    author: "Tapiwa Moyo",
    featured: false,
  },
];

const podcastsSeed = [
  {
    slug: "modern-voice-sessions-24",
    title: "In the Studio With Sable Ridge",
    show: "Modern Voice Sessions",
    description:
      "The breakout Afrobeats trio talk their debut album, touring and the sound they're bringing to the region.",
    cover: images.showEvening,
    duration: "42 min",
    category: "Interviews",
    episode: 24,
    date: new Date("2026-07-20"),
  },
  {
    slug: "chirundu-chronicles-11",
    title: "The Traders Who Built the Border Market",
    show: "Chirundu Chronicles",
    description:
      "Long-form storytelling following three generations of traders who shaped the town's biggest marketplace.",
    cover: images.newsLocal,
    duration: "35 min",
    category: "Local Stories",
    episode: 11,
    date: new Date("2026-07-17"),
  },
  {
    slug: "beat-report-58",
    title: "Inside This Month's Chart Movers",
    show: "Beat Report",
    description: "Chiara Banda breaks down the new releases and regional artists climbing the charts this month.",
    cover: images.showAfternoon,
    duration: "28 min",
    category: "Entertainment",
    episode: 58,
    date: new Date("2026-07-15"),
  },
  {
    slug: "locker-room-talk-33",
    title: "Youth League Final Preview",
    show: "Locker Room Talk",
    description: "Farai Chikafu previews Sunday's final with both head coaches and a look back at the season.",
    cover: images.newsSport,
    duration: "31 min",
    category: "Sports",
    episode: 33,
    date: new Date("2026-07-13"),
  },
  {
    slug: "modern-voice-sessions-23",
    title: "The Mayor on Chirundu's Next Five Years",
    show: "Modern Voice Sessions",
    description: "The full unedited interview on infrastructure, youth employment and the town's creative economy.",
    cover: images.micClose,
    duration: "51 min",
    category: "Interviews",
    episode: 23,
    date: new Date("2026-07-08"),
  },
  {
    slug: "chirundu-chronicles-10",
    title: "Voices of the Youth Training Programme",
    show: "Chirundu Chronicles",
    description:
      "Meet the young producers behind the station's new radio drama and what the programme means to them.",
    cover: images.headphonesDesk,
    duration: "26 min",
    category: "Local Stories",
    episode: 10,
    date: new Date("2026-07-04"),
  },
];

const eventsSeed = [
  {
    slug: "modern-voice-block-party",
    title: "Modern Voice Block Party",
    date: new Date("2026-08-08"),
    time: "2:00 PM — 10:00 PM",
    location: "Riverside Grounds, Chirundu",
    description:
      "Our biggest live broadcast of the year — three stages, six local acts and the full presenter line-up on site.",
    image: images.eventStage,
    ctaLabel: "Get Tickets",
  },
  {
    slug: "youth-voices-summit",
    title: "Youth Voices Summit",
    date: new Date("2026-08-16"),
    time: "9:00 AM — 4:00 PM",
    location: "Community Hall, Chirundu",
    description:
      "A day of panels and workshops for young broadcasters, produced with our youth training programme graduates.",
    image: images.eventCrowd,
    ctaLabel: "Reserve a Seat",
  },
  {
    slug: "album-listening-party",
    title: "Sable Ridge — Album Listening Party",
    date: new Date("2026-08-22"),
    time: "7:00 PM — 9:30 PM",
    location: "Modern Voice Studio Rooftop",
    description: "First listen of the new album live from our rooftop studio, broadcast simultaneously on 99.5 FM.",
    image: images.headphonesDesk,
    ctaLabel: "RSVP",
  },
  {
    slug: "sports-fan-day",
    title: "Locker Room Live: Sports Fan Day",
    date: new Date("2026-09-05"),
    time: "11:00 AM — 3:00 PM",
    location: "Community Stadium Grounds",
    description:
      "Meet the Locker Room team, catch live match commentary on the big screen and enter the halftime giveaway.",
    image: images.newsSport,
    ctaLabel: "Get Tickets",
  },
];

async function main() {
  const presenterIdBySlug = new Map<string, string>();

  for (const p of presentersSeed) {
    const record = await prisma.presenter.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
    presenterIdBySlug.set(p.slug, record.id);
  }
  console.log(`Seeded ${presentersSeed.length} presenters.`);

  for (const s of showsSeed) {
    const { hostSlug, ...rest } = s;
    const hostId = presenterIdBySlug.get(hostSlug) ?? null;
    await prisma.show.upsert({
      where: { slug: s.slug },
      update: { ...rest, hostId },
      create: { ...rest, hostId },
    });
  }
  console.log(`Seeded ${showsSeed.length} shows.`);

  for (const a of articlesSeed) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: a,
      create: a,
    });
  }
  console.log(`Seeded ${articlesSeed.length} articles.`);

  for (const p of podcastsSeed) {
    await prisma.podcast.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(`Seeded ${podcastsSeed.length} podcasts.`);

  for (const e of eventsSeed) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: e,
      create: e,
    });
  }
  console.log(`Seeded ${eventsSeed.length} events.`);

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME ?? "Station Admin";

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env to seed the admin account."
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, passwordHash, role: "ADMIN" },
    create: { name: adminName, email: adminEmail, passwordHash, role: "ADMIN" },
  });

  console.log(`\nAdmin account ready:`);
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log(`  (change this after first login)\n`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
