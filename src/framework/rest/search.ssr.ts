import client from '@/framework/client';
import { API_ENDPOINTS } from '@/framework/client/api-endpoints';
import { TYPES_PER_PAGE } from '@/framework/client/variables';
import {
    CategoryQueryOptions,
    SettingsQueryOptions,
    TypeQueryOptions,
} from '@/types';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import invariant from 'tiny-invariant';

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}) => {
  invariant(params, 'params is required');
  const { searchType } = params;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.SETTINGS, { language: locale }],
    ({ queryKey }) => client.settings.all(queryKey[1] as SettingsQueryOptions)
  );

  await queryClient.prefetchQuery(
    [API_ENDPOINTS.TYPES, { limit: TYPES_PER_PAGE, language: locale }],
    ({ queryKey }) => client.types.all(queryKey[1] as TypeQueryOptions)
  );

  const categoryVariable = {
    type: searchType,
    limit: 1000,
    parent: 'null',
    language: locale
  };

  await queryClient.prefetchQuery(
    [API_ENDPOINTS.CATEGORIES, categoryVariable],
    ({ queryKey }) => client.categories.all(queryKey[1] as CategoryQueryOptions)
  );

  return {
    props: {
      ...(await serverSideTranslations(locale!?? 'en', ['common'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};
