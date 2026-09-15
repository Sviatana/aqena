import Link from "next/link";

import {
  signOut,
} from "@/app/auth/actions";
import {
  AqenaLogo,
} from "@/components/aqena-brand";
import {
  requirePlatformOwner,
} from "@/lib/platform-owner";

import styles from "./platform-admin.module.css";

export const dynamic =
  "force-dynamic";

type SubscriptionRow = {
  user_id: string;
  plan: string;
  status: string;
  billing_mode: string;
};

type BillingRequestRow = {
  id: string;
  user_id: string;
  status: string;
  pricing_region: string;
  currency: string;
  promo_amount_minor: number;
  customer_name: string;
  company_name: string | null;
  email: string;
  contact_method: string;
  contact_value: string;
  created_at: string;
};

function dateTime(
  value: string | null | undefined,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "ru-RU",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(value),
  );
}

function amount(
  minor: number,
  currency: string,
) {
  return new Intl.NumberFormat(
    "ru-RU",
    {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(
    minor / 100,
  );
}

export default async function PlatformAdminPage() {
  const {
    owner,
    admin,
  } =
    await requirePlatformOwner();

  const [
    authResult,
    subscriptionsResult,
    billingResult,
  ] =
    await Promise.all([
      admin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      }),

      admin
        .from("subscriptions")
        .select(
          "user_id,plan,status,billing_mode",
        ),

      admin
        .from("billing_requests")
        .select(
          [
            "id",
            "user_id",
            "status",
            "pricing_region",
            "currency",
            "promo_amount_minor",
            "customer_name",
            "company_name",
            "email",
            "contact_method",
            "contact_value",
            "created_at",
          ].join(","),
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        )
        .limit(200),
    ]);

  if (authResult.error) {
    throw new Error(
      `Unable to load platform users: ${authResult.error.message}`,
    );
  }

  if (subscriptionsResult.error) {
    throw new Error(
      `Unable to load subscriptions: ${subscriptionsResult.error.message}`,
    );
  }

  if (billingResult.error) {
    throw new Error(
      `Unable to load billing requests: ${billingResult.error.message}`,
    );
  }

  const subscriptions =
    (
      subscriptionsResult.data
      ?? []
    ) as SubscriptionRow[];

  const billingRequests =
    (
      billingResult.data
      ?? []
    ) as unknown as BillingRequestRow[];

  const subscriptionByUser =
    new Map(
      subscriptions.map(
        (subscription) => [
          subscription.user_id,
          subscription,
        ],
      ),
    );

  const users =
    authResult.data.users;

  const pendingCount =
    billingRequests.filter(
      (request) =>
        request.status
          === "pending",
    ).length;

  const proCount =
    subscriptions.filter(
      (subscription) =>
        subscription.plan
          === "pro"
        && subscription.status
          === "active",
    ).length;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link
          aria-label="AQENA"
          className={styles.logo}
          href="/dashboard"
        >
          <AqenaLogo
            width={108}
          />
        </Link>

        <div className={styles.headerActions}>
          <span className={styles.ownerBadge}>
            Владелец платформы
          </span>

          <Link
            className={styles.backLink}
            href="/dashboard"
          >
            ← В рабочее пространство
          </Link>

          <form
            action={signOut}
            className={styles.signOutForm}
          >
            <button
              className={styles.signOutButton}
              type="submit"
            >
              Выйти
            </button>
          </form>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>
              AQENA · PLATFORM ADMIN
            </p>

            <h1>
              Управление платформой
            </h1>

            <p className={styles.subtitle}>
              Закрытый раздел владельца AQENA.
              Доступ разрешён только подтверждённому
              аккаунту {owner.email}.
            </p>
          </div>
        </div>

        <section className={styles.metrics}>
          <article className={styles.metric}>
            <span>
              Пользователи
            </span>

            <strong>
              {users.length}
            </strong>
          </article>

          <article className={styles.metric}>
            <span>
              Активные Pro
            </span>

            <strong>
              {proCount}
            </strong>
          </article>

          <article className={styles.metric}>
            <span>
              Новые заявки Pro
            </span>

            <strong>
              {pendingCount}
            </strong>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>
                УЧАСТНИКИ
              </p>

              <h2>
                Пользователи AQENA
              </h2>
            </div>

            <span className={styles.muted}>
              Показаны первые 200 аккаунтов
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>
                    Email
                  </th>

                  <th>
                    Подтверждён
                  </th>

                  <th>
                    Тариф
                  </th>

                  <th>
                    Статус
                  </th>

                  <th>
                    Billing
                  </th>

                  <th>
                    Регистрация
                  </th>

                  <th>
                    Последний вход
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map(
                  (user) => {
                    const subscription =
                      subscriptionByUser.get(
                        user.id,
                      );

                    return (
                      <tr key={user.id}>
                        <td>
                          <strong>
                            {user.email ?? "—"}
                          </strong>
                        </td>

                        <td>
                          {
                            user.email_confirmed_at
                              ? "Да"
                              : "Нет"
                          }
                        </td>

                        <td>
                          <span
                            className={
                              subscription?.plan
                                === "pro"
                                ? styles.pro
                                : styles.free
                            }
                          >
                            {
                              subscription?.plan
                                ?? "—"
                            }
                          </span>
                        </td>

                        <td>
                          {
                            subscription?.status
                              ?? "—"
                          }
                        </td>

                        <td>
                          {
                            subscription?.billing_mode
                              ?? "—"
                          }
                        </td>

                        <td>
                          {dateTime(
                            user.created_at,
                          )}
                        </td>

                        <td>
                          {dateTime(
                            user.last_sign_in_at,
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>
                MANUAL PRO
              </p>

              <h2>
                Заявки на Pro
              </h2>
            </div>

            <span className={styles.muted}>
              Последние 200 заявок
            </span>
          </div>

          {
            billingRequests.length
              === 0
              ? (
                <div className={styles.empty}>
                  Заявок на Pro пока нет.
                </div>
              )
              : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>
                          Клиент
                        </th>

                        <th>
                          Контакт
                        </th>

                        <th>
                          Регион
                        </th>

                        <th>
                          Цена
                        </th>

                        <th>
                          Статус
                        </th>

                        <th>
                          Создана
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {billingRequests.map(
                        (request) => (
                          <tr key={request.id}>
                            <td>
                              <strong>
                                {request.customer_name}
                              </strong>

                              <div className={styles.secondary}>
                                {
                                  request.company_name
                                    || request.email
                                }
                              </div>
                            </td>

                            <td>
                              <div>
                                {request.email}
                              </div>

                              <div className={styles.secondary}>
                                {request.contact_method}:{" "}
                                {request.contact_value}
                              </div>
                            </td>

                            <td>
                              {request.pricing_region}
                            </td>

                            <td>
                              {amount(
                                request.promo_amount_minor,
                                request.currency,
                              )}
                            </td>

                            <td>
                              <span
                                className={
                                  request.status
                                    === "pending"
                                    ? styles.pending
                                    : styles.status
                                }
                              >
                                {request.status}
                              </span>
                            </td>

                            <td>
                              {dateTime(
                                request.created_at,
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )
          }
        </section>

        <p className={styles.securityNote}>
          Этот раздел использует серверный административный
          доступ Supabase. Секретный ключ не передаётся
          в браузер. На этом этапе панель только читает данные
          и ничего не меняет в аккаунтах клиентов.
        </p>
      </section>
    </main>
  );
}
