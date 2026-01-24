const EleventyFetch = require("@11ty/eleventy-fetch");
const Parser = require("rss-parser");
const parser = new Parser();

module.exports = async function () {
  const feedUrl = "https://ameopoema.com/feeds/posts/default";

  // Fetch the feed XML and cache it
  const xml = await EleventyFetch(feedUrl, {
    duration: "30m",
    type: "text"
  });

  // Parse the XML into a JS object
  const feed = await parser.parseString(xml);

  // Return posts formatted for Eleventy
  return feed.items.map(item => {
    const parts = item.link.split("/");
    const slug = parts[parts.length - 1].replace(/\/$/, ""); // strip trailing slash

    const publishedDate = item.pubDate
      ? new Date(item.pubDate)
      : new Date();

    return {
      id: item.guid || item.link,
      title: item.title,
      content: item.content,   // HTML
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
