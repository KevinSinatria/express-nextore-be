import z from "zod";

  const createPosSchema = z.object({
    body: z.object({
      name: z.string().min(1, "POS Name is required"),
      location: z.string().min(1, "POS Location is required"),
      deviceName: z.string().min(1, "POS Device Name is required"),
    }),
  });

  const getPosByIdSchema = z.object({
    params: z.object({
      id: z.string().min(1, "ID is required"),
    }),
  })

  const updatePosSchema = z.object({
    params: z.object({
      id: z.string().min(1, "ID is required"),
    }),
    body: z.object({
      name: z.string().min(1).optional(),
      location: z.string().min(1).optional(),
      deviceName: z.string().min(1).optional(),
    }),
  });

const posSchema = {
  createPosSchema,
  getPosByIdSchema,
  updatePosSchema,
};

export default posSchema;

