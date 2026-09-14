import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  submitManualBillingRequest,
} from "@/app/dashboard/billing-actions";

import {
  getServerDictionary,
} from "@/i18n/server";

import {
  createClient,
} from "@/lib/supabase/server";

import dashboardStyles from "../../dashboard.module.css";
import styles from "./upgrade.module.css";

type PageProps = {
  searchParams: Promise<{
    assistant?: string;
    error?: string;
    submitted?: string;
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
    profileResult,
    requestResult,
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

    supabase
      .from("profiles")
      .select(
        "display_name",
      )
      .eq(
        "id",
        userId,
      )
      .maybeSingle(),

    supabase
      .from("billing_requests")
      .select(
        "id,status",
      )
      .eq(
        "user_id",
        userId,
      )
      .in(
        "status",
        [
          "pending",
          "contacted",
          "paid",
        ],
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

  if (
    requestResult.error
  ) {
    throw new Error(
      copy.errors.requestFailed,
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

  const defaultName =
    profileResult.data?.display_name
      ?.trim()
    ?? "";

  const defaultEmail =
    typeof claimsData?.claims?.email
      === "string"
      ? claimsData.claims.email
      : "";

  const submitted =
    query.submitted === "1"
    || Boolean(
      requestResult.data,
    );

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
              styles.requestBadge
            }
          >
            {copy.requestBadge}
          </span>

          <h2>
            {copy.productName}
          </h2>

          <p>
            {copy.requestExplanation}
          </p>

          <div
            className={
              styles.priceOptions
            }
          >
            <div
              className={
                styles.priceOption
              }
            >
              <span>
                {copy.countryBelarus}
              </span>

              <del>
                {copy.standardPriceBelarus}
              </del>

              <strong>
                {copy.promoPriceBelarus}
              </strong>
            </div>

            <div
              className={
                styles.priceOption
              }
            >
              <span>
                {copy.countryRussia}
              </span>

              <del>
                {copy.standardPriceRussia}
              </del>

              <strong>
                {copy.promoPriceRussia}
              </strong>
            </div>

            <div
              className={
                styles.priceOption
              }
            >
              <span>
                {copy.countryOther}
              </span>

              <del>
                {copy.standardPriceInternational}
              </del>

              <strong>
                {copy.promoPriceInternational}
              </strong>
            </div>
          </div>

          <p
            className={
              styles.priceLock
            }
          >
            {copy.priceLock}
          </p>

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

          {submitted ? (
            <div
              className={
                styles.success
              }
              role="status"
            >
              <strong>
                {copy.requestSuccessTitle}
              </strong>

              <p>
                {copy.requestSuccessBody}
              </p>
            </div>
          ) : (
            <form
              action={
                submitManualBillingRequest
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

              <div
                className={
                  styles.fieldGrid
                }
              >
                <label
                  className={
                    styles.field
                  }
                >
                  <span>
                    {copy.customerName}
                  </span>

                  <input
                    className={
                      styles.input
                    }
                    defaultValue={
                      defaultName
                    }
                    maxLength={120}
                    name="customerName"
                    placeholder={
                      copy.customerNamePlaceholder
                    }
                    required
                  />
                </label>

                <label
                  className={
                    styles.field
                  }
                >
                  <span>
                    {copy.companyName}
                  </span>

                  <input
                    className={
                      styles.input
                    }
                    maxLength={160}
                    name="companyName"
                    placeholder={
                      copy.companyNamePlaceholder
                    }
                  />
                </label>

                <label
                  className={
                    styles.field
                  }
                >
                  <span>
                    {copy.country}
                  </span>

                  <select
                    className={
                      styles.input
                    }
                    defaultValue=""
                    name="pricingRegion"
                    required
                  >
                    <option
                      disabled
                      value=""
                    >
                      {copy.countryPlaceholder}
                    </option>

                    <option value="by">
                      {copy.countryBelarus}
                    </option>

                    <option value="ru">
                      {copy.countryRussia}
                    </option>

                    <option value="intl">
                      {copy.countryOther}
                    </option>
                  </select>
                </label>

                <label
                  className={
                    styles.field
                  }
                >
                  <span>
                    {copy.email}
                  </span>

                  <input
                    className={
                      styles.input
                    }
                    defaultValue={
                      defaultEmail
                    }
                    maxLength={320}
                    name="email"
                    placeholder={
                      copy.emailPlaceholder
                    }
                    required
                    type="email"
                  />
                </label>

                <label
                  className={
                    styles.field
                  }
                >
                  <span>
                    {copy.contactMethod}
                  </span>

                  <select
                    className={
                      styles.input
                    }
                    defaultValue="telegram"
                    name="contactMethod"
                    required
                  >
                    <option value="telegram">
                      {copy.contactTelegram}
                    </option>

                    <option value="phone">
                      {copy.contactPhone}
                    </option>
                  </select>
                </label>

                <label
                  className={
                    styles.field
                  }
                >
                  <span>
                    {copy.contactValue}
                  </span>

                  <input
                    className={
                      styles.input
                    }
                    maxLength={160}
                    name="contactValue"
                    placeholder={
                      copy.contactValuePlaceholder
                    }
                    required
                  />
                </label>
              </div>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  {copy.note}
                </span>

                <textarea
                  className={
                    styles.textarea
                  }
                  maxLength={1000}
                  name="note"
                  placeholder={
                    copy.notePlaceholder
                  }
                  rows={4}
                />
              </label>

              <button
                className={
                  styles.submit
                }
                type="submit"
              >
                {copy.submitRequest}
              </button>
            </form>
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
                {copy.manual}
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
