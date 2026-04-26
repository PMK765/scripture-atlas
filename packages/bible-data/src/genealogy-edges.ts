import type { GenealogyEdge } from "./types";

const explicit = (
  from: string,
  to: string,
  refs: string[],
  extra?: Partial<GenealogyEdge>,
): GenealogyEdge => ({
  from,
  to,
  relationship: "parent-of",
  viaParent: "father",
  relationKind: "biological",
  scriptureReferences: refs,
  confidenceLevel: "explicit",
  ...extra,
});

const motherOf = (
  from: string,
  to: string,
  refs: string[],
  extra?: Partial<GenealogyEdge>,
): GenealogyEdge => ({
  from,
  to,
  relationship: "parent-of",
  viaParent: "mother",
  relationKind: "biological",
  scriptureReferences: refs,
  confidenceLevel: "explicit",
  ...extra,
});

const spouse = (
  a: string,
  b: string,
  refs: string[],
  extra?: Partial<GenealogyEdge>,
): GenealogyEdge[] => [
  {
    from: a,
    to: b,
    relationship: "spouse-of",
    relationKind: "biological",
    scriptureReferences: refs,
    confidenceLevel: "explicit",
    ...extra,
  },
  {
    from: b,
    to: a,
    relationship: "spouse-of",
    relationKind: "biological",
    scriptureReferences: refs,
    confidenceLevel: "explicit",
    ...extra,
  },
];

