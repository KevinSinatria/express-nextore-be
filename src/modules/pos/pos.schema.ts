import z from "zod";

  const createPosSchema = z.object({
    body: z.object({
      name: z.string().min(1, "Nama POS wajib diisi"),
      location: z.string().min(1, "Lokasi POS wajib diisi"),
      deviceName: z.string().min(1, "Nama Perangkat POS wajib diisi"),
    }),
  });

  const getPosByIdSchema = z.object({
    params: z.object({
      id: z.string().min(1, "ID wajib diisi"),
    }),
  })

  const updatePosSchema = z.object({
    params: z.object({
      id: z.string().min(1, "ID wajib diisi"),
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

