import Logo from '@/components/ui/logo';
import cn from 'classnames';
import StaticMenu from '@/components/layouts/menu/static-menu';
import { useAtom } from 'jotai';
import { displayMobileHeaderSearchAtom } from '@/store/display-mobile-header-search-atom';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { authorizationAtom } from '@/store/authorization-atom';
import { useIsHomePage } from '@/lib/use-is-homepage';
import { useMemo, useState } from 'react';
import GroupsDropdownMenu from '@/components/layouts/menu/groups-menu';
import { useHeaderSearch } from '@/layouts/headers/header-search-atom';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { locationAtom } from '@/lib/use-location';
import { MapPin } from '@/components/icons/map-pin';
import Button from '@/components/ui/button';
import LocationBasedShopForm from '@/components/form/location-based-shop-form';
import { useSettings } from '@/framework/settings';
import { ArrowDownIcon } from '@/components/icons/arrow-down';

const Search = dynamic(() => import('@/components/ui/search/search'));
const AuthorizedMenu = dynamic(() => import('./menu/authorized-menu'), {
  ssr: false,
});
const JoinButton = dynamic(() => import('./menu/join-button'), { ssr: false });

const Header = ({ layout }: { layout?: string }) => {
  const { t } = useTranslation('common');
  const { show, hideHeaderSearch } = useHeaderSearch();
  const [displayMobileHeaderSearch] = useAtom(displayMobileHeaderSearchAtom);
  const [isAuthorize] = useAtom(authorizationAtom);
  const [openDropdown, setOpenDropdown] = useState(false);
  const isHomePage = useIsHomePage();
  const isMultilangEnable =
    process.env.NEXT_PUBLIC_ENABLE_MULTI_LANG === 'true' &&
    !!process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES;

  // useEffect(() => {
  //   if (!isHomePage) {
  //     hideHeaderSearch();
  //   }
  // }, [isHomePage]);
  const isFlattenHeader = useMemo(
    () => !show && isHomePage && layout !== 'modern',
    [show, isHomePage, layout]
  );

  const [location] = useAtom(locationAtom);
  const getLocation = location?.street_address
    ? location?.street_address
    : location?.formattedAddress;
  const closeLocation = () => setOpenDropdown(false);
  const { settings } = useSettings();

  return (
    <header
      className={cn('site-header-with-search top-0 z-50 w-full lg:h-22', {
        '': isFlattenHeader,
        'sticky lg:fixed': isHomePage,
        'sticky border-b border-border-200 shadow-sm': !isHomePage,
      })}
    >
      <div
        className={cn(
          'fixed inset-0 -z-10 h-[100vh] w-full bg-black/50',
          openDropdown === true ? '' : 'hidden'
        )}
        onClick={closeLocation}
      ></div>
      <div>
        <div
          className={cn(
            ' flex w-full transform-gpu items-center justify-between bg-light transition-transform duration-300 lg:h-22 lg:px-4 xl:px-8',
            {
              'lg:absolute lg:border-0 lg:bg-transparent lg:shadow-none':
                isFlattenHeader,
              'lg:!bg-light': openDropdown,
            }
          )}
        >
          <div className="flex w-full shrink-0 grow-0 basis-auto flex-col items-center lg:w-auto lg:flex-row">
            <Logo
              className={cn(
                'pt-2 pb-3',
                !isMultilangEnable ? 'lg:mx-0' : 'ltr:ml-0 rtl:mr-0'
              )}
            />

            {isMultilangEnable ? (
              <div className="ltr:ml-auto rtl:mr-auto lg:hidden">
                <LanguageSwitcher />
              </div>
            ) : (
              ''
            )}

            <div className="hidden ltr:ml-10 ltr:mr-auto rtl:mr-10 rtl:ml-auto xl:block">
              <GroupsDropdownMenu />
            </div>
            {settings?.useGoogleMap && (
              <div
                className={cn(
                  'relative flex w-full justify-center border-t lg:ml-8 lg:w-auto lg:border-none',
                  isFlattenHeader || (isHomePage && 'lg:hidden 2xl:flex')
                  // {
                  //   'lg:hidden xl:flex': !isFlattenHeader,
                  //   'lg:flex': !isHomePage,
                  // }
                )}
              >
                <Button
                  variant="custom"
                  className="!flex max-w-full items-center gap-2 px-0 text-sm !font-normal before:absolute before:inset-y-0 before:left-0 before:my-auto before:h-8 before:w-[1px] focus:!shadow-none focus:!ring-0 md:text-base lg:pl-5 lg:before:bg-[#E5E7EB]"
                  onClick={() => setOpenDropdown(!openDropdown)}
                >
                  <span className="flex shrink-0 grow-0 basis-auto items-center gap-1 text-base text-accent">
                    <MapPin className="h-4 w-4 " />
                    <span>Find Locations :</span>
                  </span>
                  {getLocation ? (
                    <span className="truncate pl-1 text-left leading-normal">
                      {' '}
                      {getLocation}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 pl-1 leading-normal">
                      {' '}
                      Enter your address
                    </span>
                  )}
                  <ArrowDownIcon
                    className={cn(
                      'mt-1 h-2.5 w-2.5 text-accent transition-all',
                      openDropdown ? 'rotate-180' : ''
                    )}
                  />
                </Button>
                <LocationBasedShopForm
                  className={cn(
                    'fixed inset-x-0 top-[109px] mx-auto bg-white lg:top-[82px]',
                    openDropdown === true ? '' : 'hidden'
                  )}
                  closeLocation={closeLocation}
                />
              </div>
            )}
          </div>

          {isHomePage ? (
            <>
              {(show || layout === 'modern') && (
                <div className="mx-auto hidden w-full overflow-hidden px-10 lg:block xl:w-11/12 2xl:w-10/12">
                  <Search label={t('text-search-label')} variant="minimal" />
                </div>
              )}

              {displayMobileHeaderSearch && (
                <div className="absolute top-0 block h-full w-full bg-light px-5 pt-1.5 ltr:left-0 rtl:right-0 md:pt-2 lg:hidden">
                  <Search label={t('text-search-label')} variant="minimal" />
                </div>
              )}
            </>
          ) : null}
          {/* <button
          className="px-10 ltr:ml-auto rtl:mr-auto"
          onClick={() => openModal('LOCATION_BASED_SHOP')}
        >
          Map
        </button> */}
          <ul className="hidden shrink-0 items-center space-x-7 rtl:space-x-reverse lg:flex 2xl:space-x-10">
            <StaticMenu />
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <a
                href={`${process.env.NEXT_PUBLIC_ADMIN_URL}/register`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 shrink-0 items-center justify-center rounded border border-transparent bg-accent px-3 py-0 text-sm font-semibold leading-none text-light outline-none transition duration-300 ease-in-out hover:bg-accent-hover focus:shadow focus:outline-none focus:ring-1 focus:ring-accent-700"
              >
                {t('text-become-seller')}
              </a>
              <li>{isAuthorize ? <AuthorizedMenu /> : <JoinButton />}</li>
            </div>
            {isMultilangEnable ? (
              <div className="ms-auto lg:me-5 xl:me-8 2xl:me-10 hidden flex-shrink-0 lg:block">
                <LanguageSwitcher />
              </div>
            ) : (
              ''
            )}
          </ul>
        </div>
        <div
          className={cn(
            'w-full border-b border-t border-border-200 bg-light shadow-sm',
            isHomePage ? 'hidden lg:block' : 'hidden'
          )}
        >
          {settings?.useGoogleMap && (
            <div
              className={cn(
                'relative flex w-full justify-center border-t before:absolute before:inset-y-0 before:my-auto before:h-8 before:w-[1px] lg:w-auto lg:border-none lg:pl-8 lg:before:w-0 lg:before:bg-[#E5E7EB]',
                isFlattenHeader ? 'hidden' : 'lg:flex 2xl:hidden'
              )}
            >
              <Button
                variant="custom"
                className="flex items-center gap-2 focus:!shadow-none focus:!ring-0"
                onClick={() => setOpenDropdown(!openDropdown)}
              >
                <span className="flex items-center gap-1 text-base text-accent">
                  <MapPin className="h-4 w-4 " />
                  <span className="hidden md:block">Find Locations :</span>
                </span>
                {getLocation ? (
                  <span className="flex items-center gap-2 pl-1">
                    {' '}
                    {getLocation}
                  </span>
                ) : (
                  <span className="flex items-center gap-2 pl-1">
                    {' '}
                    Enter your address
                  </span>
                )}
                <ArrowDownIcon
                  className={cn(
                    'mt-1 h-2.5 w-2.5 text-accent transition-all',
                    openDropdown ? 'rotate-180' : ''
                  )}
                />
              </Button>
              <LocationBasedShopForm
                className={cn(
                  'fixed inset-x-0 top-14 mx-auto bg-white md:top-[109px] lg:top-[128px]',
                  openDropdown === true ? '' : 'hidden'
                )}
                closeLocation={closeLocation}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
