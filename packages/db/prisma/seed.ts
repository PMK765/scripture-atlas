import {
  books,
  events,
  genealogyEdges,
  people,
  places,
  translations,
  tribes,
} from "@bible-visualizer/bible-data";
import { Prisma } from "@prisma/client";
import { prisma } from "../index";

async function seedBooks(): Promise<number> {
  let upserts = 0;
  for (const book of books) {
    await prisma.book.upsert({
      where: { code: book.id },
      update: {
        name: book.name,
        abbreviation: book.abbreviation,
        testament: book.testament,
        order: book.order,
        chapters: book.chapters,
        genre: book.genre,
        authorTraditional: book.authorTraditional ?? null,
        canons: book.canons,
        originalLanguage: book.originalLanguage,
        scriptureReferences: book.scriptureReferences,
        confidenceLevel: book.confidenceLevel,
        traditionTags: book.traditionTags ?? [],
        notes: book.notes ?? null,
      },
      create: {
        code: book.id,
        name: book.name,
        abbreviation: book.abbreviation,
        testament: book.testament,
        order: book.order,
        chapters: book.chapters,
        genre: book.genre,
        authorTraditional: book.authorTraditional ?? null,
        canons: book.canons,
        originalLanguage: book.originalLanguage,
        scriptureReferences: book.scriptureReferences,
        confidenceLevel: book.confidenceLevel,
        traditionTags: book.traditionTags ?? [],
        notes: book.notes ?? null,
      },
    });
    upserts += 1;
  }
  return upserts;
}

async function seedTranslations(): Promise<{ upserts: number; pruned: number }> {
  let upserts = 0;
  for (const translation of translations) {
    await prisma.translation.upsert({
      where: { code: translation.code },
      update: {
        name: translation.name,
        language: translation.language,
        year: translation.year ?? null,
        license: translation.license,
        licenseUrl: translation.licenseUrl ?? null,
        hasDeuterocanon: translation.hasDeuterocanon,
        sourceUrl: translation.sourceUrl ?? null,
        notes: translation.notes ?? null,
      },
      create: {
        code: translation.code,
        name: translation.name,
        language: translation.language,
        year: translation.year ?? null,
        license: translation.license,
        licenseUrl: translation.licenseUrl ?? null,
        hasDeuterocanon: translation.hasDeuterocanon,
        sourceUrl: translation.sourceUrl ?? null,
        notes: translation.notes ?? null,
      },
    });
    upserts += 1;
  }
  const validCodes = translations.map((t) => t.code);
  const pruned = await prisma.translation.deleteMany({
    where: { code: { notIn: validCodes } },
  });
  return { upserts, pruned: pruned.count };
}

async function seedPeople(): Promise<{ upserts: number; pruned: number }> {
  let upserts = 0;
  for (const person of people) {
    await prisma.person.upsert({
      where: { code: person.id },
      update: {
        name: person.name,
        alternateNames: person.alternateNames ?? [],
        gender: person.gender ?? null,
        description: person.description ?? null,
        scriptureReferences: person.scriptureReferences,
        confidenceLevel: person.confidenceLevel,
        traditionTags: person.traditionTags ?? [],
        era: person.era ?? null,
        roles: person.roles ?? [],
        birthYear: person.birthYear ?? null,
        deathYear: person.deathYear ?? null,
        lifespanYears: person.lifespanYears ?? null,
        ageAtDeathRef: person.ageAtDeathRef ?? null,
        isHistoricallyContested: person.isHistoricallyContested ?? false,
        notes: person.notes ?? null,
      },
      create: {
        code: person.id,
        name: person.name,
        alternateNames: person.alternateNames ?? [],
        gender: person.gender ?? null,
        description: person.description ?? null,
        scriptureReferences: person.scriptureReferences,
        confidenceLevel: person.confidenceLevel,
        traditionTags: person.traditionTags ?? [],
        era: person.era ?? null,
        roles: person.roles ?? [],
        birthYear: person.birthYear ?? null,
        deathYear: person.deathYear ?? null,
        lifespanYears: person.lifespanYears ?? null,
        ageAtDeathRef: person.ageAtDeathRef ?? null,
        isHistoricallyContested: person.isHistoricallyContested ?? false,
        notes: person.notes ?? null,
      },
    });
    upserts += 1;
  }
  const validCodes = people.map((p) => p.id);
  const pruned = await prisma.person.deleteMany({
    where: { code: { notIn: validCodes } },
  });
  return { upserts, pruned: pruned.count };
}

