import { z } from "zod";

export const planSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().default("BRL").optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  features: z.string().default("[]"),
});

export const productSchema = z.object({
  id: z.string().optional(),
  businessId: z.string(),
  name: z.string().min(2),
  description: z.string().optional(),
  priceCents: z.number().int().positive(),
  currency: z.string().default("BRL").optional(),
  stock: z.number().int().nonnegative().optional(),
});

