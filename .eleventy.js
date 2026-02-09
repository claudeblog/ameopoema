const { DateTime } = require("luxon");

const EDITORIAL_FILTERS = Object.freeze({
  haicais: ["haicai", "haikai"],
  poesias: ["poesia", "poema", "poesias", "poemas"],
  textos: ["texto", "texticulo", "textículo"]
});

const HAICAI_TITLE_REGEX = /^575 Haicais\s+(\d+)/i;

function normalizeText(value = "") {
  return String(value).toLowerCase();
}

function getPostTags(post) {
  const categories = Array.isArray(post?.categories) ? post.categories : [];
  return categories.map(normalizeText);
}

function postMatchesKeywords(post, keywords = []) {
  if (!post || !post.title || !Array.isArray(keywords)) {
    return false;
  }

  const title = normalizeText(post.title);
  const tags = getPostTags(post);

  return keywords.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return title.includes(normalizedKeyword) || tags.includes(normalizedKeyword);
  });
}

function extractHaicaiNumber(title = "") {
  const match = String(title).match(HAICAI_TITLE_REGEX);
  return match ? Number(match[1]) : 0;
}

function getEditorialTitle(slug) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  eleventyConfig.addWatchTarget("src/css");
  eleventyConfig.addWatchTarget("src/js");

  eleventyConfig.addCollection("editorialPages", () =>
    Object.entries(EDITORIAL_FILTERS).map(([slug, keywords]) => ({
      slug,
      title: getEditorialTitle(slug),
      keywords
    }))
  );

  eleventyConfig.addFilter("matchesEditorial", (post, keywords) =>
    postMatchesKeywords(post, keywords)
  );

  eleventyConfig.addFilter("date", (dateObj, format = "dd/MM/yyyy") => {
    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.valueOf())) {
      return "";
    }

    return DateTime.fromJSDate(dateObj).toFormat(format);
  });

  eleventyConfig.addFilter("firstImage", (html = "") => {
    const match = String(html).match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : null;
  });

  eleventyConfig.addFilter("is575Haicais", (post) =>
    extractHaicaiNumber(post?.title) > 0
  );

  eleventyConfig.addFilter("haicaiNumber", (post) =>
    extractHaicaiNumber(post?.title)
  );

  eleventyConfig.addFilter("haicaisBookPosts", (posts) => {
    if (!Array.isArray(posts)) {
      return [];
    }

    return posts
      .filter((post) => extractHaicaiNumber(post?.title) > 0)
      .sort(
        (a, b) =>
          extractHaicaiNumber(a?.title) - extractHaicaiNumber(b?.title)
      );
  });

  return {
    pathPrefix: "/",
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
