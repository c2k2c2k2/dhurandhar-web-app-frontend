"use client";

export type AnalyticsRange = {
  from: string;
  to: string;
};

export type AnalyticsOverview = {
  range: AnalyticsRange;
  users: {
    total: number;
    students: number;
    admins: number;
    activeRange: number;
    dau: number;
    wau: number;
  };
  content: {
    notes: number;
    questions: number;
    tests: number;
  };
  activity: {
    attempts: number;
    practiceAnswers: number;
    noteProgressUpdates: number;
  };
  revenue: {
    orders: number;
    amountPaise: number;
    currency: string;
  };
};

export type CoverageSubject = {
  id: string;
  name: string;
  counts: {
    topics: number;
    notes: number;
    questions: number;
    tests: number;
  };
};

export type CoverageTopic = {
  id: string;
  name: string;
  subjectId: string;
  subject?: { id: string; name: string };
  _count?: { notes: number; questions: number };
};

export type CoverageResponse = {
  subjects: CoverageSubject[];
  topics: {
    data: CoverageTopic[];
    total: number;
    page: number;
    pageSize: number;
  };
  gaps: {
    topicId: string;
    topicName: string;
    subjectId: string;
    subjectName: string;
  }[];
};

export type RevenueResponse = {
  period: string;
  range: AnalyticsRange;
  totalAmountPaise: number;
  currency: string;
  data: {
    key: string;
    amountPaise: number;
    orderCount: number;
  }[];
};

export type EngagementResponse = {
  range: AnalyticsRange;
  data: {
    date: string;
    activeUsers: number;
  }[];
};