async function seedGenealogyEdges(): Promise<{ inserts: number }> {
  const peopleByCode = await prisma.person.findMany({
    select: { id: true, code: true },
  });
  const codeToId = new Map(peopleByCode.map((p) => [p.code, p.id]));

  await prisma.genealogyEdge.deleteMany({});

  let inserts = 0;
  for (const edge of genealogyEdges) {
    const fromId = codeToId.get(edge.from);
    const toId = codeToId.get(edge.to);
    if (!fromId || !toId) {
      console.warn(
        `Skipping edge ${edge.from} → ${edge.to}: ${!fromId ? `from missing` : `to missing`}`,
      );
      continue;
    }
    await prisma.genealogyEdge.create({
      data: {
        fromPersonId: fromId,
        toPersonId: toId,
        relationship: edge.relationship,
        viaParent: edge.viaParent ?? null,
        relationKind: edge.relationKind ?? "biological",
        scriptureReferences: edge.scriptureReferences,
        confidenceLevel: edge.confidenceLevel,
        traditionTags: edge.traditionTags ?? [],
        notes: edge.notes ?? null,
      },
    });
    inserts += 1;
  }
  return { inserts };
}

async function seedTribes(): Promise<{
  upserts: number;
  pruned: number;
  memberships: number;
}> {
  const peopleByCode = await prisma.person.findMany({
    select: { id: true, code: true },
  });
  const codeToId = new Map(peopleByCode.map((p) => [p.code, p.id]));

  let upserts = 0;
  for (const tribe of tribes) {
    const founderId = tribe.founderId ? codeToId.get(tribe.founderId) ?? null : null;
    if (tribe.founderId && !founderId) {
      console.warn(
        `Tribe ${tribe.id}: founder ${tribe.founderId} not found in people table; storing without founder.`,
      );
    }

    const blessing: Prisma.InputJsonValue | typeof Prisma.DbNull = tribe.jacobsBlessing
      ? (tribe.jacobsBlessing as unknown as Prisma.InputJsonValue)
      : Prisma.DbNull;

    await prisma.tribe.upsert({
      where: { code: tribe.id },
      update: {
        name: tribe.name,
        alternateNames: tribe.alternateNames ?? [],
        type: tribe.type,
        founderPersonId: founderId,
        parentTribeId: null,
        description: tribe.description ?? null,
        scriptureReferences: tribe.scriptureReferences,
        confidenceLevel: tribe.confidenceLevel,
        traditionTags: tribe.traditionTags ?? [],
        notes: tribe.notes ?? null,
        jacobsBlessing: blessing,
      },
      create: {
        code: tribe.id,
        name: tribe.name,
        alternateNames: tribe.alternateNames ?? [],
        type: tribe.type,
        founderPersonId: founderId,
        description: tribe.description ?? null,
        scriptureReferences: tribe.scriptureReferences,
        confidenceLevel: tribe.confidenceLevel,
        traditionTags: tribe.traditionTags ?? [],
        notes: tribe.notes ?? null,
        jacobsBlessing: blessing,
      },
    });
    upserts += 1;
  }

  const tribeRows = await prisma.tribe.findMany({ select: { id: true, code: true } });
  const tribeCodeToId = new Map(tribeRows.map((t) => [t.code, t.id]));

  for (const tribe of tribes) {
    if (!tribe.parentTribeId) continue;
    const childId = tribeCodeToId.get(tribe.id);
    const parentId = tribeCodeToId.get(tribe.parentTribeId);
    if (!childId || !parentId) {
      console.warn(
        `Tribe hierarchy ${tribe.id} → ${tribe.parentTribeId}: missing id, skipping.`,
      );
      continue;
    }
    await prisma.tribe.update({
      where: { id: childId },
      data: { parentTribeId: parentId },
    });
  }

  const validCodes = tribes.map((t) => t.id);
  const pruned = await prisma.tribe.deleteMany({
    where: { code: { notIn: validCodes } },
  });

  await prisma.personTribe.deleteMany({});
  let memberships = 0;
  for (const person of people) {
    if (!person.tribes?.length) continue;
    const personId = codeToId.get(person.id);
    if (!personId) continue;
    for (const tribeCode of person.tribes) {
      const tribeId = tribeCodeToId.get(tribeCode);
      if (!tribeId) {
        console.warn(
          `Person ${person.id} membership in tribe ${tribeCode}: tribe not found, skipping.`,
        );
        continue;
      }
      await prisma.personTribe.create({
        data: {
          personId,
          tribeId,
          scriptureReferences: [],
          confidenceLevel: "stated",
        },
      });
      memberships += 1;
    }
  }

  return { upserts, pruned: pruned.count, memberships };
}

