const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/favicon.ico");

    // Custom Nunjucks / universal date formatting filter
    eleventyConfig.addFilter("date", (dateObj, format = "yyyy-MM-dd") => {
        return DateTime.fromJSDate(dateObj).toFormat(format);
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
