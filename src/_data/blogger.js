const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const EleventyFetch = require("@11ty/eleventy-fetch");
const Parser = require("rss-parser");

const parser = new Parser();

const FEED_URL = "https://ameopoemaameopoema.blogspot.com/feeds/posts/default";
const FEED_BATCH_SIZE = 150;
const FEED_CACHE_DURATION = "5m";
const IMAGE_CACHE_DURATION = "1y";
const IMAGES_DIR = path.join("_site", "images", "posts");

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function hashFilename(url) {
  const ext = path.extname(new URL(url).pathname) || ".jpg";
  const hash = crypto.createHash("md5").update(url).digest("hex");
  return `${hash}${ext}`;
}

function parseDate(value, fallback = new Date()) {
  const parsed = value ? new Date(value) : fallback;
  return Number.isNaN(parsed.valueOf()) ? fallback : parsed;
}

function normalizeTitle(value) {
  if (typeof value === "string") {
    return value;
  }

  return value?.value || value?._ || "";
}

function buildPermalink(date, slug) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `/${year}/${month}/${slug}/`;
}

async function fetchBatch(startIndex) {
  const url = `${FEED_URL}?start-index=${startIndex}&max-results=${FEED_BATCH_SIZE}`;
  const xml = await EleventyFetch(url, {
    duration: FEED_CACHE_DURATION,
    type: "text"
  });

  const feed = await parser.parseString(xml);
  return feed.items || [];
}

async function fetchAllFeedItems() {
  const items = [];
  let startIndex = 1;
  let hasMore = true;

  while (hasMore) {
    const batch = await fetchBatch(startIndex);
    items.push(...batch);

    if (batch.length < FEED_BATCH_SIZE) {
      hasMore = false;
      continue;
    }

    startIndex += FEED_BATCH_SIZE;
  }

  return items.reverse();
}

async function downloadImage(url, localPath) {
  const buffer = await EleventyFetch(url, {
    duration: IMAGE_CACHE_DURATION,
    type: "buffer"
  });

  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.writeFileSync(localPath, buffer);
}

async function ensureLocalImage(postSlug, imageUrl) {
  const filename = hashFilename(imageUrl);
  const localPath = path.join(IMAGES_DIR, postSlug, filename);

  if (!fs.existsSync(localPath)) {
    await downloadImage(imageUrl, localPath);
  }

  return `/images/posts/${postSlug}/${filename}`;
}

function getExternalImageUrls(content) {
  const imageMatches = content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
  const urls = [];

  for (const match of imageMatches) {
    const imageUrl = match[1];

    if (!imageUrl.startsWith("http")) {
      continue;
    }

    if (!urls.includes(imageUrl)) {
      urls.push(imageUrl);
    }
  }

  return urls;
}

async function localizePostImages(postSlug, content = "") {
  let localizedContent = content;
  const imageUrls = getExternalImageUrls(localizedContent);

  for (const imageUrl of imageUrls) {
    const publicPath = await ensureLocalImage(postSlug, imageUrl);
    localizedContent = localizedContent.split(imageUrl).join(publicPath);
  }

  return localizedContent;
}

async function mapItemToPost(item) {
  const title = normalizeTitle(item.title);
  const published = parseDate(item.pubDate);
  const updated = parseDate(item.isoDate, published);
  const slug = slugify(title);
  const content = await localizePostImages(slug, item.content || "");

  return {
    id: item.guid || item.link,
    title,
    content,
    published,
    updated,
    permalink: buildPermalink(published, slug)
  };
}

module.exports = async function () {
  const items = await fetchAllFeedItems();
  return Promise.all(items.map(mapItemToPost));
};
