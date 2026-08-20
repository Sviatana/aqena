import { AnveraLogo } from "@/components/anvera-brand";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const claims = claimsData?.claims;
  const userId = claims?.sub;

  if (claimsError || !userId) {
    redirect("/auth/login");
  }

  const [
    profileResult,
    subscriptionResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle(),

    supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const email =
    typeof claims.email === "string"
      ? claims.email
      : "";

  const displayName =
    profileResult.data?.display_name
    || email
    || "Account";

  const plan =
    subscriptionResult.data?.plan === "pro"
      ? "Pro"
      : "Free";

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link
          aria-label="Anvera home"
          className={styles.brand}
          href="/"
        >
          <AnveraLogo
            width={104}
          />
        </Link>

        <nav
          className={styles.nav}
          aria-label="Dashboard navigation"
        >
          <Link
            className={`${styles.navLink} ${styles.navLinkActive}`}
            href="/dashboard"
          >
            <span className={styles.navDot} />
            Assistants
          </Link>

          <Link
            className={styles.navLink}
            href="/dashboard/assistants/new"
          >
            <span>+</span>
            New assistant
          </Link>
        </nav>

        <div className={styles.account}>
          <div className={styles.accountName}>
            {displayName}
          </div>

          <div className={styles.accountPlan}>
            {plan} plan
          </div>

          <form action={signOut}>
            <button
              className={styles.signOut}
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.topbarTitle}>
            Workspace
          </span>

          <Link
            className={styles.newButton}
            href="/dashboard/assistants/new"
          >
            New assistant
          </Link>
        </header>

        {children}
      </main>
    </div>
  );
}
