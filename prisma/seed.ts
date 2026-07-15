/**
 * prisma/seed.ts
 *
 * Migrates the static catalogue in `lib/data.ts` into the production
 * database, per `11-database-spec.md` → Migration Rules ("Migrate
 * lib/data.ts into seed scripts").
 *
 * Run with: `npx prisma db seed` (or `npx tsx prisma/seed.ts`)
 *
 * ── IMPORTANT: FLAGGED PLACEHOLDERS ──────────────────────────────────
 * `lib/data.ts` predates several fields the Prisma schema now requires.
 * Per `CLAUDE.md` → "Never invent business rules" / `08-ai-workflow.md`
 * → "flag it, don't silently diverge," the values below are explicit,
 * commented placeholders — NOT business decisions. Each is marked
 * `// TODO(decision-log)` and must be corrected once the referenced
 * open decision actually closes:
 *
 *   - sku            → placeholder scheme (`PD-<CAT>-<seq>`). No SKU
 *                       numbering convention has been decided anywhere
 *                       in the docs.
 *   - gstRate         → placeholder only. `07-commerce-rules.md` marks
 *                       GST (rate + inclusive/exclusive treatment) as
 *                       OPEN DECISION pending CA sign-off (DEC log has
 *                       no entry for this). DO NOT treat these numbers
 *                       as real tax rates.
 *   - hsnCode         → not present anywhere in `lib/data.ts`; left null.
 *   - stock /
 *     lowStockThreshold → `lib/data.ts` only has a boolean `inStock`.
 *                       Converted to a placeholder count (100 / 0) with
 *                       a nominal threshold — see DEC-010 (inventory
 *                       reservation/locking is still OPEN).
 *   - costPrice       → never existed in static data; left null.
 *   - fulfilledBy     → no product in `lib/data.ts` states who packs
 *                       and ships it (distinct from who grows/makes it);
 *                       left null.
 *   - harvestDate/
 *     packedDate/
 *     bestBefore      → `traceability.harvest` is a display string
 *                       ("Spring 2026"), not a real date, and can't be
 *                       safely parsed into one; left null. Real dates
 *                       should be entered per-batch via the admin once
 *                       it exists.
 *   - fssaiLicenseRef → never existed in static data; left null.
 *   - originState     → not in `lib/data.ts`; every current product
 *                       ships from Himachal Pradesh, so this is filled
 *                       in directly (not a placeholder — this one's true).
 *   - taxInclusive    → left at the schema default (`true`). Whether
 *                       displayed prices are actually GST-inclusive is
 *                       part of the same OPEN GST decision above.
 *
 * Everything else below (descriptions, ingredients, traceability→source
 * mapping, images, related products, subscription-plan eligibility) is
 * a direct, faithful transcription of `lib/data.ts` — not invented.
 *
 * Collections: no `Collection` data exists anywhere in `lib/data.ts`
 * (see `00-decision-log.md` DEC-008 — the *shape* is decided, but no
 * actual collection has been curated yet). This script intentionally
 * seeds none. Add a `collectionSeeds` block here once the business
 * curates a real one.
 *
 * Auth (`User`/`Account`/`Session`) and `NewsletterSubscriber`: no
 * seed-worthy data exists for these (auth is Better Auth-managed;
 * the newsletter form currently captures nothing — see
 * `06-progress.md`). Not seeded here.
 */

