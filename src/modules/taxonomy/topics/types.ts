export type Topic = {
  id: string;
  subjectId?: string;
  name?: string;
  title?: string;
  parentId?: string | null;
  orderIndex?: number | null;
  isActive?: boolean | null;
  active?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
};
