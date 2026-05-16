import type { ProphecyLink } from "./types";

/**
 * Curated messianic prophecies — Old Testament prophecies of the Messiah
 * that the New Testament records as fulfilled in Jesus of Nazareth.
 *
 * Years are approximate (BC negative, AD positive). Prophecy years follow
 * the dates of the prophet's ministry; for compilations like the Psalms or
 * the Pentateuch, we use the traditional authorship date.
 *
 * This is the seed set; the catalog is intended to expand to non-messianic
 * prophecy/fulfillment pairs (judgment on nations, return from exile, etc.)
 * over time.
 */
export const prophecies: ProphecyLink[] = [
  {
    id: "seed-of-the-woman",
    title: "Seed of the woman",
    category: "lineage",
    summary:
      "The seed of the woman will crush the serpent's head; the first promise of a redeemer (the protoevangelium).",
    fulfillmentSummary:
      "Jesus, born of a woman, was made under the law to redeem those under the law and destroy the works of the devil.",
    prophecyRef: "Genesis 3:15",
    fulfillmentRef: "Galatians 4:4; 1 John 3:8",
    prophecyYear: -4004,
    fulfillmentYear: -5,
    scriptureReferences: ["Genesis 3:15", "Galatians 4:4", "1 John 3:8", "Romans 16:20"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "seed-of-abraham",
    title: "Through Abraham's seed all nations blessed",
    category: "lineage",
    summary:
      "In Abraham's seed all the nations of the earth will be blessed — a singular Seed, not many.",
    fulfillmentSummary:
      "Paul identifies the singular Seed as Christ, in whom Gentiles inherit the Abrahamic blessing.",
    prophecyRef: "Genesis 22:18",
    fulfillmentRef: "Galatians 3:16",
    prophecyYear: -2042,
    fulfillmentYear: -5,
    scriptureReferences: ["Genesis 12:3", "Genesis 22:18", "Galatians 3:8", "Galatians 3:16"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "tribe-of-judah",
    title: "From the tribe of Judah",
    category: "lineage",
    summary:
      "The scepter shall not depart from Judah, nor a lawgiver from between his feet, until Shiloh comes.",
    fulfillmentSummary:
      "Jesus is plainly descended from Judah, of which tribe Moses spoke nothing concerning the priesthood.",
    prophecyRef: "Genesis 49:10",
    fulfillmentRef: "Hebrews 7:14; Revelation 5:5",
    prophecyYear: -1859,
    fulfillmentYear: -5,
    scriptureReferences: ["Genesis 49:10", "Hebrews 7:14", "Revelation 5:5", "Matthew 1:2-3"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "star-out-of-jacob",
    title: "Star out of Jacob",
    category: "lineage",
    summary:
      "A Star shall come out of Jacob and a Scepter shall rise out of Israel — Balaam's oracle of the coming king.",
    fulfillmentSummary:
      "The Magi were drawn by a star to the new king of the Jews, born in Bethlehem.",
    prophecyRef: "Numbers 24:17",
    fulfillmentRef: "Matthew 2:1-2",
    prophecyYear: -1407,
    fulfillmentYear: -4,
    scriptureReferences: ["Numbers 24:17", "Matthew 2:1-2", "Revelation 22:16"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "house-of-david",
    title: "House and throne of David",
    category: "lineage",
    summary:
      "Yahweh promises David that his seed will sit on his throne forever — the Davidic Covenant.",
    fulfillmentSummary:
      "Gabriel announced to Mary that the Lord God would give her son the throne of his father David, and of his kingdom there will be no end.",
    prophecyRef: "2 Samuel 7:12-13",
    fulfillmentRef: "Luke 1:32-33",
    prophecyYear: -1000,
    fulfillmentYear: -5,
    scriptureReferences: [
      "2 Samuel 7:12-16",
      "Psalm 89:3-4",
      "Isaiah 9:7",
      "Luke 1:32-33",
      "Acts 2:30",
    ],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "born-of-a-virgin",
    title: "Born of a virgin",
    category: "birth",
    summary:
      "The Lord himself will give a sign: behold, the virgin shall conceive and bear a son, and shall call his name Immanuel.",
    fulfillmentSummary:
      "Mary, a virgin betrothed to Joseph, conceived by the Holy Spirit and bore Jesus — God with us.",
    prophecyRef: "Isaiah 7:14",
    fulfillmentRef: "Matthew 1:22-23",
    prophecyYear: -735,
    fulfillmentYear: -5,
    scriptureReferences: ["Isaiah 7:14", "Matthew 1:18-25", "Luke 1:26-35"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "born-in-bethlehem",
    title: "Born in Bethlehem",
    category: "birth",
    summary:
      "But you, Bethlehem Ephrathah, though you are little among the thousands of Judah, out of you shall come forth the One to be Ruler in Israel — whose goings forth are from of old, from everlasting.",
    fulfillmentSummary:
      "Jesus was born in Bethlehem of Judea in the days of Herod the king, exactly as the chief priests cited the prophecy.",
    prophecyRef: "Micah 5:2",
    fulfillmentRef: "Matthew 2:1-6",
    prophecyYear: -710,
    fulfillmentYear: -5,
    scriptureReferences: ["Micah 5:2", "Matthew 2:1-6", "Luke 2:4-7", "John 7:42"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "out-of-egypt",
    title: "Out of Egypt I called my son",
    category: "birth",
    summary:
      "When Israel was a child, then I loved him, and out of Egypt I called my son.",
    fulfillmentSummary:
      "Joseph took the child and his mother by night to Egypt and remained until Herod's death — that the saying of the prophet Hosea might be fulfilled.",
    prophecyRef: "Hosea 11:1",
    fulfillmentRef: "Matthew 2:15",
    prophecyYear: -750,
    fulfillmentYear: -4,
    scriptureReferences: ["Hosea 11:1", "Matthew 2:13-15"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "rachel-weeping",
    title: "A voice in Ramah, Rachel weeping",
    category: "birth",
    summary:
      "A voice was heard in Ramah, lamentation and bitter weeping — Rachel weeping for her children, refusing to be comforted because they are no more.",
    fulfillmentSummary:
      "Herod, mocked by the Magi, killed all the male children in Bethlehem two years old and under — Matthew sees Jeremiah's lament fulfilled.",
    prophecyRef: "Jeremiah 31:15",
    fulfillmentRef: "Matthew 2:17-18",
    prophecyYear: -627,
    fulfillmentYear: -4,
    scriptureReferences: ["Jeremiah 31:15", "Matthew 2:16-18"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "voice-in-the-wilderness",
    title: "Voice crying in the wilderness",
    category: "ministry",
    summary:
      "The voice of one crying in the wilderness: prepare the way of the Lord; make straight in the desert a highway for our God.",
    fulfillmentSummary:
      "John the Baptist appeared in the wilderness preaching baptism of repentance — all four gospels identify him as the prophesied forerunner.",
    prophecyRef: "Isaiah 40:3",
    fulfillmentRef: "Matthew 3:1-3",
    prophecyYear: -700,
    fulfillmentYear: 27,
    scriptureReferences: [
      "Isaiah 40:3",
      "Malachi 3:1",
      "Matthew 3:1-3",
      "Mark 1:1-4",
      "Luke 3:3-6",
      "John 1:23",
    ],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "galilee-of-the-gentiles",
    title: "Light dawns on Galilee",
    category: "ministry",
    summary:
      "The people who walked in darkness have seen a great light — in Galilee of the Gentiles.",
    fulfillmentSummary:
      "Jesus left Nazareth and dwelt in Capernaum by the sea, in the regions of Zebulun and Naphtali — that Isaiah's word might be fulfilled.",
    prophecyRef: "Isaiah 9:1-2",
    fulfillmentRef: "Matthew 4:13-16",
    prophecyYear: -735,
    fulfillmentYear: 27,
    scriptureReferences: ["Isaiah 9:1-2", "Matthew 4:13-16", "Luke 1:79"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "anointed-to-preach",
    title: "Anointed to preach good news",
    category: "ministry",
    summary:
      "The Spirit of the Lord God is upon me, because the Lord has anointed me to preach good tidings to the poor.",
    fulfillmentSummary:
      "Jesus stood up to read in the synagogue at Nazareth, opened to Isaiah 61, and declared: Today this scripture is fulfilled in your hearing.",
    prophecyRef: "Isaiah 61:1-2",
    fulfillmentRef: "Luke 4:17-21",
    prophecyYear: -700,
    fulfillmentYear: 28,
    scriptureReferences: ["Isaiah 61:1-2", "Luke 4:16-21"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "healer-of-the-sick",
    title: "He bore our sicknesses",
    category: "ministry",
    summary:
      "Surely he has borne our griefs and carried our sorrows; the eyes of the blind shall be opened and the lame shall leap as a deer.",
    fulfillmentSummary:
      "He healed all who were sick, that it might be fulfilled which was spoken by Isaiah the prophet.",
    prophecyRef: "Isaiah 53:4",
    fulfillmentRef: "Matthew 8:16-17",
    prophecyYear: -700,
    fulfillmentYear: 28,
    scriptureReferences: ["Isaiah 35:5-6", "Isaiah 53:4", "Matthew 8:16-17", "Matthew 11:4-5"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "speaks-in-parables",
    title: "Spoke in parables",
    category: "ministry",
    summary:
      "I will open my mouth in a parable; I will utter dark sayings of old.",
    fulfillmentSummary:
      "All these things Jesus spoke to the multitude in parables, and without a parable he did not speak to them.",
    prophecyRef: "Psalm 78:2",
    fulfillmentRef: "Matthew 13:34-35",
    prophecyYear: -1010,
    fulfillmentYear: 29,
    scriptureReferences: ["Psalm 78:2", "Matthew 13:34-35"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "triumphal-entry-on-donkey",
    title: "King comes riding on a donkey",
    category: "ministry",
    summary:
      "Rejoice greatly, O daughter of Zion! Behold, your King is coming to you; he is just and having salvation, lowly and riding on a donkey, on a colt, the foal of a donkey.",
    fulfillmentSummary:
      "Jesus entered Jerusalem on a colt at Passover; the disciples remembered these things had been written of him.",
    prophecyRef: "Zechariah 9:9",
    fulfillmentRef: "Matthew 21:4-5",
    prophecyYear: -520,
    fulfillmentYear: 30,
    scriptureReferences: [
      "Zechariah 9:9",
      "Matthew 21:1-11",
      "John 12:14-16",
      "Mark 11:1-11",
    ],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "rejected-stone",
    title: "Rejected stone made cornerstone",
    category: "ministry",
    summary:
      "The stone which the builders rejected has become the chief cornerstone.",
    fulfillmentSummary:
      "Peter declares Jesus to be that stone — rejected by the builders of Israel but made by God the head of the corner.",
    prophecyRef: "Psalm 118:22",
    fulfillmentRef: "1 Peter 2:7; Acts 4:11",
    prophecyYear: -1000,
    fulfillmentYear: 30,
    scriptureReferences: [
      "Psalm 118:22",
      "Isaiah 28:16",
      "Matthew 21:42",
      "Acts 4:11",
      "1 Peter 2:7",
    ],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "betrayed-by-friend",
    title: "Betrayed by a close friend",
    category: "betrayal",
    summary:
      "Even my own familiar friend, in whom I trusted, who ate my bread, has lifted up his heel against me.",
    fulfillmentSummary:
      "Judas Iscariot, one of the Twelve who shared the Passover meal, betrayed Jesus with a kiss — Jesus quotes this Psalm of himself.",
    prophecyRef: "Psalm 41:9",
    fulfillmentRef: "John 13:18",
    prophecyYear: -1000,
    fulfillmentYear: 30,
    scriptureReferences: ["Psalm 41:9", "John 13:18-21", "Matthew 26:23-25"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "thirty-pieces-of-silver",
    title: "Sold for thirty pieces of silver",
    category: "betrayal",
    summary:
      "If it is good, give me my wages; and if not, refrain. So they weighed out for my wages thirty pieces of silver.",
    fulfillmentSummary:
      "The chief priests counted out thirty pieces of silver to Judas as the price of betrayal.",
    prophecyRef: "Zechariah 11:12",
    fulfillmentRef: "Matthew 26:14-15",
    prophecyYear: -520,
    fulfillmentYear: 30,
    scriptureReferences: ["Zechariah 11:12-13", "Matthew 26:14-16", "Matthew 27:3-10"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "potters-field",
    title: "Money used to buy the potter's field",
    category: "betrayal",
    summary:
      "And the Lord said to me, Throw it to the potter — that princely price they set on me. So I took the thirty pieces of silver and threw them into the house of the Lord for the potter.",
    fulfillmentSummary:
      "Judas threw the silver back into the temple; the chief priests used it to buy the potter's field as a burial ground for foreigners.",
    prophecyRef: "Zechariah 11:13",
    fulfillmentRef: "Matthew 27:9-10",
    prophecyYear: -520,
    fulfillmentYear: 30,
    scriptureReferences: ["Zechariah 11:13", "Jeremiah 19:1-13", "Matthew 27:3-10"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "forsaken-by-disciples",
    title: "Disciples scattered",
    category: "betrayal",
    summary:
      "Awake, O sword, against my Shepherd, against the Man who is my Companion. Strike the Shepherd, and the sheep will be scattered.",
    fulfillmentSummary:
      "On the night of his arrest Jesus quotes this verse: All you will be made to stumble because of me this night, for it is written…",
    prophecyRef: "Zechariah 13:7",
    fulfillmentRef: "Matthew 26:31",
    prophecyYear: -520,
    fulfillmentYear: 30,
    scriptureReferences: ["Zechariah 13:7", "Matthew 26:31-56", "Mark 14:27-50"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "silent-before-accusers",
    title: "Silent before his accusers",
    category: "suffering",
    summary:
      "He was oppressed and he was afflicted, yet he opened not his mouth; he was led as a lamb to the slaughter, and as a sheep before its shearers is silent.",
    fulfillmentSummary:
      "Before the high priest, Pilate, and Herod, Jesus answered nothing — so much that the governor marveled greatly.",
    prophecyRef: "Isaiah 53:7",
    fulfillmentRef: "Matthew 27:12-14",
    prophecyYear: -700,
    fulfillmentYear: 30,
    scriptureReferences: [
      "Isaiah 53:7",
      "Matthew 27:12-14",
      "Mark 14:60-61",
      "Mark 15:4-5",
      "Acts 8:32-35",
    ],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "smitten-and-spit-upon",
    title: "Smitten and spit upon",
    category: "suffering",
    summary:
      "I gave my back to those who struck me, and my cheeks to those who plucked out the beard; I did not hide my face from shame and spitting.",
    fulfillmentSummary:
      "They spat in his face and beat him; others struck him with the palms of their hands.",
    prophecyRef: "Isaiah 50:6",
    fulfillmentRef: "Matthew 26:67; Matthew 27:30",
    prophecyYear: -700,
    fulfillmentYear: 30,
    scriptureReferences: ["Isaiah 50:6", "Matthew 26:67", "Matthew 27:30", "Mark 15:19"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "hands-and-feet-pierced",
    title: "Hands and feet pierced",
    category: "death",
    summary:
      "Dogs have surrounded me; the assembly of the wicked has enclosed me. They pierced my hands and my feet.",
    fulfillmentSummary:
      "The Roman crucifixion drove nails through Jesus' hands and feet — Thomas saw the print of the nails after the resurrection.",
    prophecyRef: "Psalm 22:16",
    fulfillmentRef: "John 20:25-27; Luke 24:39-40",
    prophecyYear: -1000,
    fulfillmentYear: 30,
    scriptureReferences: ["Psalm 22:16", "Zechariah 12:10", "John 20:25-27", "Luke 24:39-40"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "crucified-with-criminals",
    title: "Numbered with the transgressors",
    category: "death",
    summary:
      "He was numbered with the transgressors, and he bore the sin of many, and made intercession for the transgressors.",
    fulfillmentSummary:
      "Two robbers were crucified with Jesus, one on his right and one on his left — that the scripture might be fulfilled.",
    prophecyRef: "Isaiah 53:12",
    fulfillmentRef: "Mark 15:27-28; Luke 22:37",
    prophecyYear: -700,
    fulfillmentYear: 30,
    scriptureReferences: ["Isaiah 53:12", "Mark 15:27-28", "Luke 22:37", "Luke 23:32-33"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "garments-divided",
    title: "Garments divided, lots cast",
    category: "death",
    summary:
      "They divide my garments among them, and for my clothing they cast lots.",
    fulfillmentSummary:
      "The soldiers divided his outer garments into four parts; for his seamless tunic they cast lots — that the scripture might be fulfilled.",
    prophecyRef: "Psalm 22:18",
    fulfillmentRef: "John 19:23-24",
    prophecyYear: -1000,
    fulfillmentYear: 30,
    scriptureReferences: ["Psalm 22:18", "Matthew 27:35", "John 19:23-24"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "gall-and-vinegar",
    title: "Given gall and vinegar to drink",
    category: "death",
    summary:
      "They also gave me gall for my food, and for my thirst they gave me vinegar to drink.",
    fulfillmentSummary:
      "They offered him sour wine mingled with gall to drink — and again at his cry of thirst, sour wine on a sponge.",
    prophecyRef: "Psalm 69:21",
    fulfillmentRef: "Matthew 27:34, 48; John 19:28-30",
    prophecyYear: -1000,
    fulfillmentYear: 30,
    scriptureReferences: ["Psalm 69:21", "Matthew 27:34", "Matthew 27:48", "John 19:28-30"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "my-god-why",
    title: "My God, my God, why have you forsaken me?",
    category: "death",
    summary:
      "My God, my God, why have you forsaken me? Why are you so far from helping me, from the words of my groaning?",
    fulfillmentSummary:
      "About the ninth hour Jesus cried out with a loud voice, quoting Psalm 22 from the cross.",
    prophecyRef: "Psalm 22:1",
    fulfillmentRef: "Matthew 27:46",
    prophecyYear: -1000,
    fulfillmentYear: 30,
    scriptureReferences: ["Psalm 22:1", "Matthew 27:46", "Mark 15:34"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "no-bones-broken",
    title: "Not a bone broken",
    category: "death",
    summary:
      "He guards all his bones; not one of them is broken — also of the Passover lamb, no bone shall be broken.",
    fulfillmentSummary:
      "When the soldiers came to break his legs to hasten death, they saw he was already dead — that the scripture should be fulfilled.",
    prophecyRef: "Psalm 34:20",
    fulfillmentRef: "John 19:33-36",
    prophecyYear: -1000,
    fulfillmentYear: 30,
    scriptureReferences: ["Psalm 34:20", "Exodus 12:46", "Numbers 9:12", "John 19:33-36"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "side-pierced",
    title: "Side pierced",
    category: "death",
    summary:
      "They will look on me whom they pierced; they will mourn for him as one mourns for his only son.",
    fulfillmentSummary:
      "One of the soldiers pierced his side with a spear, and immediately blood and water came out — and these things were done that the scripture should be fulfilled.",
    prophecyRef: "Zechariah 12:10",
    fulfillmentRef: "John 19:34, 37",
    prophecyYear: -520,
    fulfillmentYear: 30,
    scriptureReferences: ["Zechariah 12:10", "John 19:34-37", "Revelation 1:7"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "buried-with-the-rich",
    title: "Buried with the rich",
    category: "death",
    summary:
      "And they made his grave with the wicked, but with the rich at his death, because he had done no violence.",
    fulfillmentSummary:
      "Joseph of Arimathea, a rich man and a disciple, took the body of Jesus and laid it in his own new tomb hewn out of rock.",
    prophecyRef: "Isaiah 53:9",
    fulfillmentRef: "Matthew 27:57-60",
    prophecyYear: -700,
    fulfillmentYear: 30,
    scriptureReferences: ["Isaiah 53:9", "Matthew 27:57-60", "John 19:38-42"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "resurrection",
    title: "Soul not left in the grave",
    category: "resurrection",
    summary:
      "For you will not leave my soul in Sheol, nor will you allow your Holy One to see corruption.",
    fulfillmentSummary:
      "Peter at Pentecost: David, being a prophet, foresaw and spoke of the resurrection of the Christ — his soul was not left in Hades, nor did his flesh see corruption.",
    prophecyRef: "Psalm 16:10",
    fulfillmentRef: "Acts 2:27-31",
    prophecyYear: -1000,
    fulfillmentYear: 30,
    scriptureReferences: ["Psalm 16:8-11", "Acts 2:25-31", "Acts 13:35-37"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "ascended-on-high",
    title: "Ascended on high",
    category: "exaltation",
    summary:
      "You have ascended on high; you have led captivity captive; you have received gifts among men.",
    fulfillmentSummary:
      "Paul applies this Psalm to Christ: when he ascended on high, he led captivity captive and gave gifts to men.",
    prophecyRef: "Psalm 68:18",
    fulfillmentRef: "Ephesians 4:8",
    prophecyYear: -1000,
    fulfillmentYear: 30,
    scriptureReferences: ["Psalm 68:18", "Ephesians 4:8-10", "Acts 1:9-11"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "right-hand-of-god",
    title: "Seated at God's right hand",
    category: "exaltation",
    summary:
      "The Lord said to my Lord: sit at my right hand, until I make your enemies your footstool.",
    fulfillmentSummary:
      "Christ, after offering one sacrifice for sins forever, sat down at the right hand of God — quoted by Jesus himself, Peter, and Hebrews.",
    prophecyRef: "Psalm 110:1",
    fulfillmentRef: "Hebrews 1:3, 13; Acts 2:34-35",
    prophecyYear: -1000,
    fulfillmentYear: 30,
    scriptureReferences: [
      "Psalm 110:1",
      "Matthew 22:41-46",
      "Acts 2:34-35",
      "Hebrews 1:3",
      "Hebrews 1:13",
      "Hebrews 10:12",
    ],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "light-to-the-gentiles",
    title: "Light to the Gentiles",
    category: "kingdom",
    summary:
      "I will also give you as a light to the Gentiles, that you should be my salvation to the ends of the earth.",
    fulfillmentSummary:
      "Paul and Barnabas at Antioch: For so the Lord has commanded us — I have set you as a light to the Gentiles. The Gentiles rejoiced and glorified the word of the Lord.",
    prophecyRef: "Isaiah 49:6",
    fulfillmentRef: "Acts 13:47; Luke 2:32",
    prophecyYear: -700,
    fulfillmentYear: 47,
    scriptureReferences: ["Isaiah 42:6", "Isaiah 49:6", "Luke 2:32", "Acts 13:47"],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "priest-after-melchizedek",
    title: "Eternal priest after Melchizedek",
    category: "exaltation",
    summary:
      "The Lord has sworn and will not relent: you are a priest forever according to the order of Melchizedek.",
    fulfillmentSummary:
      "Hebrews argues that Christ, not from the tribe of Levi but from Judah, is a priest forever after the order of Melchizedek.",
    prophecyRef: "Psalm 110:4",
    fulfillmentRef: "Hebrews 5:6; 6:20; 7:17",
    prophecyYear: -1000,
    fulfillmentYear: 30,
    scriptureReferences: [
      "Genesis 14:18-20",
      "Psalm 110:4",
      "Hebrews 5:5-10",
      "Hebrews 6:20",
      "Hebrews 7:17",
    ],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "elijah-forerunner",
    title: "Forerunner like Elijah",
    category: "ministry",
    summary:
      "Behold, I will send you Elijah the prophet before the coming of the great and dreadful day of the Lord.",
    fulfillmentSummary:
      "Jesus said of John the Baptist: All the prophets and the law prophesied until John. And if you are willing to receive it, he is Elijah who is to come.",
    prophecyRef: "Malachi 4:5-6",
    fulfillmentRef: "Matthew 11:13-14; 17:10-13",
    prophecyYear: -430,
    fulfillmentYear: 27,
    scriptureReferences: [
      "Malachi 3:1",
      "Malachi 4:5-6",
      "Matthew 11:13-14",
      "Matthew 17:10-13",
      "Luke 1:17",
    ],
    status: "fulfilled",
    confidenceLevel: "stated",
  },
  {
    id: "second-coming-clouds",
    title: "Coming with the clouds of heaven",
    category: "second-coming",
    summary:
      "I was watching in the night visions, and behold, One like the Son of Man, coming with the clouds of heaven! He came to the Ancient of Days, and was given dominion and glory and a kingdom.",
    fulfillmentSummary:
      "Jesus repeatedly applies Daniel's vision to himself; the New Testament looks forward to its consummation at his return.",
    prophecyRef: "Daniel 7:13-14",
    fulfillmentRef: "Matthew 26:64; Revelation 1:7",
    prophecyYear: -537,
    scriptureReferences: [
      "Daniel 7:13-14",
      "Matthew 24:30",
      "Matthew 26:64",
      "Mark 14:62",
      "Revelation 1:7",
    ],
    status: "partially-fulfilled",
    confidenceLevel: "stated",
    notes:
      "Inaugurated at the ascension (Acts 1:9, Daniel 7:13's coming is to the Ancient of Days, not down to earth) but consummated at the parousia.",
  },
];