import { PrismaClient, ProducerType, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================
// CATEGORIES — from lib/data.ts `categories`
// ============================================================
const categorySeeds = [
  { slug: "tea", name: "Tea", displayOrder: 1 },
  { slug: "honey", name: "Honey", displayOrder: 2 },
  { slug: "preserves", name: "Fruit Preserves", displayOrder: 3 },
  { slug: "pickles", name: "Traditional Pickles", displayOrder: 4 },
] as const;

// ============================================================
// PRODUCER / SOURCE INFO — from lib/data.ts `makers`, cross-referenced
// against each product's `traceability` and `originDistrict`
// ============================================================
const producersByCategory: Record<
  string,
  { producerName: string; village: string; producerType: ProducerType }
> = {
  tea: {
    producerName: "The Kangra Tea Growers' Collective",
    village: "Palampur, Kangra Valley",
    producerType: ProducerType.cooperative,
  },
  honey: {
    producerName: "Dhauladhar Beekeepers' Cooperative",
    village: "Bir, Kangra",
    producerType: ProducerType.cooperative,
  },
  preserves: {
    producerName: "Sundarnagar Women's Self-Help Group",
    village: "Sundarnagar, Mandi",
    producerType: ProducerType.shg,
  },
  pickles: {
    producerName: "Sundarnagar Women's Self-Help Group",
    village: "Sundarnagar, Mandi",
    producerType: ProducerType.shg,
  },
};

// Placeholder SKU prefixes — TODO(decision-log): replace once a real
// SKU numbering convention is decided (see header note above).
const skuPrefixByCategory: Record<string, string> = {
  tea: "TEA",
  honey: "HNY",
  preserves: "PRV",
  pickles: "PKL",
};

// Placeholder GST rates — TODO(decision-log): replace once
// `07-commerce-rules.md` → Pricing's GST OPEN DECISION is resolved
// with a CA. These are NOT confirmed rates.
const gstRatePlaceholderByCategory: Record<string, string> = {
  tea: "5.00",
  honey: "5.00",
  preserves: "12.00",
  pickles: "12.00",
};

// ============================================================
// PRODUCTS — transcribed from lib/data.ts `products`
// ============================================================
interface ProductSeed {
  slug: string;
  name: string;
  category: keyof typeof producersByCategory;
  originDistrict: string;
  price: number; // maps to both mrp and sellingPrice — lib/data.ts has no discount data
  weight: string;
  shortDescription: string;
  description: string;
  whyWeSelected: string;
  regionStory: string;
  regionImage?: string;
  images: string[]; // primary image + galleryImages, in order
  craftMethod: string; // traceability.craft
  batchNumber: string; // traceability.batch
  ingredients: string[];
  attributes: string[];
  howToEnjoy: string[];
  storage: string;
  shippingNote: string;
  inStock: boolean;
  featured: boolean;
  showInShop: boolean;
  subscriptionEligible: boolean;
  subscriptionPlans: string[];
  relatedProducts: string[]; // slugs
  displayOrder: number;
  status: ProductStatus;
}

const productSeeds: ProductSeed[] = [
  {
    slug: "kangra-orthodox-black",
    name: "Kangra Orthodox Black Tea",
    category: "tea",
    originDistrict: "Kangra",
    price: 499,
    weight: "100g",
    shortDescription:
      "Full-bodied black tea with malt and dried fruit notes from Kangra Valley.",
    description:
      "Full-bodied black tea from the mist-covered slopes of Kangra Valley. Hand-plucked and orthodox processed to preserve the leaf's natural character. Notes of malt and dried fruit with a smooth, lingering finish.",
    whyWeSelected:
      "This tea represents the finest expression of Kangra's orthodox tradition. The hand-rolling technique creates a leaf that unfurls beautifully in the cup, releasing layers of flavour that machine-processed teas simply cannot match.",
    regionStory:
      "Kangra Valley has been producing tea since the mid-19th century, when British planters recognised the Dhauladhar range's unique climate. Today, smallholder growers continue this legacy, tending bushes at elevations where cool mist and mineral-rich soil create teas of remarkable depth.",
    images: ["/images/tea-black.jpg"],
    craftMethod: "Orthodox",
    batchNumber: "KT260301",
    ingredients: ["100% Camellia sinensis leaves"],
    attributes: ["100g", "Vegetarian", "Spring Harvest", "Orthodox"],
    howToEnjoy: [
      "Use 2g per 200ml of water at 90-95°C",
      "Steep for 3-4 minutes for full body",
      "Excellent with a splash of milk or enjoyed plain",
      "Pairs beautifully with morning toast or afternoon biscuits",
    ],
    storage:
      "Store in an airtight container away from light, moisture, and strong odours. Our tins are designed for this purpose. For optimal freshness, consume within 12 months of the harvest date printed on each tin.",
    shippingNote:
      "Shipped in protective packaging from Palampur, Himachal Pradesh. Free delivery on orders above ₹1,000.",
    inStock: true,
    featured: true,
    showInShop: true,
    subscriptionEligible: true,
    subscriptionPlans: ["essential", "family", "seasonal", "signature"],
    relatedProducts: ["kangra-green-tea", "wild-forest-honey"],
    displayOrder: 1,
    status: ProductStatus.active,
  },
  {
    slug: "kangra-green-tea",
    name: "Kangra Green Tea",
    category: "tea",
    originDistrict: "Kangra",
    price: 549,
    weight: "100g",
    shortDescription:
      "Delicate green tea with vegetal notes and a hint of sweetness from Kangra.",
    description:
      "Delicate and refreshing green tea with vegetal notes and a hint of sweetness. Minimal oxidation preserves the fresh, grassy character of the Kangra terroir.",
    whyWeSelected:
      "Kangra green tea is a hidden gem — pan-fired rather than steamed, giving it a toasty warmth that balances its natural freshness. This is the tea we reach for on quiet afternoons.",
    regionStory:
      "Grown in the cool, misty climate of Kangra Valley where the Dhauladhar range creates the perfect conditions for slow-growing, flavourful tea leaves. The pan-firing tradition here predates modern processing methods.",
    images: ["/images/tea-green.jpg"],
    craftMethod: "Pan-Fired",
    batchNumber: "KT260302",
    ingredients: ["100% Green tea leaves"],
    attributes: ["100g", "Vegetarian", "Handcrafted", "Pan-Fired"],
    howToEnjoy: [
      "Use 2g per 200ml of water at 75-80°C — cooler water preserves the delicate flavours",
      "Steep for 2-3 minutes; longer steeping brings out more body",
      "Best enjoyed plain to appreciate its vegetal character",
      "A wonderful companion to light meals and salads",
    ],
    storage:
      "Store in an airtight container away from light, moisture, and strong odours. Our tins are designed for this purpose. For optimal freshness, consume within 12 months of the harvest date printed on each tin.",
    shippingNote:
      "Shipped in protective packaging from Palampur, Himachal Pradesh. Free delivery on orders above ₹1,000.",
    inStock: true,
    featured: false,
    showInShop: true,
    subscriptionEligible: true,
    subscriptionPlans: ["essential", "family", "seasonal", "signature"],
    relatedProducts: ["kangra-orthodox-black", "wild-forest-honey"],
    displayOrder: 2,
    status: ProductStatus.active,
  },
  {
    slug: "wild-forest-honey",
    name: "Himalayan Wild Forest Honey",
    category: "honey",
    originDistrict: "Chamba",
    price: 449,
    weight: "250g",
    shortDescription:
      "Raw, unfiltered honey from wild Himalayan forests with complex floral notes.",
    description:
      "Raw, unfiltered honey collected from wild bee colonies in the Himalayan forests. Dark, rich, and complex with notes of wildflowers and tree resin.",
    whyWeSelected:
      "This honey is as close to the forest as you can get without climbing the trees yourself. Raw, unheated, and unfiltered — every jar carries the fingerprint of a specific bloom season in a specific forest.",
    regionStory:
      "The upper Himalayan forests around Bir and Chamba are home to wild Apis dorsata colonies that follow the rhododendron and wildflower blooms. Traditional beekeepers have harvested here for generations, taking only what the colonies can spare.",
    regionImage: "/images/regions/chamba.jpg",
    images: ["/images/honey-wild.jpg"],
    craftMethod: "Wild Harvested",
    batchNumber: "HW260101",
    ingredients: ["100% Raw Himalayan honey"],
    attributes: ["250g", "Vegetarian", "Raw & Unfiltered", "Wild Harvested"],
    howToEnjoy: [
      "Stir a spoonful into warm water or tea — never boiling, to preserve the enzymes",
      "Drizzle over toast, yoghurt, or seasonal fruit",
      "Use as a natural sweetener in baking and marinades",
      "A teaspoon before bed is a mountain tradition",
    ],
    storage:
      "Store at room temperature in a dry place. Crystallisation is natural and a sign of purity — gently warm the jar in sunlight or warm water to return to liquid form. Do not refrigerate.",
    shippingNote:
      "Shipped in protective packaging from Palampur, Himachal Pradesh. Free delivery on orders above ₹1,000.",
    inStock: true,
    featured: false,
    showInShop: true,
    subscriptionEligible: true,
    subscriptionPlans: ["essential", "family", "seasonal", "signature"],
    relatedProducts: ["kangra-orthodox-black", "seasonal-fruit-preserve"],
    displayOrder: 3,
    status: ProductStatus.active,
  },
  {
    slug: "seasonal-fruit-preserve",
    name: "Seasonal Fruit Preserve",
    category: "preserves",
    originDistrict: "Mandi",
    price: 349,
    weight: "200g",
    shortDescription:
      "Small-batch wild plum preserve crafted by women-led SHGs in Himachal.",
    description:
      "Small-batch fruit preserves crafted by women-led SHGs across Himachal Pradesh. The fruit changes with the season—plum, apricot, peach, apple, or pear—but the care and craftsmanship remain the same.",
    whyWeSelected:
      "These preserves capture something no factory can replicate — the patience of slow cooking and the discernment of women who have been preserving fruit their entire lives. Each jar tastes like a specific afternoon in a specific kitchen.",
    regionStory:
      "Wild plums grow along the forest edges of Mandi and Kullu districts, where women have foraged and preserved them for generations. The SHGs we partner with turn this household knowledge into a livelihood, one jar at a time.",
    regionImage: "/images/regions/mandi.jpg",
    images: ["/images/preserve-plum.jpg"],
    craftMethod: "Slow-Cooked",
    batchNumber: "FP260101",
    ingredients: ["Wild plums", "Raw sugar", "Cinnamon", "Lemon juice"],
    attributes: ["200g", "Vegetarian", "SHG Crafted", "No Preservatives"],
    howToEnjoy: [
      "Spread generously on toast, parathas, or crackers",
      "Swirl into yoghurt or oatmeal for a fruity breakfast",
      "Use as a filling for pastries and thumbprint cookies",
      "Pair with sharp cheese for an unexpected appetiser",
    ],
    storage:
      "Refrigerate after opening and consume within 4 weeks. Unopened jars keep for up to 12 months in a cool, dark cupboard. A clean, dry spoon helps preserve freshness.",
    shippingNote:
      "Shipped in protective packaging from Palampur, Himachal Pradesh. Free delivery on orders above ₹1,000.",
    inStock: true,
    featured: false,
    showInShop: true,
    subscriptionEligible: true,
    subscriptionPlans: ["essential", "family", "seasonal", "signature"],
    relatedProducts: ["wild-forest-honey", "traditional-himalayan-pickle"],
    displayOrder: 4,
    status: ProductStatus.active,
  },
  {
    slug: "traditional-himalayan-pickle",
    name: "Traditional Himalayan Pickle",
    category: "pickles",
    originDistrict: "Kangra",
    price: 279,
    weight: "200g",
    shortDescription:
      "Sun-cured hill lemon pickle made by women-led SHGs using traditional recipes.",
    description:
      "Traditional pickles handcrafted by women-led SHGs across Himachal Pradesh. Ingredients change with the seasons while preserving authentic family recipes.",
    whyWeSelected:
      "This pickle carries the authority of generations. The galgal — a citrus native to these hills — is sun-cured and pickled using recipes that haven't changed because they didn't need to. It is sharp, fragrant, and unmistakably Himalayan.",
    regionStory:
      "Galgal (Citrus pseudolimon) is native to the Himalayan foothills of Kangra and Mandi. SHG women sun-cure the fruit during the winter months, then pickle it with mustard oil and mountain spices using recipes passed down unchanged for generations.",
    regionImage: "/images/regions/kangra.jpg",
    images: ["/images/pickle-galgal.jpg"],
    craftMethod: "Sun-Cured",
    batchNumber: "TP260201",
    ingredients: [
      "Hill lemon",
      "Green chilli",
      "Mustard oil",
      "Fenugreek",
      "Nigella seeds",
      "Turmeric",
    ],
    attributes: ["200g", "Vegetarian", "Traditional Recipe", "Sun-Cured"],
    howToEnjoy: [
      "Serve alongside dal-rice, parathas, or any Indian meal",
      "A small spoonful adds brightness to sandwiches and wraps",
      "Chop finely and mix into yoghurt for a quick raita",
      "Use as a tangy topping for grilled vegetables or meats",
    ],
    storage:
      "Store in a cool, dry place. Refrigeration extends shelf life but is not required. Always use a clean, dry spoon. Best consumed within 12 months of opening.",
    shippingNote:
      "Shipped in protective packaging from Palampur, Himachal Pradesh. Free delivery on orders above ₹1,000.",
    inStock: true,
    featured: false,
    showInShop: true,
    subscriptionEligible: true,
    subscriptionPlans: ["essential", "family", "seasonal", "signature"],
    relatedProducts: ["seasonal-fruit-preserve", "kangra-orthodox-black"],
    displayOrder: 5,
    status: ProductStatus.active,
  },
];

// ============================================================
// SEED LOGIC
// ============================================================

async function seedCategories() {
  const categoryIdBySlug = new Map<string, string>();

  for (const cat of categorySeeds) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        displayOrder: cat.displayOrder,
        active: true,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        displayOrder: cat.displayOrder,
        active: true,
      },
    });
    categoryIdBySlug.set(cat.slug, record.id);
  }

  return categoryIdBySlug;
}

