import Link from "next/link";
import { ForbiddenPanel } from "@/components/ForbiddenPanel";
import { Button } from "@/components/ui/button";

export default function StudentForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <ForbiddenPanel />
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-semibold">
          Student access only
        </h1>
        <p className="text-sm text-muted-foreground">
          Please log in with a student account to access learning tools.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary" asChild>
          <Link href="/">Go to Home</Link>
        </Button>
        <Button variant="cta" asChild>
          <Link href="/student/login">Student Login</Link>
        </Button>
      </div>
    </div>
  );
}