async function seedPlaces(): Promise<{ upserts: number; pruned: number }> {
  let upserts = 0;
  for (const place of places) {
    const prominence = place.prominence ?? (place.source ? "minor" : "major");
    await prisma.place.upsert({
      where: { code: place.id },
      update: {
        name: place.name,
        alternateNames: place.alternateNames ?? [],
        region: place.region ?? null,
        latitude: place.latitude ?? null,
        longitude: place.longitude ?? null,
        modernEquivalent: place.modernEquivalent ?? null,
        description: place.description ?? null,
        scriptureReferences: place.scriptureReferences,
        confidenceLevel: place.confidenceLevel,
        traditionTags: place.traditionTags ?? [],
        notes: place.notes ?? null,
        source: place.source ?? null,
        sourceUrl: place.sourceUrl ?? null,
        isStub: place.isStub ?? false,
        prominence,
        mentionCount: place.mentionCount ?? 0,
      },
      create: {
        code: place.id,
        name: place.name,
        alternateNames: place.alternateNames ?? [],
        region: place.region ?? null,
        latitude: place.latitude ?? null,
        longitude: place.longitude ?? null,
        modernEquivalent: place.modernEquivalent ?? null,
        description: place.description ?? null,
        scriptureReferences: place.scriptureReferences,
        confidenceLevel: place.confidenceLevel,
        traditionTags: place.traditionTags ?? [],
        notes: place.notes ?? null,
        source: place.source ?? null,
        sourceUrl: place.sourceUrl ?? null,
        isStub: place.isStub ?? false,
        prominence,
        mentionCount: place.mentionCount ?? 0,
      },
    });
    upserts += 1;
  }
  const validCodes = places.map((p) => p.id);
  const pruned = await prisma.place.deleteMany({
    where: { code: { notIn: validCodes } },
  });
  return { upserts, pruned: pruned.count };
}

async function seedEvents(): Promise<{ upserts: number; pruned: number; placeLinks: number }> {
  let upserts = 0;
  for (const event of events) {
    await prisma.event.upsert({
      where: { code: event.id },
      update: {
        name: event.name,
        category: event.category ?? null,
        description: event.description ?? null,
        startYear: event.startYear ?? null,
        endYear: event.endYear ?? null,
        scriptureReferences: event.scriptureReferences,
        confidenceLevel: event.confidenceLevel,
        traditionTags: event.traditionTags ?? [],
        notes: event.notes ?? null,
      },
      create: {
        code: event.id,
        name: event.name,
        category: event.category ?? null,
        description: event.description ?? null,
        startYear: event.startYear ?? null,
        endYear: event.endYear ?? null,
        scriptureReferences: event.scriptureReferences,
        confidenceLevel: event.confidenceLevel,
        traditionTags: event.traditionTags ?? [],
        notes: event.notes ?? null,
      },
    });
    upserts += 1;
  }
  const validCodes = events.map((e) => e.id);
  const pruned = await prisma.event.deleteMany({
    where: { code: { notIn: validCodes } },
  });

  const eventRows = await prisma.event.findMany({ select: { id: true, code: true } });
  const placeRows = await prisma.place.findMany({ select: { id: true, code: true } });
  const eventCodeToId = new Map(eventRows.map((e) => [e.code, e.id]));
  const placeCodeToId = new Map(placeRows.map((p) => [p.code, p.id]));

  await prisma.eventPlace.deleteMany({});
  let placeLinks = 0;
  for (const event of events) {
    if (!event.placeIds?.length) continue;
    const eventId = eventCodeToId.get(event.id);
    if (!eventId) continue;
    for (const placeCode of event.placeIds) {
      const placeId = placeCodeToId.get(placeCode);
      if (!placeId) {
        console.warn(`Event ${event.id}: place ${placeCode} not found, skipping link.`);
        continue;
      }
      await prisma.eventPlace.create({
        data: {
          eventId,
          placeId,
        },
      });
      placeLinks += 1;
    }
  }

  return { upserts, pruned: pruned.count, placeLinks };
}

async function main(): Promise<void> {
  const startedAt = Date.now();
  const bookCount = await seedBooks();
  const { upserts: translationCount, pruned: translationsPruned } = await seedTranslations();
  const { upserts: peopleCount, pruned: peoplePruned } = await seedPeople();
  const { inserts: edgeCount } = await seedGenealogyEdges();
  const {
    upserts: tribeCount,
    pruned: tribesPruned,
    memberships: tribeMemberships,
  } = await seedTribes();
  const { upserts: placeCount, pruned: placesPruned } = await seedPlaces();
  const {
    upserts: eventCount,
    pruned: eventsPruned,
    placeLinks: eventPlaceLinks,
  } = await seedEvents();
  const elapsed = Date.now() - startedAt;
  const tPrune = translationsPruned > 0 ? ` (pruned ${translationsPruned} obsolete)` : "";
  const pPrune = peoplePruned > 0 ? ` (pruned ${peoplePruned} obsolete)` : "";
  const trPrune = tribesPruned > 0 ? ` (pruned ${tribesPruned} obsolete)` : "";
  const plPrune = placesPruned > 0 ? ` (pruned ${placesPruned} obsolete)` : "";
  const evPrune = eventsPruned > 0 ? ` (pruned ${eventsPruned} obsolete)` : "";
  console.log(
    `Seed complete in ${elapsed}ms — ${bookCount} books, ${translationCount} translations${tPrune}, ${peopleCount} people${pPrune}, ${edgeCount} genealogy edges, ${tribeCount} tribes${trPrune}, ${tribeMemberships} memberships, ${placeCount} places${plPrune}, ${eventCount} events${evPrune} (${eventPlaceLinks} event-place links).`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
