import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';

/**
 * Plans. Paid plans are not designed yet (and Google Play Billing is not integrated), so this page only
 * says what is true today: every feature can be used while the app is being tested.
 */
export default function Premium() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen pb-24">
      <Header title={t('prem_title')} showBack />
      <div className="px-4 py-8 max-w-lg mx-auto space-y-4 text-center">
        <span className="text-6xl block">🌱</span>
        <Card className="text-left space-y-2">
          <p className="text-sm">{t('plans_now')}</p>
          <p className="text-sm">{t('plans_later')}</p>
        </Card>
      </div>
    </div>
  );
}
