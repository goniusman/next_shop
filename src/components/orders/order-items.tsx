import { Image } from '@/components/ui/image';
import Link from '@/components/ui/link';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { Table } from '@/components/ui/table';
import { Routes } from '@/config/routes';
import { useReview } from '@/framework/review';

import { getReview } from '@/lib/get-review';
import { useIsRTL } from '@/lib/locals';
import { productPlaceholder } from '@/lib/placeholders';
import usePrice from '@/lib/use-price';
import { useTranslation } from 'next-i18next';

//FIXME: need to fix this usePrice hooks issue within the table render we may check with nested property
const OrderItemList = (_: any, record: any) => {
  const { price } = usePrice({
    amount: record?.unit_price,
  });
  // console.log(record);
  let name = record?.product?.name;
  if (record?.pivot?.variation_option_id) {
    const variationTitle = record?.variation_options?.find(
      (vo: any) => vo?.id === record?.pivot?.variation_option_id
    )['title'];
    name = `${name} - ${variationTitle}`;
  }
  return (
    <div className="flex items-center" key={record?._id}>
      <div className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded">
        <Image
          src={record?.product?.image?.thumbnail ?? productPlaceholder}
          alt={name}
          className="h-full w-full object-cover"
          layout="fill"
        />
      </div>

      <div className="flex flex-col overflow-hidden ltr:ml-4 rtl:mr-4">
        <div className="mb-1 flex space-x-1 rtl:space-x-reverse">
          <Link
            href={Routes.product(record?.product?.slug)}
            className="inline-block overflow-hidden truncate text-sm text-body transition-colors hover:text-accent hover:underline"
            locale={record?.product?.language}
          >
            {name}
          </Link>
          <span className="inline-block overflow-hidden truncate text-sm text-body">
            x
          </span>
          <span className="inline-block overflow-hidden truncate text-sm font-semibold text-heading">
            {record?.product?.unit}
          </span>
        </div>
        <span className="mb-1 inline-block overflow-hidden truncate text-sm font-semibold text-accent">
          {price}
        </span>
      </div>
    </div>
  );
};

export const OrderItems = ({
  products,
  orderId,
}: {
  products: any;
  orderId: any;
}) => {
  const { t } = useTranslation('common');
  const { alignLeft, alignRight } = useIsRTL();
  const { openModal } = useModalAction();
  // console.log(products);
  const orderTableColumns = [
    {
      title: <span className="ltr:pl-20 rtl:pr-20">{t('text-item')}</span>,
      dataIndex: 'product',
      key: 'product',
      align: alignLeft,
      width: 250,
      ellipsis: true,
      render: OrderItemList,
    },
    {
      title: t('text-quantity'),
      dataIndex: 'order_quantity',
      key: 'order_quantity',
      align: 'center',
      width: 100,
      render: function renderQuantity(order_quantity: any) {
        // console.log(pivot);
        return <p className="text-base">{order_quantity}</p>;
      },
    },
    {
      title: t('text-price'),
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: alignRight,
      width: 100,
      render: function RenderPrice(subtotal: any) {
        const { price } = usePrice({
          amount: subtotal,
        });
        return <p>{price}</p>;
      },
    },
    {
      title: '',
      dataIndex: '',
      align: alignRight,
      width: 140,
      render: function RenderReview(_: any, record: any) {
        // console.log(record);
        const { review } = useReview({
          id: record?.product._id,
        });
        // console.log(review);
        function openReviewModal() {
          openModal('REVIEW_RATING', {
            product: record?.product?._id,
            shop: record?.product?.shop_id,
            order: orderId,
            name: record?.product?.name,
            image: record?.product?.image,
            review: getReview(review),
            // my_review: getReview(record?.product),
            // ...(record.pivot?.variation_option_id && {
            //   variation_option_id: record.pivot?.variation_option_id,
            // }),
          });
        }
        // console.log(record);
        return (
          <button
            onClick={openReviewModal}
            className="cursor-pointer text-sm font-semibold text-body transition-colors hover:text-accent"
          >
            {getReview(review)
              ? t('text-update-review')
              : t('text-write-review')}
          </button>
        );
      },
    },
  ];

  return (
    <Table
      //@ts-ignore
      columns={orderTableColumns}
      data={products}
      rowKey={(record: any) =>
        record?.product?._id ? record?.product?._id : record?.product?.createdAt
      }
      className="orderDetailsTable w-full"
      rowClassName="!cursor-auto"
      scroll={{ x: 350, y: 500 }}
    />
  );
};
