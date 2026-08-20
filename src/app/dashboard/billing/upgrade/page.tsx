import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  completeMockUpgrade,
} from "@/app/dashboard/billing-actions";
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
      "Unable to load subscription",
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
    process.env.BILLING_MODE
      ?.trim()
      .toLowerCase()
    === "mock";

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
        ← Back to installation
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
          Upgrade
        </div>

        <h1
          className={
            dashboardStyles.pageTitle
          }
        >
          Upgrade to Pro
        </h1>

        <p
          className={
            dashboardStyles.pageLead
          }
        >
          Unlock website embedding and higher limits for your workspace
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
            Mock checkout
          </span>

          <h2>
            Anvera Pro
          </h2>

          <p>
            This test checkout activates Pro without collecting
            or storing payment card information
          </p>

          <div
            className={
              styles.price
            }
          >
            <strong>
              $29
            </strong>

            <span>
              / month
            </span>
          </div>

          <div
            className={
              styles.features
            }
          >
            {[
              "Up to 5 assistants",
              "Up to 100 knowledge sources",
              "2,000 messages per month",
              "Website embed",
              "Remove Anvera branding",
              "Advanced customization",
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
                Complete mock upgrade
              </button>
            </form>
          ) : (
            <div
              className={
                styles.error
              }
            >
              Mock billing is not enabled in this environment.
            </div>
          )}

          <p
            className={
              styles.disclaimer
            }
          >
            No card details are requested. This flow exists only
            to demonstrate subscription gating in the MVP.
          </p>
        </section>

        <aside
          className={
            styles.summary
          }
        >
          <h2>
            Upgrade summary
          </h2>

          <p>
            Pro applies to the whole workspace,
            including {assistant.name}
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
                Current plan
              </span>

              <strong>
                Free
              </strong>
            </div>

            <div
              className={
                styles.summaryRow
              }
            >
              <span>
                New plan
              </span>

              <strong>
                Pro
              </strong>
            </div>

            <div
              className={
                styles.summaryRow
              }
            >
              <span>
                Billing
              </span>

              <strong>
                Mock
              </strong>
            </div>

            <div
              className={
                styles.summaryRow
              }
            >
              <span>
                Website embed
              </span>

              <strong>
                Included
              </strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
