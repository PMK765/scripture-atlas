/**
 * Merge plan: [keep_id, drop_id, reason]
 *
 * keep_id is the canonical record we keep (richer description, better naming, or earlier batch).
 * drop_id is the duplicate Person record to remove. All edges referencing drop_id
 * are rewritten to point to keep_id.
 *
 * NOT included here (deliberately kept separate):
 *   - sceva-son-1..7 — these are seven distinct sons grouped by gen-purpose audit.
 *   - philip-evangelist-daughter-1..4 — four distinct daughters.
 *   - mary-mother-of-james-and-joses vs mary-of-clopas — debated patristic identification.
 *   - salome-of-zebedee vs salome-disciple — debated identification at the cross.
 *   - tahath-ephraim vs tahath-ephraim-2 — two distinct Tahaths in 1 Chr 7:20.
 *   - eleazar-scribe vs eleazar-scribe-martyr — pre-exilic vs Maccabean.
 *   - jozabad-manasseh-1 vs jozabad-manasseh-2 — two Jozabad defectors at 1 Chr 12:20.
 *   - lucius-of-cyrene vs lucius-paul-kinsman — debated identification.
 *   - hanun-son-of-hashub vs hanun-zanoah — two Hanun wall-builders, distinct.
 *   - pedaiah-on-left vs pedaiah-parosh-builder — likely distinct.
 *   - susanna-of-galilee vs susanna — Luke 8:3 vs deuterocanonical.
 *   - hilkiah-priest vs hilkiah-of-jeremiah — debated.
 *   - jehoiada-of-benaiah vs jehoiada-aaronite — debated, kept separate.
 *   - eliam-son-of-ahithophel vs eliam-of-bathsheba — debated.
 *   - azariah-jeroham-captain vs azariah-obed-captain — two captains in 2 Chr 23.
 *   - azariah-joel-kohath vs azariah-jehallelel-merari — two Levites in 2 Chr 29:12.
 *   - paseah vs paseah-joiada — debated.
 *   - mijamin vs mijamin-priest-course — different eras. Confirmed separate.
 *   - bakbukiah vs bakbukiah-second — debated.
 */

