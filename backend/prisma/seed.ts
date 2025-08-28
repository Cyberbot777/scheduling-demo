import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear old data in the correct order (respecting relations)
  await prisma.assignment.deleteMany();
  await prisma.request.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.family.deleteMany();

  // Families will be created after we define last names so we can generate varied names

  // Data pools for randomization
  const firstNames = [
    "Alice", "Bob", "Carol", "David", "Emma", "Frank", "Grace", "Henry", "Ivy", "Jack",
    "Liam", "Mia", "Noah", "Olivia", "Sophia", "Ethan", "Isabella", "Mason", "Ava", "Logan"
  ];
  const lastNames = [
    "Johnson", "Smith", "Davis", "Wilson", "Rodriguez", "Thompson", "Brown", "Taylor",
    "Anderson", "Clark", "Martinez", "Lopez", "Harris", "Young", "King", "Scott"
  ];

  // Seed 10 Families (mix of consistency preferences)
  const familiesData = Array.from({ length: 10 }).map((_, i) => ({
    name: `${lastNames[i]} Family`,
    consistency: i < 5 // first 5 prefer consistency, next 5 do not
  }));
  await prisma.family.createMany({ data: familiesData });
  const specialties = [
    "Doula",
    "Lactation Consultant",
    "Postpartum Nurse",
    "Overnight Newborn Care",
    "Neonatal Nurse"
  ];

  // Helper: random availability generator
  function randomAvailability() {
  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  const availability: Record<string, string[]> = {};
  const guaranteedDay = days[Math.floor(Math.random() * days.length)];
  const start = Math.floor(Math.random() * 12 + 6);  // 6–18
  const end = start + Math.floor(Math.random() * 6 + 4); // 4–10 hr shifts
  availability[guaranteedDay] = [`${start}-${end}`];

  // Randomly add more days
  days.forEach(day => {
    if (day !== guaranteedDay && Math.random() > 0.5) {
      const s = Math.floor(Math.random() * 12 + 6);
      const e = s + Math.floor(Math.random() * 6 + 4);
      availability[day] = [`${s}-${e}`];
    }
  });

  return availability;
}


  // Generate 50 providers
  const providers = Array.from({ length: 50 }).map((_, i) => {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return {
      name: `${first} ${last}`,
      specialty: specialties[Math.floor(Math.random() * specialties.length)],
      availability: randomAvailability(),
    };
  });

  await prisma.provider.createMany({ data: providers });

  console.log("Database reset and seeded with 10 families + 50 providers!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
