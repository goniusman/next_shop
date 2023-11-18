import { useCart } from '@/store/quick-cart/cart.context';
import { generateCartItem } from '@/store/quick-cart/generate-cart-item';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface Props {
  data: any;
  variant?:
    | 'helium'
    | 'neon'
    | 'argon'
    | 'oganesson'
    | 'single'
    | 'big'
    | 'bordered';
  counterVariant?:
    | 'helium'
    | 'neon'
    | 'argon'
    | 'oganesson'
    | 'single'
    | 'details'
    | 'bordered';
  counterClass?: string;
  variation?: any;
  disabled?: boolean;
}

export const AddToCartExternal = ({
  data,
  variant = 'helium',
  counterVariant,
  counterClass,
  variation,
  disabled,
}: Props) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { addItemToCart, isInStock, isInCart, updateCartLanguage, language } =
    useCart();
  const item = generateCartItem(data, variation);
  const [quantity, setQuantity] = useState<number>(1);

  return (
    <div className="flex items-center space-x-3 rtl:space-x-reverse">
      <Link
        legacyBehavior
        href={data?.external_product_url}
        target="_blank"
        className="inline-flex h-10 w-full max-w-sm !shrink items-center justify-center rounded border border-transparent bg-accent px-5 py-0 font-semibold leading-none text-light outline-none transition duration-300 ease-in-out hover:bg-accent-hover focus:shadow focus:outline-0 focus:ring-1 focus:ring-accent-700"
      >
        {data?.external_product_button_text}
      </Link>
    </div>
  );
};
