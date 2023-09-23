export function formatOrderedProduct(product: any) {
  return {
    product: product?.productId ? product?.productId : product?._id,
    ...(product?.variationId
      ? { variation_option_id: product?.variationId }
      : {}),
    order_quantity: product?.quantity,
    unit_price: product?.price,
    subtotal: product?.itemTotal,
  };
}
