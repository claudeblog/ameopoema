const EleventyFetch = require("@11ty/eleventy-fetch");
const { parseFeed } = require("@11ty/eleventy-plugin-rss");

module.exports = async function () {
  const feedUrl = "https://ameopoema.com/feeds/posts/default";

  const xml = await EleventyFetch(feedUrl, {
    duration: "30m",
    type: "text"
  });

  const feed = parseFeed(xml);

  return feed.items.map(item => {
    const parts = item.link.split("/");
    const slug = parts[parts.length - 1];

    return {
      id: item.id,
      title: item.title,
      content: item.content,
      published: item.date,
      updated: item.updated,
      permalink: `/${item.date.getFullYear()}/${String(
        item.date.getMonth() + 1
      ).padStart(2, "0")}/${slug}/`
    };
  });
};
