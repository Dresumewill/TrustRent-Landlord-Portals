import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <Mail className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold">Verify your email</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          We sent a confirmation link to your email address. Please click it to activate your account before continuing.
        </p>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <Link href="/resend-verification" className="text-emerald-600 hover:underline font-medium">
            resend the email
          </Link>.
        </p>
        <Link href="/login" className="text-sm text-emerald-600 font-medium hover:underline mt-1">
          Back to Sign In
        </Link>
      </CardContent>
    </Card>
  );
}
