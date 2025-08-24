import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Providers
  const alice = await prisma.provider.create({
    data: {
      name: "Alice Johnson",
      specialty: "Doula",
      availability: { monday: ["9-17"], tuesday: ["12-20"] }
    }
  });

  const bob = await prisma.provider.create({
    data: {
      name: "Bob Smith",
      specialty: "Lactation Consultant",
      availability: { wednesday: ["10-18"], friday: ["8-16"] }
    }
  });

  // Families
  const family1 = await prisma.family.create({
    data: {
      name: "Williams Family",
      consistency: true
    }
  });

  const family2 = await prisma.family.create({
    data: {
      name: "Nguyen Family",
      consistency: false
    }
  });

  console.log({ alice, bob, family1, family2 });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