export const merges: ReadonlyArray<readonly [keep: string, drop: string, reason: string]> = [
  ["amminadab", "amminadab-of-judah", "Same Amminadab father of Nahshon"],
  ["uri", "uri-hur", "Uri son of Hur, father of Bezalel"],
  ["elishama-son-of-ammihud", "elishama-ephraim", "Same Ephraim chief at wilderness census"],
  ["joel-son-of-pedaiah", "joel-pedaiah", "1 Chr 27:20 chief of half-Manasseh west"],
  ["hashabiah-son-of-kemuel", "hashabiah-kemuel", "1 Chr 27:17 chief over Levi"],
  ["beriah-of-ephraim", "beriah-ephraim", "Beriah son of Ephraim"],
  ["tahan-ephraim", "tahan-ephraim-num", "Same Ephraimite clan-founder"],
  ["adina-son-of-shiza", "adina-shiza", "Reubenite mighty man"],
  ["hanan-son-of-maacah", "hanan-maachah", "Mighty man 1 Chr 11:43"],
  ["uzzia-the-ashterathite", "uzzia-ashterathite", "Mighty man 1 Chr 11:44"],
  ["shama-aroerite", "shama-son-of-hotham", "Mighty man 1 Chr 11:44"],
  ["jeiel-aroerite", "jeiel-son-of-hotham", "Mighty man 1 Chr 11:44"],
  ["jediael-shimri-mighty", "jediael-son-of-shimri", "Mighty man 1 Chr 11:45"],
  ["joha-shimri-mighty", "joha-the-tizite", "Mighty man 1 Chr 11:45"],
  ["jaasiel-mezobaite", "jaasiel-the-mezobaite", "Mighty man 1 Chr 11:47"],
  ["eliezer-son-of-zichri", "eliezer-zichri", "1 Chr 27:16 chief of Reuben"],
  ["elihu-of-shemaiah", "shemaiah-elihu", "Korahite gatekeeper, son of Shemaiah"],
  ["omri-son-of-michael", "omri-michael-issachar", "1 Chr 27:18 chief of Issachar"],
  ["ishmaiah-son-of-obadiah", "ishmaiah-obadiah", "1 Chr 27:19 chief of Zebulun"],
  ["hoshea-son-of-azaziah", "hoshea-azaziah", "1 Chr 27:20 chief of Ephraim"],
  ["iddo-son-of-zechariah", "iddo-zechariah-gilead", "1 Chr 27:21 chief of half-Manasseh in Gilead"],
  ["hilkiah-priest", "hilkiah-of-jeremiah", "Same high priest who found the Book"],
  ["joel-simeon-chief", "joel-simeon-jehu", "Joel son of Joshibiah of Jehu's line, Simeonite"],
  ["zechariah-of-iddo", "zechariah-prophet", "Zechariah son of Berechiah son of Iddo"],
  ["sargon-ii", "sargon", "Same Sargon II of Assyria"],
  ["baruch-scribe", "baruch-of-jeremiah", "Baruch son of Neriah, scribe of Jeremiah"],
  ["hananiah-of-azzur", "hananiah-false-prophet", "Same false prophet Jeremiah 28"],
  ["shemaiah-of-nehelam", "shemaiah-nehelamite", "False prophet against Jeremiah"],
  ["ezra", "ezra-scribe", "Same Ezra the priest-scribe"],
  ["meshullam-of-berechiah", "meshullam-berechiah-builder", "Wall builder Neh 3:4, 30"],
  ["shemaiah-of-delaiah", "shemaiah-son-of-delaiah", "Hireling who tried to scare Nehemiah, Neh 6:10"],
  ["barzillai-the-gileadite", "barzillai-gileadite", "Same Barzillai of Rogelim"],
  ["malchijah-the-goldsmith", "malchijah-goldsmith", "Wall builder Neh 3:31"],
  ["malchijah-parosh", "malchijah-parosh-2", "Same Malchijah son of Parosh"],
  ["rehum-son-of-bani", "rehum-bani-levite", "Levite wall builder Neh 3:17"],
  ["ezer-son-of-jeshua", "ezer-jeshua-builder", "Wall builder, ruler of Mizpah Neh 3:19"],
  ["benjamin-son-of-binnui", "benjamin-builder", "Wall builder Neh 3:23"],
  ["azariah-son-of-maaseiah", "azariah-maaseiah-builder", "Wall builder Neh 3:23"],
  ["palal-son-of-uzai", "palal-uzai", "Wall builder Neh 3:25"],
  ["pedaiah-son-of-parosh", "pedaiah-parosh-builder", "Wall builder Neh 3:25"],
  ["hashum-returnee", "hashum-of-nehemiah", "Same Hashum lay clan head"],
  ["edna-of-raguel", "edna-of-tobit", "Edna wife of Raguel, Tobit's daughter-in-law's mother"],
  ["raphael-archangel", "raphael-angel", "Same archangel of Tobit"],
  ["mother-of-seven-maccabees", "mother-of-seven", "Mother of the seven martyrs in 2/4 Macc"],
  ["jehoiada-aaronite", "jehoiada-of-benaiah", "Jehoiada chief priest, father of Benaiah, leader of Aaronites at David's accession"],
  ["simeon-of-temple", "simeon-of-luke", "Simeon at the temple in Luke 2"],
  ["salome-daughter-of-herodias", "salome-of-herodias", "Salome who danced before Herod"],
  ["herod-philip-ii", "philip-tetrarch", "Philip the Tetrarch of Iturea"],
  ["trophimus", "trophimus-asia", "Trophimus the Asian, Pauline companion"],
  ["tychicus", "tychicus-asia", "Tychicus the Asian, Pauline companion"],
  ["crispus-of-corinth", "crispus-corinth", "Synagogue ruler of Corinth"],
  ["gaius-of-corinth", "gaius-corinth", "Paul's host at Corinth"],
  ["erastus-of-corinth", "erastus-treasurer", "Erastus the city treasurer of Corinth"],
  ["mary-mother-of-john-mark", "mary-of-john-mark", "Mary mother of John Mark, Acts 12:12"],
  ["secundus-of-thessalonica", "secundus", "Secundus the Thessalonian, Acts 20:4"],
  ["aristobulus-romans", "aristobulus-roman", "Aristobulus household greeted in Romans 16"],
  ["narcissus-romans", "narcissus-roman", "Narcissus household greeted in Romans 16"],
  ["rufus-mother", "mother-of-rufus", "Mother of Rufus, Romans 16:13"],
  ["hermes-rom16", "hermes-roman", "Hermes greeted in Romans 16"],
  ["julia", "julia-of-rome", "Julia greeted in Romans 16"],
  ["publius-of-malta", "publius", "Publius chief man of Malta"],
  ["publius-of-malta", "publius-malta", "Publius chief man of Malta"],
  ["mnason-of-cyprus", "mnason", "Mnason of Cyprus, Acts 21:16"],
  ["alexander-the-coppersmith", "alexander-of-paul", "Alexander the coppersmith"],
  ["alexander-the-coppersmith", "alexander-coppersmith", "Alexander the coppersmith"],
  ["claudia-roman", "claudia", "Claudia, 2 Tim 4:21"],
  ["pethahiah-priest-course", "pethahiah-priest", "Priestly course head"],
  ["jehezkel-priest-course", "jehezkel-priest", "Priestly course head"],
  ["gamul-priest-course", "gamul", "Priestly course head"],
  ["delaiah-priest-course", "delaiah-priest", "Priestly course head"],
  ["maaziah-priest-course", "maaziah", "Priestly course head"],
  ["shemaiah-rephael", "rephael-of-shemaiah", "Rephael son of Shemaiah, Korahite gatekeeper"],
  ["shemaiah-obed-son", "obed-of-shemaiah", "Obed son of Shemaiah, Korahite gatekeeper"],
  ["shemaiah-elzabad", "elzabad-of-shemaiah", "Elzabad son of Shemaiah, Korahite gatekeeper"],
  ["jozabad-son-of-jeshua", "jozabad-levite-ezra10", "Same Levite Jozabad"],
  ["jozabad-son-of-jeshua", "jozabad-outside-levite", "Same Levite Jozabad"],
  ["shebaniah-priest-returnee", "shebaniah-priest-sealer", "Priestly head Neh 12:14"],
  ["mattaniah-mica", "mattaniah-levite-returnee", "Mattaniah son of Mica the Asaphite"],
  ["mattaniah-mica", "mattaniah-mica-asaphite", "Mattaniah son of Mica the Asaphite"],
  ["titius-justus", "justus-of-corinth", "Titius Justus, Paul's host at Corinth"],
  ["laadah-mareshah", "laadah", "Laadah of Shelah's line, father of Mareshah"],
  ["zenas-the-lawyer", "zenas-lawyer", "Zenas the lawyer Titus 3:13"],
  ["clement-of-philippi", "clement-paul", "Clement, Paul's coworker at Philippi"],
  ["obadiah-prophet", "obadiah", "Same Obadiah the prophet of the book of Obadiah"],
  ["gedaliah-of-ahikam", "gedaliah-governor", "Same Gedaliah son of Ahikam, governor of Judah"],
  ["ahimaaz-of-zadok", "ahimaaz-priest", "Same Ahimaaz son of Zadok"],
  ["sarah-of-tobit", "sarah-of-raguel", "Sarah daughter of Raguel, bride of Tobias"],
  ["ziba", "ziba-of-saul", "Ziba servant of Saul's house"],
  ["eliel-mighty-47", "eliel-the-mahavite", "Eliel the Mahavite, mighty man 1 Chr 11:47"],
  ["shemaiah-wall-singer", "shemaiah-wall-trumpet-singer", "Same wall-dedication Shemaiah singer"],
  ["pashhur-of-immer", "pashhur-priest", "Pashhur son of Immer (Jer 20:1) — same priest"],
  ["urijah-prophet", "uriah-of-shemaiah", "Same Urijah son of Shemaiah of Kiriath-jearim, Jer 26:20-23"],
];
