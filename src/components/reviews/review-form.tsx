import Button from '@/components/ui/button';
import FileInput from '@/components/ui/forms/file-input';
import { Form } from '@/components/ui/forms/form';
import Label from '@/components/ui/forms/label';
import RateInput from '@/components/ui/forms/rate-input';
import TextArea from '@/components/ui/forms/text-area';
import { Image } from '@/components/ui/image';
import { useModalState } from '@/components/ui/modal/modal.context';
import { useCreateReview, useUpdateReview } from '@/framework/review';
import { CreateReviewInput } from '@/types';
import { useTranslation } from 'next-i18next';
import * as yup from 'yup';

const reviewFormSchema = yup.object().shape({
  rating: yup.number().required('error-rating-required'),
  comment: yup.string(),
  photos: yup.array(),
});

export default function ReviewForm() {
  const { t } = useTranslation('common');
  const { data } = useModalState();
  const { createReview, isLoading: creating } = useCreateReview();
  // console.log(data);
  const { updateReview, isLoading } = useUpdateReview();

  const onSubmit = (
    values: Omit<
      CreateReviewInput,
      'product' | 'shop' | 'order' | 'variation_option_id'
    >
  ) => {
    if (data?.my_review) {
      // @ts-ignore
      updateReview({
        ...values,
        // @ts-ignore
        photos: values?.photos?.map(({ __typename, ...rest }) => rest),
        id: data.my_review.id,
        order: data.order_id,
        product: data.product,
        variation_option_id: data.variation_option_id,
      });
      return;
    }
    // @ts-ignore
    createReview({
      ...values,
      product: data.product,
      shop: data.shop_id,
      order: data.order_id,
      variation_option_id: data.variation_option_id,
    });
    console.log(data);
  };
  return (
    <div className="flex h-full min-h-screen w-screen flex-col justify-center bg-light md:h-auto md:min-h-0 md:max-w-[590px] md:rounded-xl">
      <div className="flex items-center border-b border-border-200 p-7">
        <div className="flex shrink-0">
          <Image
            src={data?.image?.thumbnail ?? '/'}
            alt={data?.name}
            width={90}
            height={90}
            className="inline-flex rounded bg-gray-200"
          />
        </div>
        <div className="ltr:pl-6 rtl:pr-6">
          <h3 className="mb-2 text-base font-semibold leading-[1.65em] text-heading">
            {data?.name}
          </h3>
        </div>
      </div>
      <div className="p-7">
        <Form<
          Omit<
            CreateReviewInput,
            'product_id' | 'shop_id' | 'variation_option_id' | 'order_id'
          >
        >
          onSubmit={onSubmit}
          validationSchema={reviewFormSchema}
          useFormProps={{
            defaultValues: {
              rating: data?.my_review?.rating ?? 0,
              comment: data?.my_review?.comment ?? '',
              photos: data?.my_review?.photos ?? [],
            },
          }}
        >
          {({ register, control, formState: { errors } }) => (
            <>
              <div className="mb-5">
                <Label className="mb-2">{t('text-give-ratings')}</Label>
                <div className="w-auto">
                  <RateInput
                    control={control}
                    name="rating"
                    defaultValue={0}
                    style={{ fontSize: 30 }}
                    allowClear={false}
                  />
                </div>
              </div>

              <TextArea
                label={t('text-description')}
                {...register('comment')}
                variant="outline"
                className="mb-5"
                error={t(errors.comment?.message!)}
              />

              <div className="mb-8">
                <Label htmlFor="photos">{t('text-upload-images')}</Label>
                <FileInput control={control} name="photos" multiple={true} />
              </div>

              <div className="mt-8">
                <Button
                  className="h-11 w-full sm:h-12"
                  loading={isLoading || creating}
                  disabled={isLoading || creating}
                >
                  {t('text-submit')}
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  );
}
