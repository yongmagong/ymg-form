import { SURVEYS_TAB, getConfigById } from '@/lib/sheets';
import SiteHeader from '../../SiteHeader';
import SurveyRunner from './SurveyRunner';

export const dynamic = 'force-dynamic';

export default async function SurveyPage({ params }) {
  const survey = await getConfigById(SURVEYS_TAB, params.id);

  if (!survey) {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <div className="flex items-center justify-center p-6">
          <p className="text-gray-500">존재하지 않는 설문입니다.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-lg w-full">
          <SurveyRunner survey={survey} />
        </div>
      </div>
    </main>
  );
}
