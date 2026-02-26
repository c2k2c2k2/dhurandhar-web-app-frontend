"use client";

export type AccessPermission = {
  id: string;
  key: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AccessRole = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  isSystem?: boolean;
  userCount?: number;
  permissionKeys: string[];
  permissions: AccessPermission[];
  createdAt?: string;
  updatedAt?: string;
};

export type RolePayload = {
  name: string;
  key?: string;
  description?: string;
  permissionKeys?: string[];
};
