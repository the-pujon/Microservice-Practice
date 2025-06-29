import { z } from "zod";

export const InventoryCreatedToSchema = z.object({
    productId: z.string(),
    sku: z.string(),
    quantity: z.number().int().positive().optional().default(0),
})

export type InventoryCreatedTo = z.infer<typeof InventoryCreatedToSchema>;