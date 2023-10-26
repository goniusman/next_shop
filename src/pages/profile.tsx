import ProfileAddressGrid from '@/components/profile/profile-address';
import ProfileContact from '@/components/profile/profile-contact';
import ProfileForm from '@/components/profile/profile-form';
import ProfileUpdateEmail from '@/components/profile/profile-update-email';
import Seo from '@/components/seo/seo';
import Card from '@/components/ui/cards/card';
import { useUser } from '@/framework/user';
import DashboardLayout from '@/layouts/_dashboard';
import { useTranslation } from 'next-i18next';
export { getStaticProps } from '@/framework/general.ssr';

const ProfilePage = () => {
  const { t } = useTranslation('common');
  const { me }: any = useUser();
  if (!me) return null;
  return (
    <>
      <Seo noindex={true} nofollow={true} />
      <div className="w-full overflow-hidden px-1 pb-1">
        <div className="mb-8">
          <ProfileForm user={me} />
          <ProfileUpdateEmail user={me} />
          <ProfileContact
            userId={me.id}
            profileId={me.profile?.id!}
            contact={me.profile?.contact!}
          />
        </div>

        <Card className="w-full">
          <ProfileAddressGrid
            userId={me._id}
            //@ts-ignore
            addresses={me.address}
            label={t('text-addresses')}
          />
        </Card>
      </div>
    </>
  );
};

ProfilePage.authenticationRequired = true;

ProfilePage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
export default ProfilePage;
