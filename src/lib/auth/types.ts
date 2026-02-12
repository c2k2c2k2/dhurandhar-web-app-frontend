export type UserMe = {
  id: string;
  email: string;
  fullName?: string;
  type: string;
  roles: string[];
  permissions?: string[];
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
