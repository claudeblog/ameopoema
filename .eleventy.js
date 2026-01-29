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
        const title = post.title.toLowerCase();
        const tags = (post.categories || []).map(t => t.toLowerCase());

        return keywords.some(k =>
            title.includes(k) || tags.includes(k)
        );
    });

    // Custom Nunjucks / universal date formatting filter
    eleventyConfig.addFilter("date", (dateObj, format = "yyyy-MM-dd") => {
        return DateTime.fromJSDate(dateObj).toFormat(format);
    });

    eleventyConfig.addFilter("firstImage", (html) => {
        if (!html) return null;

        const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        return match ? match[1] : null;
    });
    eleventyConfig.addFilter("hasKeyword", (post, keywords) => {
        const title = post.title.toLowerCase();
        const tags = (post.categories || []).map(t => t.toLowerCase());

        return keywords.some(k =>
            title.includes(k) || tags.includes(k)
        );
    });


    return {
        pathPrefix: process.env.ELEVENTY_PATH_PREFIX || "/",

        dir: {
            input: "src",       // your content folder
            includes: "_includes", // this is relative to input
            data: "_data",      // optional, relative to input
            output: "_site"
        }
    };
};