async function seedProducts(categoryIdBySlug: Map<string, string>) {
  const productIdBySlug = new Map<string, string>();

  for (const p of productSeeds) {
    const categoryId = categoryIdBySlug.get(p.category);
    if (!categoryId) {
      throw new Error(
        `Category "${p.category}" not seeded — check categorySeeds before productSeeds.`
      );
    }

    const skuPrefix = skuPrefixByCategory[p.category];
    const sku = `PD-${skuPrefix}-${String(p.displayOrder).padStart(3, "0")}`; // TODO(decision-log): placeholder scheme
    const gstRate = gstRatePlaceholderByCategory[p.category]; // TODO(decision-log): placeholder rate, pending CA sign-off

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        categoryId,
        shortDescription: p.shortDescription,
        description: p.description,
        whyWeSelected: p.whyWeSelected,
        regionStory: p.regionStory,
        regionImage: p.regionImage,
        ingredients: p.ingredients,
        attributes: p.attributes,
        howToEnjoy: p.howToEnjoy,
        storage: p.storage,
        shippingNote: p.shippingNote,
        weight: p.weight,
        isLimited: false,
        originDistrict: p.originDistrict,
        originState: "Himachal Pradesh",
        sku,
        hsnCode: null,
        gstRate,
        taxInclusive: true,
        mrp: p.price,
        sellingPrice: p.price,
        costPrice: null,
        stock: p.inStock ? 100 : 0, // TODO(decision-log): placeholder count, see DEC-010
        lowStockThreshold: 10, // TODO(decision-log): placeholder threshold
        shelfLife: null,
        batchNumber: p.batchNumber,
        fulfilledBy: null,
        harvestDate: null,
        packedDate: null,
        bestBefore: null,
        fssaiLicenseRef: null,
        featured: p.featured,
        showInShop: p.showInShop,
        subscriptionEligible: p.subscriptionEligible,
        subscriptionPlans: p.subscriptionPlans,
        displayOrder: p.displayOrder,
        status: p.status,
      },
      create: {
        slug: p.slug,
        name: p.name,
        categoryId,
        shortDescription: p.shortDescription,
        description: p.description,
        whyWeSelected: p.whyWeSelected,
        regionStory: p.regionStory,
        regionImage: p.regionImage,
        ingredients: p.ingredients,
        attributes: p.attributes,
        howToEnjoy: p.howToEnjoy,
        storage: p.storage,
        shippingNote: p.shippingNote,
        weight: p.weight,
        isLimited: false,
        originDistrict: p.originDistrict,
        originState: "Himachal Pradesh",
        sku,
        hsnCode: null,
        gstRate,
        taxInclusive: true,
        mrp: p.price,
        sellingPrice: p.price,
        costPrice: null,
        stock: p.inStock ? 100 : 0, // TODO(decision-log): placeholder count, see DEC-010
        lowStockThreshold: 10, // TODO(decision-log): placeholder threshold
        shelfLife: null,
        batchNumber: p.batchNumber,
        fulfilledBy: null,
        harvestDate: null,
        packedDate: null,
        bestBefore: null,
        fssaiLicenseRef: null,
        featured: p.featured,
        showInShop: p.showInShop,
        subscriptionEligible: p.subscriptionEligible,
        subscriptionPlans: p.subscriptionPlans,
        displayOrder: p.displayOrder,
        status: p.status,
      },
    });

    productIdBySlug.set(p.slug, product.id);

    // ---- ProductSource (one-to-one) ----
    const producer = producersByCategory[p.category];
    await prisma.productSource.upsert({
      where: { productId: product.id },
      update: {
        village: producer.village,
        district: p.originDistrict,
        state: "Himachal Pradesh",
        producerName: producer.producerName,
        producerType: producer.producerType,
        craftMethod: p.craftMethod,
      },
      create: {
        productId: product.id,
        village: producer.village,
        district: p.originDistrict,
        state: "Himachal Pradesh",
        producerName: producer.producerName,
        producerType: producer.producerType,
        craftMethod: p.craftMethod,
      },
    });

    // ---- ProductMedia(s) ----
    // Clear and re-insert on reseed to avoid duplicate displayOrder rows.
    await prisma.productMedia.deleteMany({ where: { productId: product.id } });
    for (const [index, url] of p.images.entries()) {
      const media = await prisma.media.upsert({
        where: { url },
        update: {
          altText: p.name,
        },
        create: {
          url,
          altText: p.name,
        },
      });

      await prisma.productMedia.create({
        data: {
          productId: product.id,
          mediaId: media.id,
          role: index === 0 ? "featured" : "gallery",
          displayOrder: index,
        },
      });
    }
  }

  return productIdBySlug;
}

