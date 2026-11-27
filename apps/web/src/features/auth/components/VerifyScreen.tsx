"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isApiError } from "@meno/api-client";
import { Badge, Button, Callout, Card, Icon, OtpInput, Skeleton } from "@meno/ui";
import { problemMessage } from "@/lib/problem";
import { useSessionUser } from "@/lib/session";
import { useConfirmEmail, useResendEmail, useSendMobileOtp, useSession, useVerificationStatus, useVerifyMobile } from "../queries";
import { maskEmail } from "../utils";
import { AuthHeading, AuthShell } from "./AuthShell";
import { LocalMockHint } from "./LocalMockHint";

/** /verify (AUT-04, ONBOARDING.md step 2). With ?token= it confirms the email link (works signed out). */
export function VerifyScreen() {
  const token = useSearchParams().get("token");
  return <AuthShell>{token ? <ConfirmEmailLink token={token} /> : <VerifySignedIn />}</AuthShell>;
}

function ConfirmEmailLink({ token }: { token: string }) {
  const confirm = useConfirmEmail(token);
  const session = useSession();

  const next = session.data ? "/onboarding/" : "/login/";
  if (confirm.isPending) {
    return (
      <div aria-busy="true">
        <AuthHeading title="Confirming your email…" />
        <Skeleton className="h-10" />
      </div>
    );
  }
  if (confirm.isError) {
    return (
      <>
        <AuthHeading title="This link didn't work" />
        <Callout tone="critical">{problemMessage(confirm.error, "This link has expired or was already used.")}</Callout>
        <p className="mt-4 text-[13.5px] text-ink-3">Sign in and ask for a new link from the verification page.</p>
        <Button className="mt-6 w-full" size="lg" onClick={() => (window.location.href = "/verify/")}>
          Go to verification
        </Button>
      </>
    );
  }
  return (
    <>
      <AuthHeading title="Email confirmed" description="Thank you. Your email is verified." />
      <Link href={next} className="inline-flex h-10 w-full items-center justify-center rounded-ctl bg-ink text-[14px] font-medium text-paper hover:opacity-90">
        Continue
      </Link>
    </>
  );
}

function VerifySignedIn() {
  const session = useSession();
  const router = useRouter();
  const anonymous = session.isSuccess && !session.data;
  useEffect(() => {
    if (anonymous) router.replace("/login/?next=%2Fverify%2F");
  }, [anonymous, router]);
  const status = useVerificationStatus(Boolean(session.data));
  const user = useSessionUser();

  if (!session.data || status.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }
  const verified = status.data;
  return (
    <>
      <AuthHeading title="Confirm your details" description="This keeps your account and your pharmacy's bills safe." />
      {status.isError && <Callout tone="critical">{problemMessage(status.error, "Couldn't load your verification status.")}</Callout>}
      <div className="flex flex-col gap-3">
        <MobileCard verified={Boolean(verified?.mobileVerified)} />
        <EmailCard verified={Boolean(verified?.emailVerified)} email={user?.email ?? ""} />
      </div>
      <Button className="mt-6 w-full" size="lg" onClick={() => router.push("/onboarding/")} data-testid="verify-continue">
        Continue to set-up
        <Icon name="arrow-right" />
      </Button>
      <p className="mt-3 text-center text-[12.5px] text-ink-3">You can set up now; the email must be confirmed before you go live.</p>
      {process.env.NODE_ENV === "development" && (
        <LocalMockHint>
          SMS code: <span className="font-mono">123456</span>. Email link:{" "}
          <a className="underline" href={`/verify/?token=mock-${user?.id ?? ""}`}>
            open the confirmation link
          </a>
          .
        </LocalMockHint>
      )}
    </>
  );
}

const RESEND_SECONDS = 30;

function useCountdown() {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return { left, start: () => setLeft(RESEND_SECONDS) };
}

function MobileCard({ verified }: { verified: boolean }) {
  const send = useSendMobileOtp();
  const verify = useVerifyMobile();
  const [code, setCode] = useState("");
  const countdown = useCountdown();
  // meno-api answers 503 NOTIFICATION_CHANNEL_DISABLED while no SMS provider is configured (INT-02); older APIs 404.
  const notBuilt =
    isApiError(send.error) && (send.error.code === "NOTIFICATION_CHANNEL_DISABLED" || send.error.status === 404 || send.error.status === 405);

  return (
    <Card className="flex flex-col gap-3" data-testid="verify-mobile">
      <div className="flex items-center gap-2">
        <Icon name="phone" className="text-ink-3" />
        <h2 className="text-[14px] font-medium text-ink">Mobile number</h2>
        <span className="ml-auto">{verified ? <Badge tint="green">Verified</Badge> : <Badge tint="slate">Not verified</Badge>}</span>
      </div>
      {verified ? null : notBuilt ? (
        <Callout tone="info">SMS verification isn't switched on yet. You can continue; we'll ask later.</Callout>
      ) : send.isSuccess ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 6) verify.mutate(code);
          }}
        >
          <p className="text-[13px] text-ink-3">Enter the 6-digit code we sent by SMS. It works for 5 minutes.</p>
          <OtpInput value={code} onChange={setCode} autoFocus aria-invalid={verify.isError || undefined} />
          {verify.isError && <p role="alert" className="text-[12.5px] text-critical">{problemMessage(verify.error, "That code isn't right.")}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={code.length !== 6} loading={verify.isPending}>
              Verify
            </Button>
            <Button
              variant="ghost"
              disabled={countdown.left > 0 || send.isPending}
              onClick={() => {
                setCode("");
                send.mutate(undefined, { onSuccess: countdown.start });
              }}
            >
              {countdown.left > 0 ? `Resend in ${countdown.left} s` : "Resend code"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-ink-3">We'll send a one-time code to the mobile you signed up with.</p>
          {send.isError && <p role="alert" className="text-[12.5px] text-critical">{problemMessage(send.error, "Couldn't send the code.")}</p>}
          <Button variant="outline" className="self-start" loading={send.isPending} onClick={() => send.mutate(undefined, { onSuccess: countdown.start })}>
            Send code
          </Button>
        </div>
      )}
    </Card>
  );
}

function EmailCard({ verified, email }: { verified: boolean; email: string }) {
  const resend = useResendEmail();
  return (
    <Card className="flex flex-col gap-3" data-testid="verify-email">
      <div className="flex items-center gap-2">
        <Icon name="mail" className="text-ink-3" />
        <h2 className="text-[14px] font-medium text-ink">Email</h2>
        <span className="ml-auto">{verified ? <Badge tint="green">Verified</Badge> : <Badge tint="amber">Waiting</Badge>}</span>
      </div>
      {!verified && (
        <>
          <p className="text-[13px] text-ink-3">
            We sent a confirmation link to <span className="font-medium text-ink-2">{maskEmail(email)}</span>. It works for 24 hours.
          </p>
          {resend.isSuccess && <Callout tone="success">A new link is on its way. Older links no longer work.</Callout>}
          {resend.isError && <Callout tone="critical">{problemMessage(resend.error, "Couldn't send a new link.")}</Callout>}
          <Button variant="outline" className="self-start" loading={resend.isPending} onClick={() => resend.mutate()}>
            Send a new link
          </Button>
        </>
      )}
    </Card>
  );
}
