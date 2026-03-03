"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormSelect } from "./FormField";
import { StringListEditor } from "./StructuredEditors";
import {
  createEmptyEntitlementRule,
  ENTITLEMENT_KIND_OPTIONS,
  type EditableEntitlementRule,
  type EditableEntitlementScope,
  type EntitlementKindOption,
} from "../entitlements";

export function EntitlementScopeEditor({
  label,
  description,
  scope,
  onChange,
}: {
  label: string;
  description?: string;
  scope: EditableEntitlementScope;
  onChange: (next: EditableEntitlementScope) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card/40 p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>

      <StringListEditor
        label="Subject IDs"
        values={scope.subjectIds}
        onChange={(subjectIds) => onChange({ ...scope, subjectIds })}
        itemLabel="Subject ID"
        addLabel="Add subject ID"
      />
      <StringListEditor
        label="Topic IDs"
        values={scope.topicIds}
        onChange={(topicIds) => onChange({ ...scope, topicIds })}
        itemLabel="Topic ID"
        addLabel="Add topic ID"
      />
      <StringListEditor
        label="Note IDs"
        values={scope.noteIds}
        onChange={(noteIds) => onChange({ ...scope, noteIds })}
        itemLabel="Note ID"
        addLabel="Add note ID"
      />
    </div>
  );
}

export function EntitlementRulesEditor({
  label,
  description,
  rules,
  onChange,
  preserveNotice,
}: {
  label: string;
  description?: string;
  rules: EditableEntitlementRule[];
  onChange: (next: EditableEntitlementRule[]) => void;
  preserveNotice?: string;
}) {
  const updateRule = (index: number, patch: Partial<EditableEntitlementRule>) => {
    const next = [...rules];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, currentIndex) => currentIndex !== index));
  };

  const addRule = () => {
    onChange([...rules, createEmptyEntitlementRule()]);
  };

  return (
    <FormField label={label} description={description}>
      <div className="space-y-3 rounded-2xl border border-border bg-card/40 p-3">
        {preserveNotice ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900">
            {preserveNotice}
          </div>
        ) : null}

        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entitlement rules added yet.</p>
        ) : (
          rules.map((rule, index) => (
            <div key={rule.id} className="space-y-3 rounded-2xl border border-border bg-background/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">Rule {index + 1}</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeRule(index)}>
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>

              <FormSelect
                label="Access Type"
                value={rule.kind}
                onChange={(event) =>
                  updateRule(index, { kind: event.target.value as EntitlementKindOption })
                }
              >
                {ENTITLEMENT_KIND_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </FormSelect>

              <EntitlementScopeEditor
                label="Scope"
                description="Leave all three lists empty to grant global access for this rule."
                scope={rule.scope}
                onChange={(scope) => updateRule(index, { scope })}
              />
            </div>
          ))
        )}

        <Button type="button" variant="secondary" size="sm" onClick={addRule}>
          <Plus className="h-4 w-4" />
          Add Rule
        </Button>
      </div>
    </FormField>
  );
}
