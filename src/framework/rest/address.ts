// import { useModalAction } from '@/components/ui/modal/modal.context';
// import type { Address, UserAddress } from '@/types';
// import { useTranslation } from 'next-i18next';
// import { useMutation, useQuery, useQueryClient } from 'react-query';
// import { toast } from 'react-toastify';
// import client from './client';
// import { API_ENDPOINTS } from './client/api-endpoints';
// import { mapPaginatorData } from './utils/data-mappers';

// // export function useReviews(options?: Partial<UserAddress>) {
// //   const {
// //     data: response,
// //     isLoading,
// //     error,
// //     isFetching,
// //   } = useQuery<any, Error>(
// //     [API_ENDPOINTS.USERS_ADDRESS, options],
// //     ({ queryKey }) =>
// //       client.addresses.all(Object.assign({}, queryKey[1] as UserAddress)),
// //     {
// //       keepPreviousData: true,
// //     }
// //   );
// //   return {
// //     reviews: response?.data ?? [],
// //     paginatorInfo: mapPaginatorData(response),
// //     isLoading,
// //     error,
// //     isFetching,
// //     hasMore: response && response?.last_page > response?.current_page,
// //   };
// // }

// // export function useReview({ id }: { id: string }) {
// //   const { data, isLoading, error } = useQuery<Review, Error>(
// //     [API_ENDPOINTS.PRODUCTS_REVIEWS, id],
// //     () => client.reviews.get({ id }),
// //     {
// //       enabled: Boolean(id),
// //     }
// //   );
// //   return {
// //     review: data,
// //     isLoading,
// //     error,
// //   };
// // }

// export function useCreateAddress() {
//   const { t } = useTranslation('common');
//   const { closeModal } = useModalAction();
//   const queryClient = useQueryClient();
//   const { mutate: createAddress, isLoading } = useMutation(
//     client.addresses.create,
//     {
//       onSuccess: (res) => {
//         toast.success(t('text-review-request-submitted'));
//       },
//       onSettled: () => {
//         queryClient.invalidateQueries([API_ENDPOINTS.USERS_ADDRESS]);
//         closeModal();
//       },
//     }
//   );
//   return {
//     createAddress,
//     isLoading,
//   };
// }

// // export function useUpdateReview() {
// //   const { t } = useTranslation('common');
// //   const { closeModal } = useModalAction();
// //   const queryClient = useQueryClient();
// //   const { mutate: updateReview, isLoading } = useMutation(
// //     client.reviews.update,
// //     {
// //       onSuccess: (res) => {
// //         toast.success(t('text-review-request-update-submitted'));
// //       },
// //       onSettled: () => {
// //         queryClient.invalidateQueries([API_ENDPOINTS.ORDERS]);
// //         closeModal();
// //       },
// //     }
// //   );
// //   return {
// //     updateReview,
// //     isLoading,
// //   };
// // }
