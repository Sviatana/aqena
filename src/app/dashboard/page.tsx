import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import styles from "./dashboard.module.css";

type PageProps = {
  searchParams: Promise<{
    created?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: PageProps) {
  const supabase = await createClient();

  const {
    data: claimsData,
  } = await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    redirect("/auth/login");
  }

  const [
    assistantsResult,
    subscriptionResult,
    usageResult,
    knowledgeResult,
  ] = await Promise.all([
    supabase
      .from("assistants")
      .select(
        "id,name,description,status,is_published,created_at",
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      ),

    supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .maybeSingle(),

    supabase
      .from("usage_monthly")
      .select("message_count,month")
      .eq("user_id", userId)
      .order(
        "month",
        {
          ascending: false,
        },
      )
      .limit(1)
      .maybeSingle(),

    supabase
      .from("knowledge_sources")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      ),
  ]);

  const assistants =
    assistantsResult.data ?? [];

  const plan =
    subscriptionResult.data?.plan === "pro"
      ? "pro"
      : "free";

  const limit =
    plan === "pro"
      ? 5
      : 1;

  const messageLimit =
    plan === "pro"
      ? 2000
      : 50;

  const messages =
    usageResult.data?.message_count ?? 0;

  const knowledgeSources =
    knowledgeResult.count ?? 0;

  const params = await searchParams;

  return (
    <div className={styles.content}>
      <div className={styles.headingRow}>
        <div>
          <div className={styles.eyebrow}>
            Workspace
          </div>

          <h1 className={styles.pageTitle}>
            Your assistants
          </h1>

          <p className={styles.pageLead}>
            Build assistants from your company knowledge,
            test their answers and prepare them for customers.
          </p>
        </div>
      </div>

      {params.created ? (
        <div
          className={styles.success}
          role="status"
        >
          Assistant created. Add knowledge next to start testing answers.
        </div>
      ) : null}

      <section
        className={styles.stats}
        aria-label="Account usage"
      >
        <article className={styles.statCard}>
          <div className={styles.statLabel}>
            Assistants
          </div>

          <div className={styles.statValue}>
            {assistants.length} / {limit}
          </div>

          <div className={styles.statMeta}>
            {plan === "pro"
              ? "Pro plan"
              : "Free plan"}
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statLabel}>
            Messages this month
          </div>

          <div className={styles.statValue}>
            {messages.toLocaleString()} /{" "}
            {messageLimit.toLocaleString()}
          </div>

          <div className={styles.statMeta}>
            Playground and website chat
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statLabel}>
            Knowledge sources
          </div>

          <div className={styles.statValue}>
            {knowledgeSources}
          </div>

          <div className={styles.statMeta}>
            Add documents after creating an assistant
          </div>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Assistants</h2>
        </div>

        {assistants.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyInner}>
              <div
                className={styles.emptyMark}
                aria-hidden="true"
              >
                A
              </div>

              <h3>
                Build your first assistant
              </h3>

              <p>
                Give it a name and instructions.
                Then we will add the company knowledge
                it should use for every answer.
              </p>

              <Link
                className={styles.newButton}
                href="/dashboard/assistants/new"
              >
                Create assistant
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.assistantList}>
            {assistants.map(
              (assistant) => (
                <Link
                  className={`${styles.assistantCard} ${styles.assistantLink}`}
                  href={`/dashboard/assistants/${assistant.id}`}
                  key={assistant.id}
                >
                  <div>
                    <h3
                      className={styles.assistantName}
                    >
                      {assistant.name}
                    </h3>

                    <p
                      className={
                        styles.assistantDescription
                      }
                    >
                      {assistant.description
                        || "No description yet"}
                    </p>
                  </div>

                  <div className={styles.assistantCardSide}>
                    <span className={styles.badge}>
                      {assistant.status}
                    </span>

                    <span className={styles.openAssistant}>
                      Open →
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}
