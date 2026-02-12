import type { AuthQueryParams } from "@/modules/shared/routing/returnUrl";
import {
  buildAuthUrl,
  resolvePostAuthRedirect,
} from "@/modules/shared/routing/returnUrl";

export type AuthRedirectOptions = AuthQueryParams & {
  isAuthenticated: boolean;
};

export type AuthRedirectRouter = {
  push: (href: string) => void;
  replace?: (href: string) => void;
};

export function getStartHref({
  isAuthenticated,
  next,
  plan,
  from,
}: AuthRedirectOptions) {
  if (!isAuthenticated) {
    return buildAuthUrl("/auth/register", { next, plan, from });
  }
  return resolvePostAuthRedirect({ next, plan });
}

export function goToStart(
  router: AuthRedirectRouter,
  options: AuthRedirectOptions & { replace?: boolean }
) {
  const href = getStartHref(options);
  if (options.replace && router.replace) {
    router.replace(href);
    return;
  }
  router.push(href);
}
