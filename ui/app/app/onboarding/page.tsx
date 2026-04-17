import Onboarding from '@/src/app/pages/Onboarding';
import { requireRouteAccess } from '@/src/lib/auth/authorize';

export default async function OnboardingPage() {
  await requireRouteAccess('onboarding');
  return <Onboarding />;
}
