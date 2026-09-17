import { redirect } from 'next/navigation';
import { RECORDS_TAB, getConfigById } from '@/lib/sheets';
import { recordCardHref } from '@/lib/recordLink';
import SiteHeader from '../../SiteHeader';

export const dynamic = 'force-dynamic';

// Short share link: /r/<id> instead of /records/<id>/read/0. Staff paste these
// into messages and print them on posters, so the address stays as short as the
// record id allows. It resolves to wherever the record actually opens, which
// means a link shared today keeps working if an attachment is added later.
export default async function ShortRecordLinkPage({ params }) {
  const record = await getConfigById(RECORDS_TAB, params.id);

  if (record?.published) redirect(recordCardHref(record));

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="flex items-center justify-center p-6">
        <p className="text-gray-500">존재하지 않는 기록입니다.</p>
      </div>
    </main>
  );
}
