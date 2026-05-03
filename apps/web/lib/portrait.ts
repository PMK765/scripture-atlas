export const PORTRAIT_CODES: ReadonlySet<string> = new Set([
  "adam",
  "noah",
  "abraham",
  "isaac",
  "jacob",
  "joseph",
  "moses",
  "aaron",
  "joshua",
  "samson",
  "samuel",
  "saul",
  "david",
  "solomon",
  "elijah",
  "elisha",
  "isaiah",
  "jeremiah",
  "ezekiel",
  "daniel",
  "goliath-of-gath",
  "eve",
  "sarah",
  "rebekah",
  "leah",
  "rachel",
  "ruth",
  "jesus-of-nazareth",
  "mary-mother-of-jesus",
  "john-the-baptist",
  "peter",
  "andrew-apostle",
  "james-zebedee",
  "john-apostle",
  "philip-apostle",
  "bartholomew-apostle",
  "matthew-apostle",
  "thomas-apostle",
  "james-alphaeus",
  "thaddaeus-apostle",
  "simon-zealot",
  "judas-iscariot",
  "matthias-apostle",
  "paul-apostle",
]);

export const DEFAULT_MALE_PORTRAIT = "/portraits/default-male.png";
export const DEFAULT_FEMALE_PORTRAIT = "/portraits/default-female.png";
export const DEFAULT_UNKNOWN_PORTRAIT = "/portraits/default-male.png";

export function getPortraitSrc(
  code: string | null | undefined,
  gender: string | null | undefined,
): string {
  if (code && PORTRAIT_CODES.has(code)) {
    return `/portraits/${code}.png`;
  }
  if (gender === "female") return DEFAULT_FEMALE_PORTRAIT;
  if (gender === "male") return DEFAULT_MALE_PORTRAIT;
  return DEFAULT_UNKNOWN_PORTRAIT;
}

export function hasNamedPortrait(code: string | null | undefined): boolean {
  return !!code && PORTRAIT_CODES.has(code);
}
