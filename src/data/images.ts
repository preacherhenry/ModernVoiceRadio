function unsplash(id: string, params = "auto=format&fit=crop&q=80") {
  return `https://images.unsplash.com/${id}?${params}`;
}

export const images = {
  heroStudio: unsplash("photo-1598488035139-bdbb2231ce04", "auto=format&fit=crop&w=2400&q=75"),
  micClose: unsplash("photo-1478737270239-2f02b77fc618", "auto=format&fit=crop&w=1600&q=75"),
  cityNight: unsplash("photo-1477959858617-67f85cf4f1df", "auto=format&fit=crop&w=1600&q=75"),
  headphonesDesk: unsplash("photo-1505740420928-5e560c06d30e", "auto=format&fit=crop&w=1200&q=75"),

  showMorning: unsplash("photo-1590602847861-f357a9332bbc", "auto=format&fit=crop&w=1200&q=75"),
  showAfternoon: unsplash("photo-1516450360452-9312f5e86fc7", "auto=format&fit=crop&w=1200&q=75"),
  showEvening: unsplash("photo-1483412033650-1015ddeb83d1", "auto=format&fit=crop&w=1200&q=75"),
  showWeekend: unsplash("photo-1521337581100-8ca9a73a5f79", "auto=format&fit=crop&w=1200&q=75"),

  presenter1: unsplash("photo-1544005313-94ddf0286df2", "auto=format&fit=crop&w=800&q=80"),
  presenter2: unsplash("photo-1531427186611-ecfd6d936c79", "auto=format&fit=crop&w=800&q=80"),
  presenter3: unsplash("photo-1573497019940-1c28c88b4f3e", "auto=format&fit=crop&w=800&q=80"),
  presenter4: unsplash("photo-1500648767791-00dcc994a43e", "auto=format&fit=crop&w=800&q=80"),
  presenter5: unsplash("photo-1533613220915-609f661a6fe1", "auto=format&fit=crop&w=800&q=80"),
  presenter6: unsplash("photo-1536440136628-849c177e76a1", "auto=format&fit=crop&w=800&q=80"),

  newsFeatured: unsplash("photo-1495020689067-958852a7765e", "auto=format&fit=crop&w=1600&q=75"),
  newsLocal: unsplash("photo-1487215078519-e21cc028cb29", "auto=format&fit=crop&w=1000&q=75"),
  newsEntertainment: unsplash("photo-1526478806334-5fd488fcaabc", "auto=format&fit=crop&w=1000&q=75"),
  newsSport: unsplash("photo-1431324155629-1a6deb1dec8d", "auto=format&fit=crop&w=1000&q=75"),
  newsCommunity: unsplash("photo-1494232410401-ad00d5433cfa", "auto=format&fit=crop&w=1000&q=75"),

  eventStage: unsplash("photo-1459749411175-04bf5292ceea", "auto=format&fit=crop&w=1600&q=75"),
  eventCrowd: unsplash("photo-1470229722913-7c0e2dbbafd3", "auto=format&fit=crop&w=1600&q=75"),
} as const;
