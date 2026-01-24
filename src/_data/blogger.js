const EleventyFetch = require("@11ty/eleventy-fetch");
const Parser = require("rss-parser");
const parser = new Parser();

module.exports = async function () {
  const baseUrl = "https://ameopoemaameopoema.blogspot.com/feeds/posts/default";
  const batchSize = 150;
  let allItems = [];
  let index = 1;
  let more = true;

  while (more) {
    const url = `${baseUrl}?start-index=${index}&max-results=${batchSize}`;
    const xml = await EleventyFetch(url, {
      duration: "30m",
      type: "text"
    });

    const feed = await parser.parseString(xml);
    const items = feed.items || [];

    allItems.push(...items);

    // Stop if we got less than the batch size
    if (items.length < batchSize) {
      more = false;
    } else {
      index += batchSize;
    }
  }

  allItems.reverse();
  
  // Transform posts for Eleventy
  return allItems.map(item => {
    const parts = item.link.split("/");
    const slug = parts[parts.length - 1].replace(/\/$/, "");
    const publishedDate = item.pubDate
      ? new Date(item.pubDate)
      : new Date();

    return {
      id: item.guid || item.link,
      title: item.title,
      content: item.content,
      published: publishedDate,
      updated: item.isoDate
        ? new Date(item.isoDate)
        : publishedDate,
      permalink: `/${publishedDate.getFullYear()}/${String(
        publishedDate.getMonth() + 1
      ).padStart(2, "0")}/${slug}/`
    };
  });
};
