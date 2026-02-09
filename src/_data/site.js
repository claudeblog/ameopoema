module.exports = {
  title: "Ameopoema",
  brand: "ameopoema",
  url: "https://ameopoema.com",
  copyrightYear: 2026,
  navLinks: [
    { href: "/", label: "Início" },
    { href: "/haicais/", label: "Haicais" },
    { href: "/poesias/", label: "Poesias" },
    { href: "/textos/", label: "Textos" },
    { href: "/print/", label: "Livros" },
    { href: "/podcast/", label: "Podcast" }
  ],
  gate: {
    formAction:
      "https://docs.google.com/forms/d/e/1FAIpQLScItpjJxsc4GOYWayWwVU-CEyxrwA_7FQtRDO_9ZB1r8rh-0w/formResponse",
    minIntervalMs: 60 * 1000,
    storageKey: "ameopoema_last_submit",
    sessionCookie: "ameopoema_unlocked"
  }
};
