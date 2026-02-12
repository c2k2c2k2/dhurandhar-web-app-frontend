export type NoteItem = {
  id: string;
  subjectId: string;
  title: string;
  description?: string | null;
  isPremium: boolean;
  pageCount?: number | null;
  publishedAt?: string | null;
};

export type NoteDetail = NoteItem & {
  topics?: { topicId: string }[];
  subject?: { id: string; name?: string | null } | null;
};

export type NoteTreeTopic = {
  id: string;
  name: string;
  subjectId: string;
  parentId?: string | null;
  orderIndex?: number | null;
  notes?: NoteItem[];
  children?: NoteTreeTopic[];
};

export type NoteTreeSubject = {
  id: string;
  key?: string;
  name: string;
  topics: NoteTreeTopic[];
};

export type NoteViewSession = {
  viewToken: string;
  sessionId: string;
  expiresAt: string;
};

export type WatermarkPayload = {
  displayName: string;
  maskedEmail?: string;
  maskedPhone?: string;
  userHash: string;
  viewSessionId: string;
  watermarkSeed: string;
};

export type WatermarkResponse = {
  payload: WatermarkPayload;
  signature: string;
};
