import { EVENTS_TAB, getConfigById, upsertConfig } from '@/lib/sheets';

function effectiveSurveyIds(event) {
  return event.linkedSurveyIds || (event.linkedSurveyId ? [event.linkedSurveyId] : []);
}

async function linkSurveyToEvent(eventId, surveyId) {
  const event = await getConfigById(EVENTS_TAB, eventId);
  if (!event) return;
  const ids = effectiveSurveyIds(event);
  if (ids.includes(surveyId)) return;
  const updated = { ...event, linkedSurveyIds: [...ids, surveyId] };
  delete updated.linkedSurveyId;
  await upsertConfig(EVENTS_TAB, updated);
}

async function unlinkSurveyFromEvent(eventId, surveyId) {
  const event = await getConfigById(EVENTS_TAB, eventId);
  if (!event) return;
  const ids = effectiveSurveyIds(event);
  if (!ids.includes(surveyId)) return;
  const updated = { ...event, linkedSurveyIds: ids.filter((id) => id !== surveyId) };
  delete updated.linkedSurveyId;
  await upsertConfig(EVENTS_TAB, updated);
}

export { linkSurveyToEvent, unlinkSurveyFromEvent };
