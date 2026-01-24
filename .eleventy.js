const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
    // Custom Nunjucks / universal date formatting filter
    eleventyConfig.addFilter("date", (dateObj, format = "yyyy-MM-dd") => {
        return DateTime.fromJSDate(dateObj).toFormat(format);
    });

    return {
        dir: {
            input: "src",       // your content folder
            includes: "_includes", // this is relative to input
            data: "_data",      // optional, relative to input
            output: "docs"      // or wherever you want the site to build
        }
    };
};
