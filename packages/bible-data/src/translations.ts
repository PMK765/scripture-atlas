import type { Translation } from "./types";

export const translations: Translation[] = [
  {
    code: "WEB",
    name: "World English Bible",
    language: "english",
    year: 2020,
    license: "public-domain",
    licenseUrl: "https://worldenglish.bible/license/",
    hasDeuterocanon: true,
    sourceUrl: "https://ebible.org/web/",
    notes:
      "Modern English revision of the ASV. Public domain. The 'WEB Deuterocanon' edition includes the deuterocanonical books.",
  },
  {
    code: "BSB",
    name: "Berean Standard Bible",
    language: "english",
    year: 2022,
    license: "cc0",
    licenseUrl: "https://berean.bible/licensing.htm",
    hasDeuterocanon: true,
    sourceUrl: "https://berean.bible/",
    notes:
      "Modern, freely-released word-for-word leaning translation. CC0 / public-domain dedication. The 'Berean Apocrypha' edition covers the deuterocanonical books.",
  },
  {
    code: "KJV",
    name: "King James Version",
    language: "english",
    year: 1769,
    license: "public-domain",
    licenseUrl: "https://en.wikipedia.org/wiki/King_James_Version#Copyright_status",
    hasDeuterocanon: true,
    sourceUrl: "https://ebible.org/kjv/",
    notes:
      "1769 Cambridge revision of the 1611 Authorised Version. Public domain in the US (and effectively elsewhere despite UK Crown Copyright). The 1611 KJV included the Apocrypha as a separate section between OT and NT; this metadata reflects that.",
  },
  {
    code: "BRENTON",
    name: "Brenton's English Septuagint",
    language: "english",
    year: 1851,
    license: "public-domain",
    hasDeuterocanon: true,
    sourceUrl: "https://ebible.org/eng-Brenton/",
    notes:
      "Sir Lancelot C. L. Brenton's English translation of the Septuagint (1851). The standard public-domain English LXX, including the deuterocanonical books.",
  },
  {
    code: "WLC",
    name: "Westminster Leningrad Codex",
    language: "hebrew",
    year: 2017,
    license: "public-domain",
    licenseUrl: "https://www.tanach.us/Pages/Copyright.htm",
    hasDeuterocanon: false,
    sourceUrl: "https://www.tanach.us/",
    notes:
      "Digital edition of the Hebrew Masoretic Text based on the Leningrad Codex (B19a). Public domain. Source for Hebrew/Aramaic OT analysis.",
  },
  {
    code: "SBLGNT",
    name: "SBL Greek New Testament",
    language: "greek",
    year: 2010,
    license: "custom-free",
    licenseUrl: "https://sblgnt.com/license/",
    hasDeuterocanon: false,
    sourceUrl: "https://sblgnt.com/",
    notes:
      "Society of Biblical Literature Greek New Testament (Holmes, 2010). Free for ministry, scholarship, and most non-commercial digital use under SBL's license terms.",
  },
  {
    code: "LXX",
    name: "Septuagint (Swete 1930)",
    language: "greek",
    year: 1930,
    license: "public-domain",
    licenseUrl: "https://archive.org/details/theoldtestamenti00unknuoft",
    hasDeuterocanon: true,
    sourceUrl: "https://github.com/eliranwong/LXX-Swete-1930",
    notes:
      "Henry Barclay Swete's edition of the Septuagint (Cambridge, 1909–1930). The underlying Greek text is public domain. Includes the deuterocanonical books in their Greek form. Selected over CCAT/CATSS to avoid the latter's user-declaration and NonCommercial restrictions.",
  },
];

export const getTranslationByCode = (code: string): Translation | undefined =>
  translations.find((t) => t.code === code);

export const englishTranslations: Translation[] = translations.filter(
  (t) => t.language === "english",
);

export const sourceLanguageTranslations: Translation[] = translations.filter(
  (t) => t.language !== "english",
);
