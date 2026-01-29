const EleventyFetch = require("@11ty/eleventy-fetch");
const Parser = require("rss-parser");
const parser = new Parser();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const IMAGES_DIR = path.join("_site", "images", "posts");

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function downloadImage(url, dest) {
  const buffer = await EleventyFetch(url, {
    duration: "1y",
    type: "buffer"
  });

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buffer);
}

function hashFilename(url) {
  const ext = path.extname(new URL(url).pathname) || ".jpg";
  const hash = crypto.createHash("md5").update(url).digest("hex");
  return `${hash}${ext}`;
}

module.exports = async function () {
  const baseUrl = "https://ameopoemaameopoema.blogspot.com/feeds/posts/default";
  const batchSize = 150;
  let allItems = [];
  let index = 1;
  let more = true;

  while (more) {
    const url = `${baseUrl}?start-index=${index}&max-results=${batchSize}`;
    const xml = await EleventyFetch(url, {
      duration: "5m",
      type: "text"
    });

    const feed = await parser.parseString(xml);
    const items = feed.items || [];

    allItems.push(...items);

    if (items.length < batchSize) {
      more = false;
    } else {
      index += batchSize;
    }
  }

  allItems.reverse();

  return await Promise.all(
    allItems.map(async (item) => {
      const publishedDate = item.pubDate
        ? new Date(item.pubDate)
        : new Date();

      const slug = slugify(item.title);
      const postImageDir = path.join(IMAGES_DIR, slug);

      let content = item.content || "";

      // encontra <img src="">
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      let match;

      while ((match = imgRegex.exec(content)) !== null) {
        const imageUrl = match[1];

        // ignora imagens já locais
        if (!imageUrl.startsWith("http")) continue;

        const filename = hashFilename(imageUrl);
        const localPath = path.join(postImageDir, filename);
        const pathPrefix = process.env.ELEVENTY_PATH_PREFIX || "";
        const publicPath = `${pathPrefix}/images/posts/${slug}/${filename}`;

        if (!fs.existsSync(localPath)) {
          await downloadImage(imageUrl, localPath);
        }

        content = content.replace(imageUrl, publicPath);
      }

      return {
        id: item.guid || item.link,
        title:
          typeof item.title === "string"
            ? item.title
            : item.title?.value || item.title?._ || "",
        content,
        published: publishedDate,
        updated: item.isoDate
          ? new Date(item.isoDate)
          : publishedDate,
        permalink: `/${publishedDate.getFullYear()}/${String(
          publishedDate.getMonth() + 1
        ).padStart(2, "0")}/${slug}/`
      };
    })
  );
};
