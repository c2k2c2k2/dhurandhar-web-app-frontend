"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFormField } from "@/modules/auth/components/AuthFormField";

type PasswordFieldProps = {
  label?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string | null;
};

export function PasswordField({
  label = "Password",
  name = "password",
  value,
  onChange,
  placeholder = "********",
  autoComplete,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <AuthFormField label={label} error={error}>
      <div className="relative">
        <Input
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pr-12"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          onClick={() => setVisible((prev) => !prev)}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </AuthFormField>
  );
}
