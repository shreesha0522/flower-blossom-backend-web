import z from "zod";

export const CreateProductDTO = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  pricePerRose: z.number().positive(),
  bouquetPrice: z.number().positive(),
  originalPricePerRose: z.number().positive(),
  originalBouquetPrice: z.number().positive(),
  discount: z.number().min(0).max(100).optional(),
  category: z.string().min(1),
  inStock: z.boolean().optional(),
});

export type CreateProductDTO = z.infer<typeof CreateProductDTO>;

export const UpdateProductDTO = CreateProductDTO.partial();
export type UpdateProductDTO = z.infer<typeof UpdateProductDTO>;