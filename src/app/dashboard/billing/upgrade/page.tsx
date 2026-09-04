import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  completeMockUpgrade,
} from "@/app/dashboard/billing-actions";
import {
  getServerDictionary,
} from "@/i18n/server";

import {
  isMockBillingEnabled,
} from "@/lib/billing-mode";

import {
  createClient,
} from "@/lib/supabase/server";

import dashboardStyles from "../../dashboard.module.css";
import styles from "./upgrade.module.css";

type PageProps = {
  searchParams: Promise<{
    assistant?: string;
    error?: string;
  }>;
};

export default async function UpgradePage({
  searchParams,
}: PageProps) {
  const query =
    await searchParams;

  const copy =
    (
      await getServerDictionary()
    ).dashboard.billing;

  const assistantId =
    query.assistant?.trim()
    ?? "";

  const supabase =
    await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (
    claimsError
    || !userId
  ) {
    redirect(
      "/auth/login",
    );
  }

  if (!assistantId) {
    redirect(
      "/dashboard",
    );
  }

  const [
    assistantResult,
    subscriptionResult,
  ] = await Promise.all([
    supabase
      .from("assistants")
      .select(
        "id,name",
      )
      .eq(
        "id",
        assistantId,
      )
      .eq(
        "owner_id",
        userId,
      )
      .maybeSingle(),

    supabase
      .from("subscriptions")
      .select(
        "plan,status,billing_mode",
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),
  ]);

  if (
    assistantResult.error
    || !assistantResult.data
  ) {
    notFound();
  }

  if (
    subscriptionResult.error
  ) {
    throw new Error(
      copy.errors.subscriptionLoadFailed,
    );
  }

  const assistant =
    assistantResult.data;

  const subscription =
    subscriptionResult.data;

  const isPro =
    subscription?.plan
      === "pro"
    && subscription?.status
      === "active";

  if (isPro) {
    redirect(
      `/dashboard/assistants/${assistant.id}/install`,
    );
  }

  const mockEnabled =
    isMockBillingEnabled();

  return (
    <div
      className={
        dashboardStyles.content
      }
    >
      <Link
        className={
          dashboardStyles.backLink
        }
        href={
          `/dashboard/assistants/${assistant.id}/install`
        }
      >
        {copy.backToInstallation}
      </Link>

      <div
        style={{
          marginTop: "28px",
        }}
      >
        <div
          className={
            dashboardStyles.eyebrow
          }
        >
          {copy.eyebrow}
        </div>

        <h1
          className={
            dashboardStyles.pageTitle
          }
        >
          {copy.title}
        </h1>

        <p
          className={
            dashboardStyles.pageLead
          }
        >
          {copy.lead}
        </p>
      </div>

      {query.error ? (
        <div
          className={
            styles.error
          }
          role="alert"
        >
          {query.error}
        </div>
      ) : null}

      <div
        className={
          styles.layout
        }
      >
        <section
          className={
            styles.checkout
          }
        >
          <span
            className={
              styles.mockBadge
            }
          >
            {copy.mockCheckout}
          </span>

          <h2>
            {copy.productName}
          </h2>

          <p>
            {copy.demoExplanation}
          </p>

          <div
            className={
              styles.price
            }
          >
            <strong>
              {copy.price}
            </strong>

            <span>
              {copy.perMonth}
            </span>
          </div>

          <div
            className={
              styles.features
            }
          >
            {[
              copy.featureAssistants,
              copy.featureKnowledge,
              copy.featureMessages,
              copy.featureEmbed,
              copy.featureBranding,
              copy.featureCustomization,
            ].map(
              (feature) => (
                <div
                  className={
                    styles.feature
                  }
                  key={feature}
                >
                  <span
                    className={
                      styles.check
                    }
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  <span>
                    {feature}
                  </span>
                </div>
              ),
            )}
          </div>

          {mockEnabled ? (
            <form
              action={
                completeMockUpgrade
              }
              className={
                styles.form
              }
            >
              <input
                name="assistantId"
                type="hidden"
                value={
                  assistant.id
                }
              />

              <button
                className={
                  styles.submit
                }
                type="submit"
              >
                {copy.completeMockUpgrade}
              </button>
            </form>
          ) : (
            <div
              className={
                styles.error
              }
            >
              {copy.mockDisabledPage}
            </div>
          )}

          <p
            className={
              styles.disclaimer
            }
          >
            {copy.disclaimer}
          </p>
        </section>

        <aside
          className={
            styles.summary
          }
        >
          <h2>
            {copy.summaryTitle}
          </h2>

          <p>
            {copy.summaryLeadTemplate.replace(
              "{name}",
              assistant.name,
            )}
          </p>

          <div
            className={
              styles.summaryRows
            }
          >
            <div
              className={
                styles.summaryRow
              }
            >
              <span>
                {copy.currentPlan}
              </span>

              <strong>
                {copy.freePlan}
              </strong>
            </div>

            <div
              className={
                styles.summaryRow
              }
            >
              <span>
                {copy.newPlan}
              </span>

              <strong>
                {copy.proPlan}
              </strong>
            </div>

            <div
              className={
                styles.summaryRow
              }
            >
              <span>
                {copy.billingLabel}
              </span>

              <strong>
                {copy.mock}
              </strong>
            </div>

            <div
              className={
                styles.summaryRow
              }
            >
              <span>
                {copy.websiteEmbed}
              </span>

              <strong>
                {copy.included}
              </strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
