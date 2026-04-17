import Offboarding from '@/src/app/pages/Offboarding';
import { requireRouteAccess } from '@/src/lib/auth/authorize';

export default async function OffboardingPage() {
  await requireRouteAccess('offboarding');
  return <Offboarding />;
}
