import { PrismaClient } from "@prisma/client";

// Criando cliente Prisma usando variável de ambiente
export const prisma = new PrismaClient();

