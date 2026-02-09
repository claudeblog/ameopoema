const fs = require("fs");
const path = require("path");

const site = require("./site");

const SRC_ROOT = path.join(__dirname, "..");
const FEED_PATH = "/podcast.xml";
const PODCAST_PATH = "/podcast/";
const PODCAST_IMAGE_PATH = "/images/podcast-cover.jpg";

const EPISODES = [
  {
    id: "ep-001-ruido-branco-aleatorio",
    slug: "ep-001-ruido-branco-aleatorio",
    title: "Episódio 001: Ruído Branco Aleatório",
    description:
      "Faixa experimental criada com ruído branco aleatório para iniciar o feed de podcast do Ameopoema.",
    audioPath: "/audio/podcast/episodio-001.mp3",
    audioType: "audio/mpeg",
    duration: "00:27",
    publishedAt: new Date("2026-02-09T09:35:00Z"),
    episodeType: "full",
    explicit: "false"
  }
];

function absoluteUrl(pathOrUrl) {
  return new URL(pathOrUrl, site.url).toString();
}

function getAudioSizeBytes(audioPath) {
  const relativePath = audioPath.replace(/^\//, "");
  const filePath = path.join(SRC_ROOT, relativePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Podcast audio file not found: ${filePath}`);
  }

  return fs.statSync(filePath).size;
}

module.exports = function () {
  const episodes = EPISODES
    .map((episode) => ({
      ...episode,
      guid: `${site.url}${PODCAST_PATH}#${episode.slug}`,
      link: `${absoluteUrl(PODCAST_PATH)}#${episode.slug}`,
      audioUrl: absoluteUrl(episode.audioPath),
      audioSizeBytes: getAudioSizeBytes(episode.audioPath)
    }))
    .sort((a, b) => b.publishedAt - a.publishedAt);

  const lastBuildDate = episodes[0]?.publishedAt || new Date();

  return {
    title: `${site.title} Podcast`,
    siteUrl: site.url,
    feedPath: FEED_PATH,
    feedUrl: absoluteUrl(FEED_PATH),
    description:
      "Podcast literário do Ameopoema com leituras e experimentos sonoros relacionados à poesia e escrita.",
    summary:
      "Podcast literário do Ameopoema com leituras poéticas e experimentos sonoros.",
    language: "pt-BR",
    copyright: `© ${site.copyrightYear} ${site.title}`,
    author: "Ameopoema",
    owner: {
      name: "Ameopoema",
      email: "contato@ameopoema.com"
    },
    imagePath: PODCAST_IMAGE_PATH,
    imageUrl: absoluteUrl(PODCAST_IMAGE_PATH),
    type: "episodic",
    explicit: "false",
    categories: [
      { primary: "Arts", secondary: "Books" },
      { primary: "Society & Culture", secondary: "Personal Journals" }
    ],
    lastBuildDate,
    episodes
  };
};
