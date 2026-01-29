const { DateTime } = require("luxon");

const editorialFilters = {
  haicais: ["haicai", "haikai"],
  poesias: ["poesia", "poema", "poesias", "poemas"],
  textos: ["texto", "textículo"]
};

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");

  eleventyConfig.addCollection("editorialPages", () => {
    return Object.entries(editorialFilters).map(([slug, keywords]) => ({
      slug,
      title: slug.charAt(0).toUpperCase() + slug.slice(1),
      keywords
    }));
  });

  eleventyConfig.addFilter("matchesEditorial", (post, keywords) => {
    if (!post || !post.title) return false;
    const title = post.title.toLowerCase();
    const tags = (post.categories || []).map(t => t.toLowerCase());

    return keywords.some(k =>
      title.includes(k) || tags.includes(k)
    );
  });

  eleventyConfig.addFilter("date", (dateObj, format = "dd/MM/yyyy") => {
    return DateTime.fromJSDate(dateObj).toFormat(format);
  });

  eleventyConfig.addFilter("firstImage", (html) => {
    if (!html) return null;
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : null;
  });

  eleventyConfig.addFilter("hasKeyword", (post, keywords) => {
    if (!post || !post.title) return false;
    const title = post.title.toLowerCase();
    const tags = (post.categories || []).map(t => t.toLowerCase());

    return keywords.some(k =>
      title.includes(k) || tags.includes(k)
    );
  });

  eleventyConfig.addFilter("is575Haicais", (post) => {
    if (!post || !post.title) return false;
    return /^575 Haicais\s+\d+/i.test(post.title);
  });

  eleventyConfig.addFilter("haicaiNumber", (post) => {
    if (!post || !post.title) return 0;
    const match = post.title.match(/575 Haicais\s+(\d+)/i);
    return match ? Number(match[1]) : 0;
  });

  eleventyConfig.addCollection("livro575Haicais", (collectionApi) => {

    const posts = collectionApi.getFilteredByGlob("src/posts/**/*.njk");

    return posts
      .filter(item => {
        const title = item.data?.title || "";
        return /^575 Haicais\s+\d+/i.test(title);
      })
      .sort((a, b) => {
        const getNumber = (item) => {
          const match = item.data.title.match(/575 Haicais\s+(\d+)/i);
          return match ? Number(match[1]) : 0;
        };

        return getNumber(a) - getNumber(b);
      });
  });

  return {
    pathPrefix: process.env.ELEVENTY_PATH_PREFIX || "/",
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