async function seedRelatedProducts(productIdBySlug: Map<string, string>) {
  for (const p of productSeeds) {
    const productId = productIdBySlug.get(p.slug);
    if (!productId) continue;

    for (const [index, relatedSlug] of p.relatedProducts.entries()) {
      const relatedProductId = productIdBySlug.get(relatedSlug);
      if (!relatedProductId) {
        console.warn(
          `Skipping related product "${relatedSlug}" for "${p.slug}" — not found in seed set.`
        );
        continue;
      }

      await prisma.relatedProduct.upsert({
        where: {
          productId_relatedProductId: {
            productId,
            relatedProductId,
          },
        },
        update: { displayOrder: index },
        create: {
          productId,
          relatedProductId,
          displayOrder: index,
        },
      });
    }
  }
}

async function main() {
  console.log("Seeding categories...");
  const categoryIdBySlug = await seedCategories();

  console.log("Seeding products, sources, and images...");
  const productIdBySlug = await seedProducts(categoryIdBySlug);

  console.log("Wiring related products...");
  await seedRelatedProducts(productIdBySlug);

  console.log(
    `Done. Seeded ${categoryIdBySlug.size} categories and ${productIdBySlug.size} products.`
  );
  console.log(
    "Reminder: sku, gstRate, stock, and fulfilledBy were seeded with placeholder values — see the header comment in this file before treating this data as production-accurate."
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
