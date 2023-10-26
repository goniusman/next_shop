import Logo from '@/components/ui/logo';
import cn from 'classnames';
import { useAtom } from 'jotai';
// import { displayHeaderSearchAtom } from '@/store/display-header-search-atom';
import { ArrowDownIcon } from '@/components/icons/arrow-down';
import Link from '@/components/ui/link';
import ListMenu from '@/components/ui/list-menu';
import MegaMenu from '@/components/ui/mega-menu';
import SearchWithSuggestion from '@/components/ui/search/search-with-suggestion';
import { useIsHomePage } from '@/lib/use-is-homepage';
import { authorizationAtom } from '@/store/authorization-atom';
import { displayMobileHeaderSearchAtom } from '@/store/display-mobile-header-search-atom';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import GroupsDropdownMenu from './menu/groups-menu';

const Search = dynamic(() => import('@/components/ui/search/search'));

const CartCounterIconButton = dynamic(
  () => import('@/components/cart/cart-counter-icon-button'),
  { ssr: false }
);
const AuthorizedMenu = dynamic(() => import('./menu/authorized-menu'), {
  ssr: false,
});
const JoinButton = dynamic(() => import('./menu/join-button'), { ssr: false });

interface MenuProps {
  data: any;
  className?: string;
}

const HeaderWithMegaMenu: React.FC<MenuProps> = ({ data, className }) => {
  const { t } = useTranslation('common');
  // const [_, setDisplayHeaderSearch] = useAtom(displayHeaderSearchAtom);
  const [displayMobileHeaderSearch] = useAtom(displayMobileHeaderSearchAtom);
  const [isAuthorize] = useAtom(authorizationAtom);
  const isHomePage = useIsHomePage();
  // useEffect(() => {
  //   if (!isHomePage) {
  //     setDisplayHeaderSearch(false);
  //   }
  // }, [isHomePage, setDisplayHeaderSearch]);
  // useEffect(() => {
  //   if (!isHomePage) {
  //     setDisplayHeaderSearch(false);
  //   }
  // }, [isHomePage]);

  return (
    <>
      <header
        className={cn(
          'site-header-with-search fixed z-50 h-auto w-full shadow-sm'
        )}
      >
        <div
          className={cn(
            'relative z-10 flex h-14 w-full items-center justify-between bg-light px-4 py-5 transition-transform duration-300 md:h-16 lg:h-22 ltr:lg:pl-16 ltr:lg:pr-16 rtl:lg:pr-16 rtl:lg:pl-16'
          )}
        >
          <div className="flex w-full items-center">
            <Logo className="mx-auto lg:mx-0" />

            <div className="mx-auto hidden w-full max-w-screen-md overflow-hidden px-10 lg:block xl:w-11/12 2xl:w-10/12">
              <Search label={t('text-search-label')} variant="minimal" />
            </div>
          </div>

          {isHomePage ? (
            <>
              {displayMobileHeaderSearch && (
                <div className="absolute top-0 block h-full w-full bg-light px-5 pt-1.5 ltr:left-0 rtl:right-0 md:pt-2 lg:hidden">
                  <SearchWithSuggestion
                    label={t('text-search-label')}
                    variant="minimal"
                  />
                </div>
              )}
            </>
          ) : null}

          <div className="hidden shrink-0 items-center space-x-9 ltr:ml-10 rtl:mr-10 rtl:space-x-reverse lg:flex">
            <GroupsDropdownMenu variant="minimal" />
            <CartCounterIconButton />
            {isAuthorize ? <AuthorizedMenu minimal={true} /> : <JoinButton />}
          </div>
        </div>

        {/* Mega menu */}
        <nav
          className={cn(
            `headerMenu relative flex w-full border-t border-b border-border-200 bg-white px-4 lg:px-12`,
            className
          )}
        >
          {data?.map((item: any) => (
            <div
              className={`menuItem group cursor-pointer py-4 ${
                item.subMenu ? 'relative' : ''
              }`}
              key={item.id}
            >
              <Link
                href={item.path}
                className="relative inline-flex items-center px-3 py-2 text-sm font-normal text-heading group-hover:text-accent xl:px-4 xl:text-base"
              >
                {t(item.label)}
                {(item?.columns || item.subMenu) && (
                  <span className="mt-1 flex w-2.5 justify-end text-xs text-heading opacity-30 ltr:ml-1.5 rtl:mr-1.5 xl:mt-0.5">
                    <ArrowDownIcon className="transform transition duration-300 ease-in-out group-hover:-rotate-180" />
                  </span>
                )}
              </Link>

              {item?.columns && Array.isArray(item.columns) && (
                <MegaMenu columns={item.columns} />
              )}

              {item?.subMenu && Array.isArray(item.subMenu) && (
                <div className="subMenu absolute border border-gray-200 bg-white opacity-0 shadow-md group-hover:opacity-100 ltr:left-0 rtl:right-0">
                  <ul className="py-5 text-sm text-body">
                    {item.subMenu.map((menu: any, index: number) => {
                      const dept: number = 1;
                      const menuName: string = `sidebar-menu-${dept}-${index}`;

                      return (
                        <ListMenu
                          dept={dept}
                          data={menu}
                          hasSubMenu={menu.subMenu}
                          menuName={menuName}
                          key={menuName}
                          menuIndex={index}
                        />
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>
      </header>
      <div className="block h-40 w-full" />
    </>
  );
};

export default HeaderWithMegaMenu;
