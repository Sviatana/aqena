import Link from "next/link";

import {
  signOut,
} from "@/app/auth/actions";

import {
  activateManualProRequest,
  cancelManualProRequest,
} from "./actions";

import {
  OwnerActionButton,
} from "./owner-action-button";
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

function subscriptionStatusLabel(
  value: string | null | undefined,
) {
  switch (value) {
    case "active":
      return "Активен";

    case "inactive":
      return "Неактивен";

    case "cancelled":
    case "canceled":
      return "Отменён";

    default:
      return value || "—";
  }
}

function billingModeLabel(
  value: string | null | undefined,
) {
  switch (value) {
    case "manual":
      return "Ручная оплата";

    case "mock":
      return "Тестовый / старый режим";

    case "stripe":
      return "Stripe";

    default:
      return value || "—";
  }
}

function billingRequestStatusLabel(
  value: string,
) {
  switch (value) {
    case "pending":
      return "Ожидает оплаты";

    case "contacted":
      return "Связались";

    case "paid":
      return "Оплата подтверждена";

    case "activated":
      return "Pro активирован";

    case "cancelled":
      return "Отменена";

    default:
      return value;
  }
}

function pricingRegionLabel(
  value: string,
) {
  switch (value) {
    case "by":
      return "Беларусь";

    case "ru":
      return "Россия";

    case "intl":
      return "Другая страна";

    default:
      return value;
  }
}

function contactMethodLabel(
  value: string,
) {
  switch (value) {
    case "phone":
      return "Телефон";

    case "telegram":
      return "Telegram";

    default:
      return value;
  }
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
              AQENA · ПАНЕЛЬ ВЛАДЕЛЬЦА
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
                    Оплата
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
                            subscriptionStatusLabel(
                              subscription?.status,
                            )
                          }
                        </td>

                        <td>
                          {
                            billingModeLabel(
                              subscription?.billing_mode,
                            )
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
                РУЧНОЙ PRO
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

                        <th>
                          Действия
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
                                {contactMethodLabel(request.contact_method)}:{" "}
                                {request.contact_value}
                              </div>
                            </td>

                            <td>
                              {pricingRegionLabel(request.pricing_region)}
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
                                {
                                  billingRequestStatusLabel(
                                    request.status,
                                  )
                                }
                              </span>
                            </td>

                            <td>
                              {dateTime(
                                request.created_at,
                              )}
                            </td>

                            <td>
                              {
                                [
                                  "pending",
                                  "contacted",
                                  "paid",
                                ].includes(
                                  request.status,
                                )
                                  ? (
                                    <div
                                      className={
                                        styles.requestActions
                                      }
                                    >
                                      <form
                                        action={
                                          activateManualProRequest.bind(
                                            null,
                                            request.id,
                                          )
                                        }
                                        className={
                                          styles.actionForm
                                        }
                                      >
                                        <OwnerActionButton
                                          className={
                                            styles.activateButton
                                          }
                                          confirmMessage="Оплата действительно получена? После подтверждения пользователю будет активирован тариф Pro."
                                          pendingLabel="Активируем Pro…"
                                        >
                                          Оплата получена — активировать Pro
                                        </OwnerActionButton>
                                      </form>

                                      <form
                                        action={
                                          cancelManualProRequest.bind(
                                            null,
                                            request.id,
                                          )
                                        }
                                        className={
                                          styles.actionForm
                                        }
                                      >
                                        <OwnerActionButton
                                          className={
                                            styles.cancelButton
                                          }
                                          confirmMessage="Отменить эту заявку? Тариф пользователя изменён не будет."
                                          pendingLabel="Отменяем…"
                                        >
                                          Отменить заявку
                                        </OwnerActionButton>
                                      </form>
                                    </div>
                                  )
                                  : (
                                    <span
                                      className={
                                        styles.closedAction
                                      }
                                    >
                                      {
                                        request.status
                                          === "activated"
                                          ? "Pro активирован"
                                          : "Заявка закрыта"
                                      }
                                    </span>
                                  )
                              }
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
          в браузер. Тариф Pro активируется владельцем платформы
          вручную только после проверки фактического поступления оплаты.
        </p>
      </section>
    </main>
  );
}
