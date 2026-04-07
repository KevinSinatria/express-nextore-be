import { Prisma } from "../generated/prisma/client.js";

/**
 * Checks if the current price of a product is less than its Average HPP.
 * Updates the `hasLossAlert` flag in the database if necessary.
 *
 * @param tx Prisma Transaction client
 * @param productId ID of the product to check
 */
export const checkLossAlert = async (
  tx: Prisma.TransactionClient,
  productId: string,
) => {
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: { price: true, hppAverage: true },
  });

  if (!product) return;

  const hasLossAlert = product.price < product.hppAverage;

  await tx.product.update({
    where: { id: productId },
    data: { hasLossAlert },
  });
};

/**
 * Synchronizes the Average HPP of all bundles containing the specified component.
 * It calculates the Sum of (Component Average HPP * Component quantity in bundle).
 * It will also trigger `checkLossAlert` for the affected bundles.
 *
 * @param tx Prisma Transaction client
 * @param componentId ID of the component that had its HPP changed
 */
export const syncBundleHpp = async (
  tx: Prisma.TransactionClient,
  componentId: string,
) => {
  const bundles = await tx.bundleComponent.findMany({
    where: { componentId },
    select: { bundleProductId: true },
  });

  for (const bundle of bundles) {
    const bundleComponents = await tx.bundleComponent.findMany({
      where: { bundleProductId: bundle.bundleProductId },
      include: {
        component: {
          select: { hppAverage: true },
        },
      },
    });

    let newBundleHpp = 0;
    for (const comp of bundleComponents) {
      newBundleHpp += comp.component.hppAverage * comp.qty;
    }

    await tx.product.update({
      where: { id: bundle.bundleProductId },
      data: { hppAverage: newBundleHpp },
    });

    await checkLossAlert(tx, bundle.bundleProductId);
  }
};
