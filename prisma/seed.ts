import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    data: [
      {
        name: "Almoço",
        description: "Pratos no almoço",
      },
      {
        name: "Jantar",
        description: "Pratos no jantar",
      },
      {
        name: "Café da Manhã",
        description: "Pratos no café da manhã",
      },
      {
        name: "Doce",
        description: "Pratos doces",
      },
      {
        name: "Salgados",
        description: "Pratos salgados",
      },
      {
        name: "Sobremesa",
        description: "Pratos de sobremesa",
      },
      {
        name: "Lanches",
        description: "Pratos de lanches",
      },
      {
        name: "Fitness",
        description: "Pratos fitness",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
    process.exit(1);
  });
