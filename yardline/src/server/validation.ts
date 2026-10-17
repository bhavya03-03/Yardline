import { z } from 'zod';
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const code = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z][A-Z0-9]{1,7}$/, 'Use 2–8 letters and digits, beginning with a letter.');
const id = z.string().min(1).max(100);
export const yardSchema = z.object({
  code,
  name: z.string().trim().min(2).max(80),
  width: z.coerce.number().min(20).max(2000),
  height: z.coerce.number().min(20).max(2000),
  boundary: z
    .array(z.tuple([z.number(), z.number()]))
    .max(40)
    .default([]),
});
export const blockSchema = z.object({
  yardId: id,
  code,
  name: z.string().trim().min(2).max(80),
  rows: z.coerce.number().int().min(1).max(20),
  bays: z.coerce.number().int().min(1).max(30),
  rowBayCounts: z.array(z.number().int().min(1).max(30)).optional(),
  tiers: z.coerce.number().int().min(1).max(6),
  x: z.coerce.number().min(0),
  y: z.coerce.number().min(0),
  width: z.coerce.number().min(10).max(1000),
  height: z.coerce.number().min(10).max(1000),
  maxSize: z.coerce
    .number()
    .pipe(z.union([z.literal(20), z.literal(40), z.literal(45)]))
    .default(40),
  capacityLimit: z.coerce.number().int().positive().optional(),
});
export const registrationSchema = z.object({
  yardId: id,
  number: z.string().min(5).max(30),
  size: z.coerce.number().pipe(z.union([z.literal(20), z.literal(40), z.literal(45)])),
  type: z.string().trim().min(1).max(40).default('Dry'),
  owner: z.string().trim().max(80).default(''),
  notes: z.string().trim().max(1500).default(''),
  slotId: id.nullable().default(null),
  physicalConfirmed: z.boolean().default(false),
  allowException: z.boolean().default(false),
  photo: z
    .string()
    .max(2_800_000)
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
    .optional(),
});
export const moveSchema = z.object({
  yardId: id,
  containerId: id,
  slotId: id,
  expectedSlotId: id.nullable(),
  physicalConfirmed: z.literal(true, { error: 'Confirm the physical destination before saving.' }),
  notes: z.string().trim().max(1500).default(''),
});
export const dispatchSchema = z.object({
  yardId: id,
  containerId: id,
  expectedSlotId: id.nullable(),
  confirmed: z.literal(true),
  notes: z.string().trim().max(1500).default(''),
});
export const verifySchema = z.object({
  yardId: id,
  containerId: id,
  expectedSlotId: id,
  physicalConfirmed: z.literal(true),
});
export const slotSchema = z.object({
  yardId: id,
  slotId: id,
  status: z.enum(['available', 'reserved', 'blocked', 'restricted']),
});
export const zoneSchema = z.object({
  yardId: id,
  kind: z.enum(['road', 'loading', 'restricted']),
  label: z.string().trim().min(2).max(70),
  x: z.coerce.number().min(0),
  y: z.coerce.number().min(0),
  width: z.coerce.number().min(1),
  height: z.coerce.number().min(1),
});
export const updateYardSchema = yardSchema.omit({ code: true }).extend({ yardId: id });
export function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success)
    throw new AppError(
      'VALIDATION_ERROR',
      result.error.issues.map((i) => `${i.path.join('.') || 'Input'}: ${i.message}`).join(' '),
      422,
    );
  return result.data;
}
