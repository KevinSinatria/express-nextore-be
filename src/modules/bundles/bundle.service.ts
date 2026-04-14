import z from "zod";
import bundleSchema from "./bundle.schema.js";
import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import {
  createPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import { uploadImage, deleteImage } from "../../utils/cloudinary.js";
import { CustomError } from "../../utils/custom-error.js";

type GetAllBundlesParams = z.infer<typeof bundleSchema.getAllBundlesSchema>;
type GetBundleByIdParams = z.infer<typeof bundleSchema.getBundleByIdSchema>;
type CreateBundleParams = z.infer<typeof bundleSchema.createBundleSchema>;
type UpdateBundleParams = z.infer<typeof bundleSchema.updateBundleSchema>;
type DeleteBundleParams = z.infer<typeof bundleSchema.deleteBundleSchema>;

const bundleService = {
  getAllBundles: async ({ query }: { query: GetAllBundlesParams["query"] }) => {
    const { page, limit, skip } = getPaginationParams({
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
    });
    const { search, categoryId } = query;

    const where: Prisma.ProductWhereInput = {
      isBundle: true,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [bundles, count] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit || 10,
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          category: true,
          bundleComponents: {
            include: {
              component: true,
            },
          },
        },
      }),
      prisma.product.count({
        where,
      }),
    ]);

    const meta = createPaginationMeta(count, page, limit);
    return { data: bundles, meta };
  },

  getBundleById: async ({
    id,
  }: {
    id: GetBundleByIdParams["params"]["id"];
  }) => {
    try {
      const bundle = await prisma.product.findUnique({
        where: { id, isBundle: true },
        include: {
          category: true,
          bundleComponents: {
            include: {
              component: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      if (!bundle) {
        throw new CustomError(404, `Bundle with ID ${id} not found.`);
      }

      return bundle;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Bundle with ID ${id} not found.`);
        }
      }
      throw err;
    }
  },

  createBundle: async ({
    data,
    files,
  }: {
    data: CreateBundleParams["body"];
    files: Express.Multer.File[] | undefined;
  }) => {
    const { components, ...productData } = data;

    const componentIds = components.map((c) => c.componentId);
    const existingComponents = await prisma.product.findMany({
      where: {
        id: { in: componentIds },
        isBundle: false,
      },
      select: { id: true, hppAverage: true },
    });
    const hppAverage = components.reduce((acc, component) => {
      const existingComponent = existingComponents.find(
        (c) => c.id === component.componentId,
      );
      if (!existingComponent) {
        throw new CustomError(400, "One or more components are invalid.");
      }
      return acc + existingComponent.hppAverage * component.qty;
    }, 0);

    if (existingComponents.length !== componentIds.length) {
      const missingIds = componentIds.filter(
        (id) => !existingComponents.find((c) => c.id === id),
      );
      throw new CustomError(
        400,
        `Some components are missing or invalid: ${missingIds.join(", ")}`,
      );
    }

    let imageUrls: string[] = [];
    try {
      if (files && files.length > 0) {
        imageUrls = await Promise.all(
          files.map((file) => uploadImage(file.buffer, "bundles")),
        );
      }

      const bundle = await prisma.$transaction(async (tx) => {
        return await tx.product.create({
          data: {
            name: productData.name,
            sku: productData.sku,
            hppAverage,
            price: Number(productData.price),
            lowStockThreshold: 0,
            categoryId: productData.categoryId,
            description: productData.description ?? null,
            isBundle: true,
            totalStock: 0,
            images: imageUrls,
            bundleComponents: {
              create: components.map((c) => ({
                componentId: c.componentId,
                qty: c.qty,
              })),
            },
          },
          include: {
            bundleComponents: {
              include: {
                component: true,
              },
            },
          },
        });
      });

      return bundle;
    } catch (err) {
      if (imageUrls.length > 0) {
        await Promise.all(imageUrls.map((url) => deleteImage(url)));
      }
      throw err;
    }
  },

  updateBundle: async ({
    id,
    data,
    files,
  }: {
    id: UpdateBundleParams["params"]["id"];
    data: UpdateBundleParams["body"];
    files: Express.Multer.File[] | undefined;
  }) => {
    const { components, ...productData } = data;
    let newImageUrls: string[] | null = null;

    try {
      const existingBundle = await prisma.product.findUniqueOrThrow({
        where: { id, isBundle: true },
      });
      const oldImageUrls = existingBundle.images;

      if (files && files.length > 0) {
        newImageUrls = await Promise.all(
          files.map((file) => uploadImage(file.buffer, "bundles")),
        );
      }

      const bundle = await prisma.$transaction(async (tx) => {
        const updateData: Prisma.ProductUncheckedUpdateInput = {
          ...(productData.name && { name: productData.name }),
          ...(productData.sku && { sku: productData.sku }),
          ...(productData.price && { price: Number(productData.price) }),
          ...(productData.categoryId && { categoryId: productData.categoryId }),
          ...(productData.description && {
            description: productData.description,
          }),
          ...(newImageUrls && { images: newImageUrls }),
          isBundle: true,
        };

        if (components) {
          const componentIds = components.map((c) => c.componentId);
          const existingComponents = await tx.product.findMany({
            where: { id: { in: componentIds }, isBundle: false },
            select: { id: true, hppAverage: true },
          });

          if (existingComponents.length !== componentIds.length) {
            throw new CustomError(400, "One or more components are invalid.");
          }

          updateData.hppAverage = components.reduce((acc, comp) => {
            const ec = existingComponents.find(c => c.id === comp.componentId);
            return acc + (ec?.hppAverage || 0) * comp.qty;
          }, 0);

          await tx.bundleComponent.deleteMany({
            where: { bundleProductId: id },
          });

          updateData.bundleComponents = {
            create: components.map((c) => ({
              componentId: c.componentId,
              qty: c.qty,
            })),
          };
        }

        return await tx.product.update({
          where: { id },
          data: updateData,
          include: {
            bundleComponents: {
              include: {
                component: true,
              },
            },
          },
        });
      });

      if (newImageUrls && oldImageUrls.length > 0) {
        Promise.all(oldImageUrls.map((url) => deleteImage(url))).catch(
          console.error,
        );
      }

      return bundle;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Bundle with ID ${id} not found.`);
        }
      }

      if (newImageUrls && newImageUrls.length > 0) {
        await Promise.all(newImageUrls.map((url) => deleteImage(url)));
      }

      throw err;
    }
  },

  deleteBundle: async ({ id }: { id: DeleteBundleParams["params"]["id"] }) => {
    try {
      const bundle = await prisma.product.delete({
        where: { id, isBundle: true },
      });

      if (bundle.images.length > 0) {
        Promise.all(bundle.images.map((url) => deleteImage(url))).catch(
          console.error,
        );
      }

      return bundle;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Bundle with ID ${id} not found.`);
        }
      }
      throw err;
    }
  },
};

export default bundleService;
