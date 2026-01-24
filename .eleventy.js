module.exports = function(eleventyConfig) {
  return {
    dir: {
      input: "src",       // your content folder
      includes: "_includes", // this is relative to input
      data: "_data",      // optional, relative to input
      output: "docs"      // or wherever you want the site to build
    }
  };
};
