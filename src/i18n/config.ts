export const LOCALES = [
  "ru",
  "en",
] as const;

export type Locale =
  (typeof LOCALES)[number];

export const DEFAULT_LOCALE:
Locale =
  "ru";

export const LOCALE_COOKIE_NAME =
  "anvera_locale";

export const LOCALE_STORAGE_KEY =
  "anvera_locale";

export const LOCALE_COOKIE_MAX_AGE_SECONDS =
  60 * 60 * 24 * 365;

export type Dictionary = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };

  common: {
    language: {
      label: string;
      ru: string;
      en: string;
      switchToRussian: string;
      switchToEnglish: string;
    };
  };

  dashboard: {
    install: {
      backToAssistant: string;
      eyebrow: string;
      titleTemplate: string;
      intro: string;

      proActive: string;
      freePlan: string;
      upgradedNotice: string;

      websiteEmbed: string;
      unlockedTitle: string;
      lockedTitle: string;
      unlockedBody: string;
      lockedBody: string;

      playground: string;
      included: string;
      websiteEmbedFeature: string;
      unlocked: string;
      pro: string;
      monthlyMessages: string;
      knowledgeSources: string;

      publishedNotice: string;
      draftNotice: string;

      publishAssistant: string;
      backToAssistantButton: string;
      upgradeCta: string;
      keepTesting: string;

      assistantLabel: string;
      assistantDescription: string;
      planLabel: string;
      assistantStatus: string;
      statusReady: string;
      statusArchived: string;
      statusDraft: string;
      publishingLabel: string;
      published: string;
      notPublished: string;

      installationCode: string;
      snippetTitle: string;
      snippetHelp: string;
      openPreview: string;
      publicIdNote: string;

      copied: string;
      copyCode: string;

      errors: {
        planCheckFailed: string;
        proRequired: string;
        knowledgeCheckFailed: string;
        knowledgeRequired: string;
        alreadyPublished: string;
        publishFailed: string;
        publishedSuccess: string;
      };
    };

    billing: {
      backToInstallation: string;
      eyebrow: string;
      title: string;
      lead: string;

      mockCheckout: string;
      productName: string;
      demoExplanation: string;
      price: string;
      perMonth: string;

      featureAssistants: string;
      featureKnowledge: string;
      featureMessages: string;
      featureEmbed: string;
      featureBranding: string;
      featureCustomization: string;

      completeMockUpgrade: string;
      mockDisabledPage: string;
      disclaimer: string;

      summaryTitle: string;
      summaryLeadTemplate: string;
      currentPlan: string;
      newPlan: string;
      billingLabel: string;
      freePlan: string;
      proPlan: string;
      mock: string;
      websiteEmbed: string;
      included: string;

      errors: {
        subscriptionLoadFailed: string;
        mockDisabledAction: string;
        upgradeFailed: string;
      };
    };

    playground: {
      backToAssistant: string;
      freePlan: string;
      proPlan: string;

      eyebrow: string;
      intro: string;

      messagesThisMonth: string;
      sentFromTemplate: string;

      knowledgeRequired: string;
      proLimitReached: string;
      freeLimitReached: string;

      startConversation: string;
      welcomeFallback: string;

      you: string;
      sources: string;
      knowledgeSource: string;

      composerNote: string;

      readySources: string;
      readySourcesDescription: string;

      context: string;
      lastEightMessages: string;
      contextDescription: string;

      knowledgeSearch: string;
      bestFiveMatches: string;
      knowledgeSearchDescription: string;

      questionLabel: string;
      questionPlaceholder: string;
      knowledgeFirstPlaceholder: string;

      thinking: string;
      askAssistant: string;

      clearConfirm: string;
      clearing: string;
      clearChat: string;

      errors: {
        questionRequired: string;
        questionTooLong: string;

        knowledgeCheckFailed: string;
        knowledgeRequired: string;

        allowanceCheckFailed: string;
        proLimit: string;
        freeLimit: string;

        conversationOpenFailed: string;
        historyLoadFailed: string;

        defaultFallback: string;
        answerFailed: string;
        answerSaveFailed: string;
        exchangeSaveFailed: string;

        answerGenerated: string;

        clearFailed: string;
        alreadyClear: string;
        cleared: string;
      };
    };

    knowledge: {
      eyebrow: string;
      title: string;
      intro: string;

      freeLimitReached: string;
      proLimitReached: string;

      uploadTitle: string;
      uploadHint: string;
      uploadButton: string;

      chooseDocument: string;
      noFileSelected: string;
      privateDocument: string;

      addTextTitle: string;
      addTextDescription: string;
      sourceTitle: string;
      sourceTitlePlaceholder: string;
      companyKnowledge: string;
      contentPlaceholder: string;
      addTextButton: string;

      sourcesTitle: string;
      sourcesDescription: string;
      sourceCounterTemplate: string;

      emptyTitle: string;
      emptyBody: string;

      statusPending: string;
      statusProcessing: string;
      statusReady: string;
      statusFailed: string;

      typeDocument: string;
      typeText: string;

      process: string;
      retry: string;
      remove: string;

      defaultDocumentTitle: string;

      errors: {
        titleRequired: string;
        titleTooLong: string;
        contentRequired: string;
        contentTooLong: string;

        planCheckFailed: string;
        sourceLimitCheckFailed: string;
        accountLimitCheckFailed: string;

        freeLimit: string;
        proLimit: string;

        addFailed: string;
        textAdded: string;

        unavailable: string;
        removeStoredFailed: string;
        removeFailed: string;
        removed: string;

        alreadyProcessing: string;
        pdfUnreadable: string;
        sourceTooLarge: string;
        pdfTimeout: string;
        processingFailed: string;
        processFailed: string;
        processedTemplate: string;

        uploadReadFailed: string;
        chooseUpload: string;
        fileEmpty: string;
        fileTooLarge: string;
        unsupportedFile: string;
        storeFailed: string;
        registerFailed: string;
        documentUploaded: string;
      };
    };

    detail: {
      backToAssistants: string;
      eyebrow: string;
      descriptionFallback: string;
      knowledgeSources: string;
      freePlan: string;
      proPlan: string;
      createdNotice: string;

      settingsTitle: string;
      settingsSubtitle: string;
      editSettings: string;

      assistantName: string;
      assistantNameHint: string;

      description: string;
      descriptionHint: string;

      instructions: string;
      instructionsHint: string;

      welcomeMessage: string;
      welcomeHint: string;

      fallbackMessage: string;
      fallbackHint: string;

      brandColor: string;
      brandHint: string;

      changesNote: string;
      saveChanges: string;

      playgroundLauncherEyebrow: string;
      playgroundLauncherTitle: string;
      playgroundLauncherBody: string;
      playgroundLauncherOpen: string;

      installLauncherEyebrow: string;
      installLauncherTitle: string;
      installLauncherProBody: string;
      installLauncherFreeBody: string;
      installLauncherOpen: string;

      errors: {
        nameRequired: string;
        nameTooLong: string;
        descriptionTooLong: string;
        instructionsTooLong: string;
        welcomeTooLong: string;
        fallbackTooLong: string;
        invalidBrandColor: string;
        saveFailed: string;
        saved: string;
      };
    };

    newAssistant: {
      eyebrow: string;
      title: string;
      lead: string;

      assistantName: string;
      namePlaceholder: string;
      nameHint: string;

      description: string;
      descriptionPlaceholder: string;

      welcomeMessage: string;
      welcomePlaceholder: string;
      welcomeHint: string;
      defaultWelcomeMessage: string;

      instructions: string;
      instructionsPlaceholder: string;
      instructionsHint: string;

      brandColor: string;
      brandHint: string;
      brandColorContext: string;
      brandColorPickerLabel: string;
      brandColorHexLabel: string;
      brandColorPreview: string;

      cancel: string;
      submit: string;

      errors: {
        nameRequired: string;
        nameTooLong: string;
        descriptionTooLong: string;
        instructionsTooLong: string;
        welcomeTooLong: string;
        invalidBrandColor: string;
        planCheckFailed: string;
        assistantLimitCheckFailed: string;
        freeLimit: string;
        proLimit: string;
        createFailed: string;
      };
    };

    selfService: {
      unpublishAssistant: string;
      alreadyUnpublished: string;
      unpublishFailed: string;
      unpublishedSuccess: string;

      dangerZone: string;

      deleteAssistantTitle: string;
      deleteAssistantBody: string;
      deleteAssistantConfirm: string;
      deleteAssistantButton: string;
      deleteAssistantFailed: string;
      assistantDeletedSuccess: string;

      deleteAccountTitle: string;
      deleteAccountBody: string;
      deleteAccountConfirm: string;
      deleteAccountButton: string;
      deleteAccountFailed: string;
      accountDeletedSuccess: string;

      confirmationRequired: string;
      storageCleanupFailed: string;
    };

    shell: {
      homeLabel: string;
      navigationLabel: string;
      assistants: string;
      newAssistant: string;
      accountFallback: string;
      freePlan: string;
      proPlan: string;
      signOut: string;
      workspace: string;
    };

    home: {
      eyebrow: string;
      title: string;
      lead: string;
      createdNotice: string;
      accountUsageLabel: string;
      assistantsStat: string;
      freePlan: string;
      proPlan: string;
      messagesThisMonth: string;
      playgroundAndWebsite: string;
      knowledgeSources: string;
      addDocuments: string;
      assistantsSection: string;
      emptyTitle: string;
      emptyBody: string;
      createAssistant: string;
      noDescription: string;
      open: string;
      statusDraft: string;
      statusReady: string;
      statusArchived: string;
    };
  };

  landing: {
    homeLabel: string;

    navigation: {
      howItWorks: string;
      features: string;
      pricing: string;
      faq: string;
      demo: string;
      dashboard: string;
      signIn: string;
      openDashboard: string;
      buildAssistant: string;
    };

    hero: {
      eyebrow: string;
      title: string;
      lead: string;
      secondaryCta: string;
      trustAnswers: string;
      trustSources: string;
      trustNoCard: string;
      productPreviewLabel: string;
      assistantTitle: string;
      ready: string;
      workspace: string;
      playground: string;
      knowledge: string;
      install: string;
      testAssistant: string;
      sourcesReady: string;
      questionDelivery: string;
      answerDelivery: string;
      deliveryDocument: string;
      pageTwo: string;
      questionReturn: string;
      input: string;
      knowledgeReady: string;
      websiteChat: string;
      quickSetup: string;
    };

    problem: {
      kicker: string;
      title: string;
      body: string;
      firstTitle: string;
      firstBody: string;
      secondTitle: string;
      secondBody: string;
      thirdTitle: string;
      thirdBody: string;
    };

    how: {
      kicker: string;
      title: string;
      firstTitle: string;
      firstBody: string;
      firstFile: string;
      secondFile: string;
      ready: string;
      secondTitle: string;
      secondBody: string;
      sampleQuestion: string;
      sampleAnswer: string;
      thirdTitle: string;
      thirdBody: string;
      installReady: string;
      copyCode: string;
    };

    trust: {
      kicker: string;
      title: string;
      body: string;
      firstTitle: string;
      firstBody: string;
      firstProof: string;
      secondTitle: string;
      secondBody: string;
      secondProof: string;
      thirdTitle: string;
      thirdBody: string;
      thirdProof: string;
      fourthTitle: string;
      fourthBody: string;
      fourthProof: string;
    };

    preview: {
      kicker: string;
      title: string;
      body: string;
      firstPoint: string;
      secondPoint: string;
      thirdPoint: string;
      liveDemo: string;
      assistantLabel: string;
      online: string;
      welcome: string;
      question: string;
      answer: string;
      source: string;
      input: string;
    };

    pricing: {
      kicker: string;
      title: string;
      body: string;
      freeName: string;
      freeDescription: string;
      forever: string;
      startFree: string;
      freeAssistant: string;
      freeSources: string;
      freeMessages: string;
      playground: string;
      basicCustomization: string;
      freeLimit: string;
      bestForWebsites: string;
      proName: string;
      proDescription: string;
      perMonth: string;
      choosePro: string;
      proAssistants: string;
      proSources: string;
      proMessages: string;
      addWebsite: string;
      customBranding: string;
      advancedCustomization: string;
      proNote: string;
    };

    faq: {
      kicker: string;
      title: string;
      body: string;
      firstQuestion: string;
      firstAnswer: string;
      secondQuestion: string;
      secondAnswer: string;
      thirdQuestion: string;
      thirdAnswer: string;
      fourthQuestion: string;
      fourthAnswer: string;
      fifthQuestion: string;
      fifthAnswer: string;
    };

    cta: {
      kicker: string;
      title: string;
    };

    footer: {
      tagline: string;
    };
  };

  demo: {
    northstar: {
      brand: string;
      navigationAria: string;
      navCoffee: string;
      navWholesale: string;
      navVisit: string;
      navSupport: string;
      eyebrow: string;
      title: string;
      lead: string;
      backToAnvera: string;
      featureTitle: string;
      featureBody: string;
    };
  };

  auth: {
    homeLabel: string;

    common: {
      email: string;
      password: string;
      name: string;
      newPassword: string;
      confirmNewPassword: string;
    };

    password: {
      show: string;
      hide: string;
    };

    login: {
      kicker: string;
      heroTitle: string;
      heroBody: string;
      title: string;
      subtitle: string;
      forgotPassword: string;
      submit: string;
      newToAnvera: string;
      createAccount: string;
    };

    signUp: {
      kicker: string;
      heroTitle: string;
      heroBody: string;
      title: string;
      subtitle: string;
      submit: string;
      alreadyHaveAccount: string;
      signIn: string;
    };

    checkEmail: {
      kicker: string;
      heroTitle: string;
      title: string;
      sentPrefix: string;
      to: string;
      sentSuffix: string;
      back: string;
    };

    forgotPassword: {
      kicker: string;
      heroTitle: string;
      heroBody: string;
      title: string;
      subtitle: string;
      submit: string;
      remembered: string;
      back: string;
    };

    resetSent: {
      kicker: string;
      heroTitle: string;
      title: string;
      accountPrefix: string;
      accountSuffix: string;
      back: string;
    };

    updatePassword: {
      kicker: string;
      heroTitle: string;
      heroBody: string;
      title: string;
      subtitle: string;
      submit: string;
    };

    errors: {
      enterEmail: string;
      passwordMin8: string;
      signUpFailed: string;
      enterEmailAndPassword: string;
      signInFailed: string;
      resetEmailFailed: string;
      newPasswordMin8: string;
      passwordsDoNotMatch: string;
      resetLinkExpired: string;
      updatePasswordFailed: string;
      passwordUpdated: string;
      invalidAuthLink: string;
      requestNewResetLink: string;
    };
  };
};

export function isLocale(
  value: unknown,
): value is Locale {
  return (
    typeof value === "string"
    && LOCALES.includes(
      value as Locale,
    )
  );
}

export function normalizeLocale(
  value: unknown,
): Locale {
  return isLocale(value)
    ? value
    : DEFAULT_LOCALE;
}
