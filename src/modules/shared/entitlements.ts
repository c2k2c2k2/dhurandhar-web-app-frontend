"use client";

import { createStructuredId, parseStringList } from "./structured-data";

export const ENTITLEMENT_KIND_OPTIONS = ["ALL", "NOTES", "TESTS", "PRACTICE"] as const;

export type EntitlementKindOption = (typeof ENTITLEMENT_KIND_OPTIONS)[number];

export type EditableEntitlementScope = {
  subjectIds: string[];
  topicIds: string[];
  noteIds: string[];
};

export type EditableEntitlementRule = {
  id: string;
  kind: EntitlementKindOption;
  scope: EditableEntitlementScope;
};

export function createEmptyEntitlementScope(): EditableEntitlementScope {
  return {
    subjectIds: [],
    topicIds: [],
    noteIds: [],
  };
}

export function createEmptyEntitlementRule(): EditableEntitlementRule {
  return {
    id: createStructuredId("entitlement"),
    kind: "ALL",
    scope: createEmptyEntitlementScope(),
  };
}

export function parseEntitlementScope(value: unknown): EditableEntitlementScope {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return createEmptyEntitlementScope();
  }

  const scope = value as Record<string, unknown>;
  return {
    subjectIds: parseStringList(scope.subjectIds),
    topicIds: parseStringList(scope.topicIds),
    noteIds: parseStringList(scope.noteIds),
  };
}

export function buildEntitlementScope(scope: EditableEntitlementScope) {
  const subjectIds = scope.subjectIds.map((item) => item.trim()).filter(Boolean);
  const topicIds = scope.topicIds.map((item) => item.trim()).filter(Boolean);
  const noteIds = scope.noteIds.map((item) => item.trim()).filter(Boolean);

  const payload: Record<string, unknown> = {};
  if (subjectIds.length) payload.subjectIds = subjectIds;
  if (topicIds.length) payload.topicIds = topicIds;
  if (noteIds.length) payload.noteIds = noteIds;
  return payload;
}

export function parseEntitlementRules(value: unknown): EditableEntitlementRule[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const typed = item as Record<string, unknown>;
      const kind = typed.kind;
      if (!ENTITLEMENT_KIND_OPTIONS.includes(kind as EntitlementKindOption)) {
        return null;
      }

      return {
        id: createStructuredId("entitlement"),
        kind: kind as EntitlementKindOption,
        scope: parseEntitlementScope(typed.scopeJson),
      };
    })
    .filter((item): item is EditableEntitlementRule => Boolean(item));
}

export function buildEntitlementRules(rules: EditableEntitlementRule[]) {
  return rules.map((rule) => {
    const scopeJson = buildEntitlementScope(rule.scope);
    return {
      kind: rule.kind,
      ...(Object.keys(scopeJson).length ? { scopeJson } : {}),
    };
  });
}

export function parsePlanFeaturesConfig(value: unknown) {
  if (Array.isArray(value)) {
    return {
      featureList: parseStringList(value),
      entitlements: [] as EditableEntitlementRule[],
      preserved: {} as Record<string, unknown>,
      hasUnsupported: false,
    };
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      featureList: [] as string[],
      entitlements: [] as EditableEntitlementRule[],
      preserved: {} as Record<string, unknown>,
      hasUnsupported: false,
    };
  }

  const record = value as Record<string, unknown>;
  const entitlements = parseEntitlementRules(record.entitlements);
  const explicitFeatureList = parseStringList(record.featureList);
  const preserved = Object.fromEntries(
    Object.entries(record).filter(([key]) => key !== "entitlements" && key !== "featureList")
  );

  const legacyFeatureList =
    explicitFeatureList.length > 0
      ? explicitFeatureList
      : Object.entries(record)
          .filter(([key, entry]) => key !== "entitlements" && key !== "featureList" && typeof entry === "string")
          .map(([, entry]) => String(entry).trim())
          .filter(Boolean);

  const hasUnsupported = Object.values(preserved).some(
    (entry) => entry && typeof entry === "object"
  );

  return {
    featureList: legacyFeatureList,
    entitlements,
    preserved,
    hasUnsupported,
  };
}

export function buildPlanFeaturesConfig(input: {
  featureList: string[];
  entitlements: EditableEntitlementRule[];
  preserved?: Record<string, unknown>;
}) {
  const featureList = input.featureList.map((item) => item.trim()).filter(Boolean);
  const entitlements = buildEntitlementRules(input.entitlements);
  const preserved = input.preserved ?? {};

  const payload: Record<string, unknown> = { ...preserved };
  if (featureList.length) {
    payload.featureList = featureList;
  }
  if (entitlements.length) {
    payload.entitlements = entitlements;
  }

  return Object.keys(payload).length ? payload : undefined;
}
