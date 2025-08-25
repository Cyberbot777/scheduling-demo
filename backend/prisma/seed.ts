import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.assignment.deleteMany();
  await prisma.request.deleteMany();
  await prisma.family.deleteMany();
  await prisma.provider.deleteMany();

  // Providers
  const alice = await prisma.provider.create({
    data: {
      name: "Alice Johnson",
      specialty: "Doula",
      availability: { 
        monday: ["9-17"], 
        tuesday: ["12-20"], 
        wednesday: ["9-17"],
        thursday: ["12-20"],
        friday: ["9-17"]
      }
    }
  });

  const bob = await prisma.provider.create({
    data: {
      name: "Bob Smith",
      specialty: "Lactation Consultant",
      availability: { 
        monday: ["10-18"], 
        tuesday: ["8-16"], 
        wednesday: ["10-18"], 
        thursday: ["8-16"],
        friday: ["10-18"]
      }
    }
  });

  const carol = await prisma.provider.create({
    data: {
      name: "Carol Davis",
      specialty: "Overnight Newborn Care",
      availability: { 
        monday: ["20-8"], 
        tuesday: ["20-8"], 
        wednesday: ["20-8"], 
        thursday: ["20-8"],
        friday: ["20-8"],
        saturday: ["20-8"],
        sunday: ["20-8"]
      }
    }
  });

  const david = await prisma.provider.create({
    data: {
      name: "David Wilson",
      specialty: "Postpartum Nurse",
      availability: { 
        monday: ["8-16"], 
        tuesday: ["16-24"], 
        wednesday: ["8-16"], 
        thursday: ["16-24"],
        friday: ["8-16"]
      }
    }
  });

  const emma = await prisma.provider.create({
    data: {
      name: "Emma Rodriguez",
      specialty: "Doula",
      availability: { 
        monday: ["10-18"], 
        tuesday: ["9-17"], 
        wednesday: ["10-18"], 
        thursday: ["9-17"],
        friday: ["10-18"],
        saturday: ["9-17"]
      }
    }
  });

  const frank = await prisma.provider.create({
    data: {
      name: "Frank Thompson",
      specialty: "Neonatal Nurse",
      availability: { 
        monday: ["7-15"], 
        tuesday: ["15-23"], 
        wednesday: ["7-15"], 
        thursday: ["15-23"],
        friday: ["7-15"],
        saturday: ["9-17"],
        sunday: ["9-17"]
      }
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

  const family3 = await prisma.family.create({
    data: {
      name: "Martinez Family",
      consistency: true
    }
  });

  const family4 = await prisma.family.create({
    data: {
      name: "Johnson Family",
      consistency: false
    }
  });

  console.log("Seed data created successfully!");
  console.log("Providers:", [alice.name, bob.name, carol.name, david.name, emma.name, frank.name]);
  console.log("Families:", [family1.name, family2.name, family3.name, family4.name]);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