export const genealogyEdges: GenealogyEdge[] = [
  ...spouse("adam", "eve", ["Genesis 2:22-25", "Genesis 3:20"]),

  explicit("adam", "cain", ["Genesis 4:1", "Genesis 5:3"]),
  motherOf("eve", "cain", ["Genesis 4:1"]),
  explicit("adam", "abel", ["Genesis 4:2"]),
  motherOf("eve", "abel", ["Genesis 4:2"]),
  explicit("adam", "seth", ["Genesis 4:25", "Genesis 5:3"]),
  motherOf("eve", "seth", ["Genesis 4:25"]),

  explicit("cain", "enoch-of-cain", ["Genesis 4:17"]),
  explicit("enoch-of-cain", "irad", ["Genesis 4:18"]),
  explicit("irad", "mehujael", ["Genesis 4:18"]),
  explicit("mehujael", "methushael", ["Genesis 4:18"]),
  explicit("methushael", "lamech-of-cain", ["Genesis 4:18"]),

  ...spouse("lamech-of-cain", "adah", ["Genesis 4:19"]),
  ...spouse("lamech-of-cain", "zillah", ["Genesis 4:19"]),

  explicit("lamech-of-cain", "jabal", ["Genesis 4:20"]),
  motherOf("adah", "jabal", ["Genesis 4:20"]),
  explicit("lamech-of-cain", "jubal", ["Genesis 4:21"]),
  motherOf("adah", "jubal", ["Genesis 4:21"]),
  explicit("lamech-of-cain", "tubal-cain", ["Genesis 4:22"]),
  motherOf("zillah", "tubal-cain", ["Genesis 4:22"]),
  explicit("lamech-of-cain", "naamah", ["Genesis 4:22"]),
  motherOf("zillah", "naamah", ["Genesis 4:22"]),

  explicit("seth", "enosh", ["Genesis 5:6", "1 Chronicles 1:1"]),
  explicit("enosh", "kenan", ["Genesis 5:9", "1 Chronicles 1:2"]),
  explicit("kenan", "mahalalel", ["Genesis 5:12", "1 Chronicles 1:2"]),
  explicit("mahalalel", "jared", ["Genesis 5:15", "1 Chronicles 1:2"]),
  explicit("jared", "enoch", ["Genesis 5:18", "1 Chronicles 1:3"]),
  explicit("enoch", "methuselah", ["Genesis 5:21", "1 Chronicles 1:3"]),
  explicit("methuselah", "lamech", ["Genesis 5:25", "1 Chronicles 1:3"]),
  explicit("lamech", "noah", ["Genesis 5:28-29", "1 Chronicles 1:4"]),

  explicit("noah", "shem", ["Genesis 5:32", "Genesis 9:18", "1 Chronicles 1:4"]),
  explicit("noah", "ham", ["Genesis 5:32", "Genesis 9:18", "1 Chronicles 1:4"]),
  explicit("noah", "japheth", ["Genesis 5:32", "Genesis 9:18", "1 Chronicles 1:4"]),

  explicit("shem", "arphaxad", [
    "Genesis 11:10",
    "1 Chronicles 1:17",
    "Luke 3:36",
  ]),

  explicit(
    "arphaxad",
    "shelah",
    ["Genesis 11:12", "1 Chronicles 1:18"],
    {
      traditionTags: ["masoretic"],
      notes:
        "Direct Arphaxad → Shelah descent per the Masoretic Hebrew text. The Septuagint and Luke 3:36 insert Cainan between them.",
    },
  ),

  explicit("arphaxad", "cainan-lxx", ["Luke 3:36"], {
    confidenceLevel: "debated",
    traditionTags: ["septuagint", "lukan-genealogy"],
    notes:
      "Septuagint tradition (Genesis 11:13 LXX) and Luke 3:36 place Cainan between Arphaxad and Shelah.",
  }),
  explicit("cainan-lxx", "shelah", ["Luke 3:36"], {
    confidenceLevel: "debated",
    traditionTags: ["septuagint", "lukan-genealogy"],
  }),

  explicit("shelah", "eber", ["Genesis 11:14", "1 Chronicles 1:18"]),
  explicit("eber", "peleg", ["Genesis 11:16", "1 Chronicles 1:25"]),
  explicit("peleg", "reu", ["Genesis 11:18", "1 Chronicles 1:25"]),
  explicit("reu", "serug", ["Genesis 11:20", "1 Chronicles 1:26"]),
  explicit("serug", "nahor-elder", ["Genesis 11:22", "1 Chronicles 1:26"]),
  explicit("nahor-elder", "terah", ["Genesis 11:24", "1 Chronicles 1:26"]),

  explicit("terah", "abraham", ["Genesis 11:26-27", "1 Chronicles 1:27"]),
  explicit("terah", "nahor", ["Genesis 11:26"]),
  explicit("terah", "haran", ["Genesis 11:26-27"]),
  explicit("terah", "sarah", ["Genesis 20:12"], {
    confidenceLevel: "explicit",
    notes:
      "Per Genesis 20:12 Sarah was Abraham's half-sister — same father (Terah) but different mother. Implies Terah had at least two wives.",
  }),

  explicit("haran", "lot", ["Genesis 11:27", "Genesis 11:31"]),
  explicit("haran", "milcah", ["Genesis 11:29"]),
  explicit("haran", "iscah", ["Genesis 11:29"]),

  ...spouse("abraham", "sarah", [
    "Genesis 11:29",
    "Genesis 12:5",
    "Genesis 17:15",
  ]),
  ...spouse("nahor", "milcah", ["Genesis 11:29"]),

  ...spouse("abraham", "hagar", ["Genesis 16:3"], {
    relationKind: "concubine",
    notes:
      "Hagar is given to Abraham as a wife (Gen 16:3) but called handmaid/bondwoman elsewhere; treated here as a secondary wife / concubine.",
  }),
  explicit("abraham", "ishmael", ["Genesis 16:15", "Genesis 25:12"], {
    relationKind: "biological",
    notes: "Born to Hagar; treated by Abraham as son but not the son of promise.",
  }),
  motherOf("hagar", "ishmael", ["Genesis 16:15", "Genesis 21:9"]),

  explicit("abraham", "isaac", [
    "Genesis 21:2-3",
    "Genesis 25:19",
    "Matthew 1:2",
    "Luke 3:34",
  ]),
  motherOf("sarah", "isaac", ["Genesis 21:2-3"]),

  ...spouse("abraham", "keturah", ["Genesis 25:1", "1 Chronicles 1:32"], {
    relationKind: "concubine",
    notes:
      "Genesis 25:1 calls Keturah a wife; 1 Chron 1:32 calls her concubine. Tagged concubine to reflect the dominant scriptural usage and the secondary status of her line relative to Isaac.",
  }),
  explicit("abraham", "zimran", ["Genesis 25:2", "1 Chronicles 1:32"]),
  motherOf("keturah", "zimran", ["Genesis 25:2"]),
  explicit("abraham", "jokshan", ["Genesis 25:2", "1 Chronicles 1:32"]),
  motherOf("keturah", "jokshan", ["Genesis 25:2"]),
  explicit("abraham", "medan", ["Genesis 25:2", "1 Chronicles 1:32"]),
  motherOf("keturah", "medan", ["Genesis 25:2"]),
  explicit("abraham", "midian", ["Genesis 25:2", "1 Chronicles 1:32"]),
  motherOf("keturah", "midian", ["Genesis 25:2"]),
  explicit("abraham", "ishbak", ["Genesis 25:2", "1 Chronicles 1:32"]),
  motherOf("keturah", "ishbak", ["Genesis 25:2"]),
  explicit("abraham", "shuah", ["Genesis 25:2", "1 Chronicles 1:32"]),
  motherOf("keturah", "shuah", ["Genesis 25:2"]),

  explicit("lot", "moab", ["Genesis 19:36-37"], {
    relationKind: "biological",
    notes:
      "Conceived by Lot's elder daughter through incest after the destruction of Sodom; the daughter is unnamed.",
  }),
  explicit("lot", "ben-ammi", ["Genesis 19:36", "Genesis 19:38"], {
    relationKind: "biological",
    notes:
      "Conceived by Lot's younger daughter through incest after the destruction of Sodom; the daughter is unnamed.",
  }),

  explicit("ishmael", "nebaioth", ["Genesis 25:13", "1 Chronicles 1:29"]),
  explicit("ishmael", "kedar", ["Genesis 25:13", "1 Chronicles 1:29"]),
  explicit("ishmael", "adbeel", ["Genesis 25:13", "1 Chronicles 1:29"]),
  explicit("ishmael", "mibsam", ["Genesis 25:13", "1 Chronicles 1:29"]),
  explicit("ishmael", "mishma", ["Genesis 25:14", "1 Chronicles 1:30"]),
  explicit("ishmael", "dumah", ["Genesis 25:14", "1 Chronicles 1:30"]),
  explicit("ishmael", "massa", ["Genesis 25:14", "1 Chronicles 1:30"]),
  explicit("ishmael", "hadad-of-ishmael", ["Genesis 25:15", "1 Chronicles 1:30"]),
  explicit("ishmael", "tema", ["Genesis 25:15", "1 Chronicles 1:30"]),
  explicit("ishmael", "jetur", ["Genesis 25:15", "1 Chronicles 1:31"]),
  explicit("ishmael", "naphish", ["Genesis 25:15", "1 Chronicles 1:31"]),
  explicit("ishmael", "kedemah", ["Genesis 25:15", "1 Chronicles 1:31"]),

  explicit("nahor", "bethuel", ["Genesis 22:22-23"]),
  motherOf("milcah", "bethuel", ["Genesis 22:22-23"]),
  explicit("bethuel", "rebekah", ["Genesis 22:23", "Genesis 24:15", "Genesis 25:20"]),
  explicit("bethuel", "laban", ["Genesis 24:29", "Genesis 28:5"]),

  ...spouse("isaac", "rebekah", ["Genesis 24:67", "Genesis 25:20"]),
  explicit("isaac", "esau", [
    "Genesis 25:24-26",
    "Genesis 27",
    "1 Chronicles 1:34",
  ]),
  motherOf("rebekah", "esau", ["Genesis 25:24-26"]),
  explicit("isaac", "jacob", [
    "Genesis 25:24-26",
    "Genesis 27",
    "Matthew 1:2",
    "Luke 3:34",
    "1 Chronicles 1:34",
  ]),
  motherOf("rebekah", "jacob", ["Genesis 25:24-26"]),

  ...spouse("esau", "adah-of-elon", ["Genesis 26:34", "Genesis 36:2"]),
  ...spouse("esau", "aholibamah-of-anah", ["Genesis 26:34", "Genesis 36:2"]),
  ...spouse("esau", "basemath-of-ishmael", ["Genesis 28:9", "Genesis 36:3"]),
  explicit("ishmael", "basemath-of-ishmael", ["Genesis 28:9", "Genesis 36:3"]),

  explicit("esau", "eliphaz-of-esau", ["Genesis 36:4", "Genesis 36:10", "1 Chronicles 1:35"]),
  motherOf("adah-of-elon", "eliphaz-of-esau", ["Genesis 36:4", "Genesis 36:10"]),
  explicit("esau", "reuel-of-esau", ["Genesis 36:4", "Genesis 36:10", "1 Chronicles 1:35"]),
  motherOf("basemath-of-ishmael", "reuel-of-esau", ["Genesis 36:4", "Genesis 36:10"]),
  explicit("esau", "jeush", ["Genesis 36:5", "Genesis 36:14", "1 Chronicles 1:35"]),
  motherOf("aholibamah-of-anah", "jeush", ["Genesis 36:5", "Genesis 36:14"]),
  explicit("esau", "jaalam", ["Genesis 36:5", "Genesis 36:14", "1 Chronicles 1:35"]),
  motherOf("aholibamah-of-anah", "jaalam", ["Genesis 36:5", "Genesis 36:14"]),
  explicit("esau", "korah-of-esau", ["Genesis 36:5", "Genesis 36:14", "1 Chronicles 1:35"]),
  motherOf("aholibamah-of-anah", "korah-of-esau", ["Genesis 36:5", "Genesis 36:14"]),

  explicit("eliphaz-of-esau", "teman", ["Genesis 36:11", "1 Chronicles 1:36"]),
  explicit("eliphaz-of-esau", "omar", ["Genesis 36:11", "1 Chronicles 1:36"]),
  explicit("eliphaz-of-esau", "zepho", ["Genesis 36:11", "1 Chronicles 1:36"]),
  explicit("eliphaz-of-esau", "gatam", ["Genesis 36:11", "1 Chronicles 1:36"]),
  explicit("eliphaz-of-esau", "kenaz-of-edom", ["Genesis 36:11", "1 Chronicles 1:36"]),
  ...spouse("eliphaz-of-esau", "timna", ["Genesis 36:12"], {
    relationKind: "concubine",
    notes: "Timna is explicitly Eliphaz's concubine in Gen 36:12.",
  }),
  explicit("eliphaz-of-esau", "amalek", ["Genesis 36:12", "1 Chronicles 1:36"], {
    notes: "Through his concubine Timna; mother explicitly named in Gen 36:12.",
  }),
  motherOf("timna", "amalek", ["Genesis 36:12"]),

  explicit("reuel-of-esau", "nahath", ["Genesis 36:13", "1 Chronicles 1:37"]),
  explicit("reuel-of-esau", "zerah-of-edom", ["Genesis 36:13", "1 Chronicles 1:37"]),
  explicit("reuel-of-esau", "shammah", ["Genesis 36:13", "1 Chronicles 1:37"]),
  explicit("reuel-of-esau", "mizzah", ["Genesis 36:13", "1 Chronicles 1:37"]),

  ...spouse("jacob", "leah", ["Genesis 29:23-25"]),
  ...spouse("jacob", "rachel", ["Genesis 29:28-30"]),
  ...spouse("jacob", "bilhah", ["Genesis 30:4"], {
    relationKind: "concubine",
    notes:
      "Rachel's handmaid given to Jacob as a wife to bear children for Rachel; later called concubine (Gen 35:22).",
  }),
  ...spouse("jacob", "zilpah", ["Genesis 30:9"], {
    relationKind: "concubine",
    notes:
      "Leah's handmaid given to Jacob as a wife; treated alongside Bilhah as a secondary wife / concubine.",
  }),

  explicit("laban", "leah", ["Genesis 29:16"]),
  explicit("laban", "rachel", ["Genesis 29:16"]),

  explicit("jacob", "reuben", ["Genesis 29:32", "Genesis 35:23"]),
  motherOf("leah", "reuben", ["Genesis 29:32"]),
  explicit("jacob", "simeon", ["Genesis 29:33", "Genesis 35:23"]),
  motherOf("leah", "simeon", ["Genesis 29:33"]),
  explicit("jacob", "levi", ["Genesis 29:34", "Genesis 35:23"]),
  motherOf("leah", "levi", ["Genesis 29:34"]),
  explicit("jacob", "judah", ["Genesis 29:35", "Genesis 35:23", "Matthew 1:2", "Luke 3:33"]),
  motherOf("leah", "judah", ["Genesis 29:35"]),
  explicit("jacob", "issachar", ["Genesis 30:18", "Genesis 35:23"]),
  motherOf("leah", "issachar", ["Genesis 30:18"]),
  explicit("jacob", "zebulun", ["Genesis 30:20", "Genesis 35:23"]),
  motherOf("leah", "zebulun", ["Genesis 30:20"]),
  explicit("jacob", "dinah", ["Genesis 30:21", "Genesis 34:1"]),
  motherOf("leah", "dinah", ["Genesis 30:21"]),

  explicit("jacob", "joseph", ["Genesis 30:24", "Genesis 35:24"]),
  motherOf("rachel", "joseph", ["Genesis 30:24"]),
  explicit("jacob", "benjamin", ["Genesis 35:18", "Genesis 35:24"]),
  motherOf("rachel", "benjamin", ["Genesis 35:18"]),

  explicit("jacob", "dan", ["Genesis 30:6", "Genesis 35:25"]),
  motherOf("bilhah", "dan", ["Genesis 30:6"]),
  explicit("jacob", "naphtali", ["Genesis 30:8", "Genesis 35:25"]),
  motherOf("bilhah", "naphtali", ["Genesis 30:8"]),

  explicit("jacob", "gad", ["Genesis 30:11", "Genesis 35:26"]),
  motherOf("zilpah", "gad", ["Genesis 30:11"]),
  explicit("jacob", "asher", ["Genesis 30:13", "Genesis 35:26"]),
  motherOf("zilpah", "asher", ["Genesis 30:13"]),

  ...spouse("joseph", "asenath", ["Genesis 41:45", "Genesis 41:50"]),
  explicit("joseph", "manasseh", ["Genesis 41:51", "Genesis 46:20"]),
  motherOf("asenath", "manasseh", ["Genesis 41:51", "Genesis 46:20"]),
  explicit("joseph", "ephraim", ["Genesis 41:52", "Genesis 46:20"]),
  motherOf("asenath", "ephraim", ["Genesis 41:52", "Genesis 46:20"]),
];
