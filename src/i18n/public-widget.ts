export type PublicWidgetLocale =
  | "ru"
  | "en";

export function normalizePublicWidgetLocale(
  value:
    | string
    | null
    | undefined,
  fallback:
    PublicWidgetLocale =
      "ru",
): PublicWidgetLocale {
  const normalized =
    value
      ?.trim()
      .toLowerCase();

  if (
    normalized === "ru"
    || normalized
      ?.startsWith(
        "ru-",
      )
  ) {
    return "ru";
  }

  if (
    normalized === "en"
    || normalized
      ?.startsWith(
        "en-",
      )
  ) {
    return "en";
  }

  return fallback;
}

export const publicWidgetCopy = {
  ru: {
    chatAriaLabel:
      "Чат с ассистентом {name}",
    headerSubtitle:
      "Спросите о нашей компании",
    closeChat:
      "Закрыть чат",
    assistantThinking:
      "Ассистент формирует ответ",
    askQuestion:
      "Задать вопрос",
    sendMessage:
      "Отправить сообщение",
    footerNote:
      "Ответы основаны на предоставленных знаниях компании",

    questionTooLong:
      "Вопрос может содержать не более 2 000 символов.",
    answerFailed:
      "Ассистент не смог ответить. Попробуйте ещё раз.",

    launcher:
      "Спросить",
    closeLauncher:
      "Закрыть",
    launcherAria:
      "Открыть чат с ассистентом",
    frameTitle:
      "Чат с ИИ-ассистентом",

    assistantNotFound:
      "Ассистент не найден.",
    invalidRequest:
      "Некорректный запрос.",
    requestTooLarge:
      "Запрос слишком большой.",
    questionRequired:
      "Сначала задайте вопрос.",
    invalidConversation:
      "Некорректный диалог.",
    temporarilyUnavailable:
      "Ассистент временно недоступен.",
    rateLimited:
      "Слишком много вопросов за короткое время. Попробуйте ещё раз чуть позже.",
    monthlyLimit:
      "Ассистент достиг месячного лимита сообщений.",
    conversationNotFound:
      "Диалог не найден.",
    defaultFallback:
      "Мне не удалось найти ответ в доступных знаниях компании.",
    ragFailed:
      "Ассистент не смог ответить на этот вопрос. Попробуйте ещё раз.",
    answerSaveFailed:
      "Ответ сформирован, но сохранить его не удалось. Попробуйте ещё раз.",
    answerCouldNotBeSaved:
      "Не удалось сохранить ответ.",
  },

  en: {
    chatAriaLabel:
      "Chat with {name}",
    headerSubtitle:
      "Ask about our company",
    closeChat:
      "Close chat",
    assistantThinking:
      "Assistant is thinking",
    askQuestion:
      "Ask a question",
    sendMessage:
      "Send message",
    footerNote:
      "Answers are based on the company knowledge provided",

    questionTooLong:
      "Questions can be up to 2,000 characters.",
    answerFailed:
      "The assistant could not answer. Please try again.",

    launcher:
      "Ask us",
    closeLauncher:
      "Close",
    launcherAria:
      "Open customer support chat",
    frameTitle:
      "Customer support chat",

    assistantNotFound:
      "Assistant not found.",
    invalidRequest:
      "Invalid request.",
    requestTooLarge:
      "The request is too large.",
    questionRequired:
      "Ask a question first.",
    invalidConversation:
      "Invalid conversation.",
    temporarilyUnavailable:
      "The assistant is temporarily unavailable.",
    rateLimited:
      "Too many questions in a short time. Please try again shortly.",
    monthlyLimit:
      "This assistant has reached its monthly message limit.",
    conversationNotFound:
      "Conversation not found.",
    defaultFallback:
      "I could not find that in the available company knowledge.",
    ragFailed:
      "The assistant could not answer that question. Please try again.",
    answerSaveFailed:
      "The answer was generated but could not be saved. Please try again.",
    answerCouldNotBeSaved:
      "The answer could not be saved.",
  },
} as const;
