import { Eye } from '@/components/icons/eye-icon';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/cards/card';
import ErrorMessage from '@/components/ui/error-message';
import Link from '@/components/ui/link';
import { Table } from '@/components/ui/table';
import { Routes } from '@/config/routes';
import { useRefunds } from '@/framework/order';
import { useIsRTL } from '@/lib/locals';
import usePrice from '@/lib/use-price';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

type AlignType = 'left' | 'right' | 'center';
const RenderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation('common');
  switch (status?.toLowerCase()) {
    case 'approved':
      return <Badge text={t('text-approved')} color="bg-accent" />;
    case 'rejected':
      return <Badge text={t('text-rejected')} color="bg-red-500" />;
    case 'processing':
      return <Badge text={t('text-processing')} color="bg-yellow-500" />;
    default:
      return <Badge text={t('text-pending')} color="bg-purple-500" />;
  }
};

const RefundView: React.FC = () => {
  const { t } = useTranslation('common');
  const { alignLeft, alignRight } = useIsRTL();

  const { error, refunds } = useRefunds({
    limit: 10,
  });
  // console.log(refunds);
  let err: any = error;
  const refundTableColumns = useMemo(
    () => [
      {
        title: t('text-id'),
        dataIndex: '_id',
        key: '_id',
        align: 'center' as AlignType,
        ellipsis: true,
        className: '!text-sm',
        width: 75,
      },
      {
        title: t('text-reason'),
        dataIndex: 'title',
        key: 'title',
        align: alignLeft as AlignType,
        ellipsis: true,
        className: '!text-sm',
        width: 220,
        render: function renderQuantity(title: any) {
          return <p className="whitespace-nowrap">{title}</p>;
        },
      },
      {
        title: t('text-status'),
        dataIndex: 'status',
        key: 'status',
        align: 'center' as AlignType,
        ellipsis: true,
        className: '!text-sm',
        width: 160,
        render: function renderStatus(status: any) {
          return <RenderStatusBadge status={status} />;
        },
      },
      {
        title: t('text-tracking-number'),
        dataIndex: 'order',
        key: 'order',
        align: 'center' as AlignType,
        className: '!text-sm',
        width: 160,
        render: function renderTrackingNumber(order: any) {
          return <p>{order?.tracking_number || order}</p>;
        },
      },
      {
        title: t('text-amount'),
        dataIndex: 'order',
        key: 'order',
        align: alignRight as AlignType,
        className: '!text-sm',
        width: 150,
        render: function RenderPrice(order: any) {
          const { price } = usePrice({
            amount: order?.amount,
          });
          return <p>{price}</p>;
        },
      },
      {
        title: t('text-date'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        align: 'center' as AlignType,
        className: '!text-sm',
        width: 160,
        render: (date: string) => {
          dayjs.extend(relativeTime);
          dayjs.extend(utc);
          dayjs.extend(timezone);
          return (
            <span className="whitespace-nowrap">
              {dayjs.utc(date).tz(dayjs.tz.guess()).fromNow()}
            </span>
          );
        },
      },
      {
        title: t('text-details'),
        dataIndex: 'order',
        key: 'order',
        align: 'center' as AlignType,
        className: '!text-sm',
        width: 100,
        render: (order: any) => (
          <Link
            href={Routes.order(order?.tracking_number)}
            className="inline-block text-body transition duration-200 hover:text-accent-hover focus:text-accent-hover"
            title={t('text-view-order')}
          >
            <Eye width={20} />
          </Link>
        ),
      },
    ],
    [alignLeft, alignRight, t]
  );

  if (err) return <ErrorMessage message={err?.message} />;
  return (
    <Card className="min-h-screen w-full self-stretch overflow-hidden lg:min-h-0">
      <h3 className="mb-8 text-center text-2xl font-semibold text-heading">
        {t('text-my-refunds')}
      </h3>
      <Table
        columns={refundTableColumns}
        data={refunds}
        rowKey={(record: any) => record?.createdAt}
        className="orderDetailsTable w-full border border-gray-200"
        scroll={{ x: 500, y: 700 }}
      />
    </Card>
  );
};

export default RefundView;
