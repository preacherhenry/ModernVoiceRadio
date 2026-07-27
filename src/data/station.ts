export const station = {
  name: "Modern Voice Radio",
  shortName: "Modern Voice",
  frequency: "99.5 FM",
  slogan: "THE ART OF CHIRUNDU.",
  streamUrl: "https://node.stream-africa.com:8443/ModernVoiceFM",
  phone: "+260 97 123 4567",
  email: "studio@modernvoiceradio.fm",
  address: "12 Riverside Road, Chirundu",
  socials: {
    facebook: "https://www.facebook.com/share/1B61NhBFpG/",
    instagram: "#",
    twitter: "#",
    youtube: "#",
    tiktok: "#",
  },
  mapEmbedSrc:
    "https://www.google.com/maps?q=Chirundu&output=embed",
};

export const streamConfig = {
  provider: "icecast" as "icecast" | "shoutcast" | "azuracast",
  icecast: {
    statusUrl: "https://node.stream-africa.com:8443/status-json.xsl",
  },
  shoutcast: {
    statsUrl: "",
  },
  azuracast: {
    baseUrl: "",
    stationShortcode: "",
  },
};
