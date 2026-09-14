import type {
  Dictionary,
} from "@/i18n/config";

export const en = {
  metadata: {
    title:
      "AQENA — Customer support built from your company knowledge",
    description:
      "Turn your company knowledge into reliable customer answers and add your assistant to your website.",
    keywords: [
      "AI knowledge assistant",
      "customer support AI",
      "knowledge base",
      "website chatbot",
    ],
  },

  common: {
    language: {
      label:
        "Interface language",
      ru:
        "RU",
      en:
        "EN",
      switchToRussian:
        "Switch to Russian",
      switchToEnglish:
        "Switch to English",
    },
  },

  dashboard: {
    install: {
      backToAssistant:
        "← Back to assistant",
      eyebrow:
        "Install",
      titleTemplate:
        "Add {name} to your website",
      intro:
        "Publish your assistant, copy one embed snippet and place it on the site where customers need help.",

      proActive:
        "Pro active",
      freePlan:
        "Free plan",
      upgradedNotice:
        "Pro is active. Website installation is now unlocked.",

      websiteEmbed:
        "Website embed",
      unlockedTitle:
        "Website installation unlocked",
      lockedTitle:
        "Website installation is a Pro feature",
      unlockedBody:
        "Your plan now includes website embedding. The next setup step is to publish this assistant and generate its installation code.",
      lockedBody:
        "Playground testing stays available on Free. Upgrade to Pro when you are ready to place the assistant on a live website.",

      playground:
        "Playground",
      included:
        "Included",
      websiteEmbedFeature:
        "Website embed",
      unlocked:
        "Unlocked",
      pro:
        "Pro",
      monthlyMessages:
        "Monthly messages",
      knowledgeSources:
        "Knowledge sources",

      publishedNotice:
        "This assistant is published and ready for embed setup.",
      draftNotice:
        "This assistant is still a draft. Publishing will create the public installation endpoint used by the website widget.",

      publishAssistant:
        "Publish assistant",
      backToAssistantButton:
        "Back to assistant",
      upgradeCta:
        "Get Pro →",
      keepTesting:
        "Keep testing",

      assistantLabel:
        "Assistant",
      assistantDescription:
        "Installation access follows the workspace plan, while publishing is controlled per assistant.",
      planLabel:
        "Plan",
      assistantStatus:
        "Assistant status",
      statusReady:
        "Ready",
      statusArchived:
        "Archived",
      statusDraft:
        "Draft",
      publishingLabel:
        "Publishing",
      published:
        "Published",
      notPublished:
        "Not published",

      installationCode:
        "Installation code",
      snippetTitle:
        "Add your AI assistant to your website",
      snippetHelp:
        "Paste this script before the closing body tag on the page where you want the assistant to appear.",
      openPreview:
        "Open preview",
      publicIdNote:
        "Uses the public assistant ID only. No private keys are included.",

      copied:
        "Copied",
      copyCode:
        "Copy code",

      errors: {
        planCheckFailed:
          "We could not check your plan.",
        proRequired:
          "Website publishing requires an active Pro plan.",
        knowledgeCheckFailed:
          "We could not check this assistant's knowledge.",
        knowledgeRequired:
          "Process at least one knowledge source before publishing.",
        alreadyPublished:
          "This assistant is already published.",
        publishFailed:
          "We could not publish this assistant. Please try again.",
        publishedSuccess:
          "Assistant published. It is ready for website setup.",
      },
    },

    billing: {
      backToInstallation:
        "← Back to installation",
      eyebrow:
        "Upgrade",
      title:
        "Upgrade to Pro",
      lead:
        "Unlock website embedding and higher limits for your workspace.",

      mockCheckout:
        "Mock checkout",
      productName:
        "AQENA Pro",
      demoExplanation:
        "No real payment will be processed. This demo checkout activates Pro without collecting or storing payment card information.",
      price:
        "$29",
      perMonth:
        "/ month",

      featureAssistants:
        "Up to 5 assistants",
      featureKnowledge:
        "Up to 100 knowledge sources",
      featureMessages:
        "2,000 messages per month",
      featureEmbed:
        "Website embed",
      featureBranding:
        "Custom branding",
      featureCustomization:
        "Advanced customization",

      completeMockUpgrade:
        "Complete mock upgrade",
      mockDisabledPage:
        "Mock billing is not enabled in this environment.",
      disclaimer:
        "Payment details are not collected on this website. Payment is arranged after you submit the request.",

      summaryTitle:
        "Upgrade summary",
      summaryLeadTemplate:
        "Pro applies to the whole workspace, including {name}.",
      currentPlan:
        "Current plan",
      newPlan:
        "New plan",
      billingLabel:
        "Billing",
      freePlan:
        "Free",
      proPlan:
        "Pro",
      mock:
        "Mock",
      websiteEmbed:
        "Website embed",
      included:
        "Included",
      manual:
        "Manual request",

      requestBadge:
        "GET PRO",
      requestExplanation:
        "Leave your contact details to arrange payment. We will contact you using the details below. Pro will be activated after payment is confirmed.",
      standardPriceBelarus:
        "79 BYN / month",
      promoPriceBelarus:
        "49 BYN / month",
      standardPriceRussia:
        "2,490 RUB / month",
      promoPriceRussia:
        "1,490 RUB / month",
      standardPriceInternational:
        "$29 / month",
      promoPriceInternational:
        "$19 / month",
      priceLock:
        "The promotional price is locked for 12 months from activation for the first 100 users with an uninterrupted subscription.",

      customerName:
        "Name",
      customerNamePlaceholder:
        "Your name",
      companyName:
        "Company",
      companyNamePlaceholder:
        "Optional",
      country:
        "Country",
      countryPlaceholder:
        "Choose your country",
      countryBelarus:
        "Belarus",
      countryRussia:
        "Russia",
      countryOther:
        "Other country",
      email:
        "Email",
      emailPlaceholder:
        "name@example.com",
      contactMethod:
        "Preferred contact",
      contactTelegram:
        "Telegram",
      contactPhone:
        "Phone",
      contactValue:
        "Contact",
      contactValuePlaceholder:
        "@username or phone number",
      note:
        "Comment",
      notePlaceholder:
        "For example, your website or a setup question. Optional.",
      submitRequest:
        "Submit payment request",
      requestSuccessTitle:
        "Request received",
      requestSuccessBody:
        "We will contact you to arrange payment. Pro will be activated after payment is confirmed.",

      errors: {
        subscriptionLoadFailed:
          "Unable to load subscription.",
        mockDisabledAction:
          "Mock billing is not enabled for this environment.",
        upgradeFailed:
          "We could not complete the mock upgrade. Please try again.",
        requestInvalid:
          "Please check the form details and try again.",
        requestFailed:
          "We could not submit your request. Please try again.",
      },
    },

    playground: {
      backToAssistant:
        "← Back to assistant",
      freePlan:
        "Free plan",
      proPlan:
        "Pro plan",

      eyebrow:
        "Playground",
      intro:
        "Test grounded answers against this assistant's ready knowledge sources.",

      messagesThisMonth:
        "Messages this month",
      sentFromTemplate:
        "{count} sent from Playground",

      knowledgeRequired:
        "Process at least one knowledge source before asking questions.",
      proLimitReached:
        "You have reached your monthly Pro message limit.",
      freeLimitReached:
        "You have used all 50 Free messages for this month.",

      startConversation:
        "Start a conversation",
      welcomeFallback:
        "Ask a question about the knowledge you added to this assistant.",

      you:
        "You",
      sources:
        "Sources",
      knowledgeSource:
        "Knowledge source",

      composerNote:
        "Answers are limited to your uploaded knowledge.",

      readySources:
        "Ready sources",
      readySourcesDescription:
        "Only sources marked Ready can be retrieved for answers.",

      context:
        "Context",
      lastEightMessages:
        "Last 8 messages",
      contextDescription:
        "Conversation history helps with follow-up questions but is never treated as factual evidence.",

      knowledgeSearch:
        "Knowledge search",
      bestFiveMatches:
        "Best 5 matches",
      knowledgeSearchDescription:
        "AQENA checks the most relevant passages before answering.",

      questionLabel:
        "Ask a question",
      questionPlaceholder:
        "Ask about your company knowledge…",
      knowledgeFirstPlaceholder:
        "Process a knowledge source first",

      thinking:
        "Thinking…",
      askAssistant:
        "Ask assistant",

      clearConfirm:
        "Clear this Playground conversation? Your monthly usage will not be reset.",
      clearing:
        "Clearing…",
      clearChat:
        "Clear chat",

      errors: {
        questionRequired:
          "Ask a question first.",
        questionTooLong:
          "Playground questions can be up to 2,000 characters.",

        knowledgeCheckFailed:
          "We could not check this assistant's knowledge.",
        knowledgeRequired:
          "Process at least one knowledge source before using the Playground.",

        allowanceCheckFailed:
          "We could not check your monthly message allowance.",
        proLimit:
          "You have reached your Pro plan message limit for this month.",
        freeLimit:
          "You have reached the Free plan limit of 50 messages this month.",

        conversationOpenFailed:
          "We could not open the Playground conversation.",
        historyLoadFailed:
          "We could not load the conversation history.",

        defaultFallback:
          "I could not find that in the available company knowledge.",
        answerFailed:
          "AQENA could not answer that question. Please try again.",
        answerSaveFailed:
          "The answer was generated but could not be saved. Please try again.",
        exchangeSaveFailed:
          "We could not save this Playground exchange.",

        answerGenerated:
          "Answer generated.",

        clearFailed:
          "We could not clear this Playground conversation.",
        alreadyClear:
          "Playground is already clear.",
        cleared:
          "Playground conversation cleared.",
      },
    },

    knowledge: {
      eyebrow:
        "Knowledge",
      title:
        "Add company knowledge",
      intro:
        "Upload company documents or paste text that this assistant should use when answering.",

      freeLimitReached:
        "You have used all 3 sources included in the Free plan.",
      proLimitReached:
        "You have reached the 100-source Pro limit.",

      uploadTitle:
        "Upload document",
      uploadHint:
        "PDF, TXT or Markdown up to 5 MB",
      uploadButton:
        "Upload document",

      chooseDocument:
        "Choose a document",
      noFileSelected:
        "No file selected",
      privateDocument:
        "Documents stay private to your workspace.",

      addTextTitle:
        "Add text",
      addTextDescription:
        "Paste policies, FAQs, product notes or other company information.",
      sourceTitle:
        "Source title",
      sourceTitlePlaceholder:
        "Store policies",
      companyKnowledge:
        "Company knowledge",
      contentPlaceholder:
        "Paste the information this assistant should know...",
      addTextButton:
        "Add text source",

      sourcesTitle:
        "Knowledge sources",
      sourcesDescription:
        "Sources move through Pending, Processing, Ready or Failed as AQENA prepares them for answers.",
      sourceCounterTemplate:
        "{count} for this assistant",

      emptyTitle:
        "No knowledge sources yet",
      emptyBody:
        "Upload a document or add text above to build this assistant's knowledge.",

      statusPending:
        "Pending",
      statusProcessing:
        "Processing",
      statusReady:
        "Ready",
      statusFailed:
        "Failed",

      typeDocument:
        "Document",
      typeText:
        "Text",

      process:
        "Process",
      retry:
        "Retry",
      remove:
        "Remove",

      defaultDocumentTitle:
        "Document",

      errors: {
        titleRequired:
          "Give this text source a title.",
        titleTooLong:
          "Source titles can be up to 120 characters.",
        contentRequired:
          "Paste some company knowledge first.",
        contentTooLong:
          "Text sources can contain up to 100,000 characters.",

        planCheckFailed:
          "We could not check your plan. Please try again.",
        sourceLimitCheckFailed:
          "We could not check your knowledge source limit.",
        accountLimitCheckFailed:
          "We could not check your account limits. Please try again.",

        freeLimit:
          "The Free plan includes three knowledge sources. Upgrade to Pro to add more.",
        proLimit:
          "Your Pro plan includes up to 100 knowledge sources.",

        addFailed:
          "We could not add this knowledge source. Please try again.",
        textAdded:
          "Text source added.",

        unavailable:
          "This knowledge source is no longer available.",
        removeStoredFailed:
          "We could not remove the stored document. Please try again.",
        removeFailed:
          "We could not remove this knowledge source.",
        removed:
          "Knowledge source removed.",

        alreadyProcessing:
          "This knowledge source is already being processed.",
        pdfUnreadable:
          "This PDF does not contain readable text. Use a text-based PDF, TXT or Markdown document.",
        sourceTooLarge:
          "This document contains too much text to process. Try a smaller document.",
        pdfTimeout:
          "PDF processing took too long. Try a smaller document.",
        processingFailed:
          "We could not process this source. Retry in a moment.",
        processFailed:
          "We could not process this knowledge source.",
        processedTemplate:
          "Knowledge source processed into {count} chunks.",

        uploadReadFailed:
          "We could not read this upload. Please try again.",
        chooseUpload:
          "Choose a document to upload.",
        fileEmpty:
          "Choose a non-empty document.",
        fileTooLarge:
          "Documents can be up to 5 MB.",
        unsupportedFile:
          "Use a PDF, TXT or Markdown document.",
        storeFailed:
          "We could not store this document. Please try again.",
        registerFailed:
          "We could not register this document. Please try again.",
        documentUploaded:
          "Document uploaded.",
      },
    },

    detail: {
      backToAssistants:
        "← Back to assistants",
      eyebrow:
        "Assistant",
      descriptionFallback:
        "Add company knowledge for this assistant to use in its answers.",
      knowledgeSources:
        "Knowledge sources",
      freePlan:
        "Free plan",
      proPlan:
        "Pro plan",
      createdNotice:
        "Assistant created. Add its company knowledge next.",

      settingsTitle:
        "Assistant settings",
      settingsSubtitle:
        "Customize behavior and customer messages",
      editSettings:
        "Edit settings",

      assistantName:
        "Assistant name",
      assistantNameHint:
        "Customers see this name in the website chat.",

      description:
        "Description",
      descriptionHint:
        "A short workspace description of this assistant.",

      instructions:
        "Instructions",
      instructionsHint:
        "Define tone and answer boundaries. Leaving this empty restores AQENA's safe knowledge-only instructions.",

      welcomeMessage:
        "Welcome message",
      welcomeHint:
        "The first message customers see when the chat opens.",

      fallbackMessage:
        "Fallback message",
      fallbackHint:
        "Used when the company knowledge does not support an answer.",

      brandColor:
        "Brand color",
      brandHint:
        "Choose the color your business uses in the website chat.",

      changesNote:
        "Changes apply to Playground and website chat without changing your installation code.",
      saveChanges:
        "Save changes",

      playgroundLauncherEyebrow:
        "Playground",
      playgroundLauncherTitle:
        "Test this assistant",
      playgroundLauncherBody:
        "Ask real questions, inspect grounded answers and review the sources AQENA used.",
      playgroundLauncherOpen:
        "Open Playground",

      installLauncherEyebrow:
        "Install",
      installLauncherTitle:
        "Put this assistant on your website",
      installLauncherProBody:
        "Website installation is unlocked. Continue setup and prepare this assistant for publishing.",
      installLauncherFreeBody:
        "Website embedding is available on Pro. Review the install flow and upgrade when you are ready.",
      installLauncherOpen:
        "Open Install",

      errors: {
        nameRequired:
          "Give your assistant a name.",
        nameTooLong:
          "Assistant names can be up to 80 characters.",
        descriptionTooLong:
          "Description can be up to 500 characters.",
        instructionsTooLong:
          "Instructions can be up to 4,000 characters.",
        welcomeTooLong:
          "Welcome messages can be up to 500 characters.",
        fallbackTooLong:
          "Fallback messages can be up to 500 characters.",
        invalidBrandColor:
          "Choose a valid six-digit brand color.",
        saveFailed:
          "We could not save these assistant settings. Please try again.",
        saved:
          "Assistant settings saved.",
      },
    },

    newAssistant: {
      eyebrow:
        "New assistant",
      title:
        "Set up your assistant",
      lead:
        "Start with its role and boundaries. You will add company knowledge on the next step.",

      assistantName:
        "Assistant name",
      namePlaceholder:
        "Customer Support",
      nameHint:
        "Customers may see this name later in the website chat.",

      description:
        "Description",
      descriptionPlaceholder:
        "Answers customer questions about delivery, returns and products",

      welcomeMessage:
        "Welcome message",
      welcomePlaceholder:
        "Hi — ask me anything about our company knowledge.",
      welcomeHint:
        "The first message customers see when the chat opens.",
      defaultWelcomeMessage:
        "Hi — ask me anything about our company knowledge.",

      instructions:
        "Instructions",
      instructionsPlaceholder:
        "Answer only from the company knowledge. Keep answers concise and say when the information is not available.",
      instructionsHint:
        "If you leave this empty, AQENA will use the safe default: answer only from uploaded company knowledge.",

      brandColor:
        "Brand color",
      brandHint:
        "Choose the color your business uses in the website chat.",
      brandColorContext:
        "Website chat",
      brandColorPickerLabel:
        "Choose business brand color",
      brandColorHexLabel:
        "Brand color hexadecimal value",
      brandColorPreview:
        "This color is used in the customer-facing website chat.",

      cancel:
        "Cancel",
      submit:
        "Create assistant",

      errors: {
        nameRequired:
          "Give your assistant a name.",
        nameTooLong:
          "Assistant names can be up to 80 characters.",
        descriptionTooLong:
          "Description can be up to 500 characters.",
        instructionsTooLong:
          "Instructions can be up to 4,000 characters.",
        welcomeTooLong:
          "Welcome messages can be up to 500 characters.",
        invalidBrandColor:
          "Choose a valid six-digit brand color.",
        planCheckFailed:
          "We could not check your plan. Please try again.",
        assistantLimitCheckFailed:
          "We could not check your assistant limit.",
        freeLimit:
          "The Free plan includes one assistant. Upgrade to Pro to create more.",
        proLimit:
          "Your Pro plan includes up to five assistants.",
        createFailed:
          "We could not create your assistant. Please try again.",
      },
    },

    selfService: {
      unpublishAssistant:
        "Unpublish assistant",
      alreadyUnpublished:
        "This assistant is already unpublished.",
      unpublishFailed:
        "We could not unpublish this assistant. Please try again.",
      unpublishedSuccess:
        "Assistant unpublished. The website widget is no longer available to visitors.",

      dangerZone:
        "Danger zone",

      deleteAssistantTitle:
        "Delete assistant",
      deleteAssistantBody:
        "The assistant, its knowledge, conversation history and stored documents will be permanently deleted.",
      deleteAssistantConfirm:
        "I understand that this assistant and all of its data will be permanently deleted.",
      deleteAssistantButton:
        "Delete assistant",
      deleteAssistantFailed:
        "We could not delete this assistant. Please try again.",
      assistantDeletedSuccess:
        "Assistant deleted.",

      deleteAccountTitle:
        "Delete account",
      deleteAccountBody:
        "Your account, all assistants, knowledge, conversations, usage data and stored documents will be permanently deleted.",
      deleteAccountConfirm:
        "I understand that my AQENA account and all related data will be permanently deleted.",
      deleteAccountButton:
        "Delete account",
      deleteAccountFailed:
        "We could not delete your account. Please try again.",
      accountDeletedSuccess:
        "Your AQENA account and related data were deleted.",

      confirmationRequired:
        "Confirm that you understand this deletion cannot be undone.",
      storageCleanupFailed:
        "We could not safely remove the stored documents. Deletion was stopped.",
    },

    shell: {
      homeLabel:
        "AQENA home",
      navigationLabel:
        "Dashboard navigation",
      assistants:
        "Assistants",
      newAssistant:
        "New assistant",
      accountFallback:
        "Account",
      freePlan:
        "Free plan",
      proPlan:
        "Pro plan",
      signOut:
        "Sign out",
      workspace:
        "Workspace",
    },

    home: {
      eyebrow:
        "Workspace",
      title:
        "Your assistants",
      lead:
        "Build assistants from your company knowledge, test their answers and prepare them for customers.",
      createdNotice:
        "Assistant created. Add knowledge next to start testing answers.",
      accountUsageLabel:
        "Account usage",
      assistantsStat:
        "Assistants",
      freePlan:
        "Free plan",
      proPlan:
        "Pro plan",
      messagesThisMonth:
        "Messages this month",
      playgroundAndWebsite:
        "Playground and website chat",
      knowledgeSources:
        "Knowledge sources",
      addDocuments:
        "Add documents after creating an assistant",
      assistantsSection:
        "Assistants",
      emptyTitle:
        "Build your first assistant",
      emptyBody:
        "Give it a name and instructions. Then add the company knowledge it should use for every answer.",
      createAssistant:
        "Create assistant",
      noDescription:
        "No description yet",
      open:
        "Open →",
      statusDraft:
        "Draft",
      statusReady:
        "Ready",
      statusArchived:
        "Archived",
    },
  },

  landing: {
    homeLabel:
      "AQENA home",

    navigation: {
      howItWorks:
        "How it works",
      features:
        "Features",
      pricing:
        "Pricing",
      faq:
        "FAQ",
      demo:
        "See demo",
      dashboard:
        "Dashboard",
      signIn:
        "Sign in",
      openDashboard:
        "Open dashboard",
      buildAssistant:
        "Build your assistant",
    },

    hero: {
      eyebrow:
        "Built on your business knowledge",
      title:
        "Turn company knowledge into reliable customer answers",
      lead:
        "Add your company docs, test real questions and put a helpful assistant on your website in minutes.",
      secondaryCta:
        "See how it works",
      trustAnswers:
        "Answers from your business knowledge",
      trustSources:
        "Sources shown with every answer",
      trustNoCard:
        "No credit card to start",
      productPreviewLabel:
        "AQENA product preview",
      assistantTitle:
        "Northstar Coffee Assistant",
      ready:
        "Ready",
      workspace:
        "Workspace",
      playground:
        "Playground",
      knowledge:
        "Knowledge",
      install:
        "Install",
      testAssistant:
        "Test your assistant",
      sourcesReady:
        "3 sources ready",
      questionDelivery:
        "Do you offer free delivery?",
      answerDelivery:
        "Yes. Northstar Coffee offers free standard shipping on orders of $50 or more within the contiguous United States.",
      deliveryDocument:
        "Delivery Policy.pdf",
      pageTwo:
        "Page 2",
      questionReturn:
        "Can I return opened coffee?",
      input:
        "Ask a question about your company",
      knowledgeReady:
        "Knowledge is ready",
      websiteChat:
        "Website chat",
      quickSetup:
        "Quick website setup",
    },

    problem: {
      kicker:
        "THE PROBLEM",
      title:
        "Company knowledge gets harder to use as you grow",
      body:
        "Important answers end up across documents, folders and old conversations while customers keep asking the same questions.",
      firstTitle:
        "Finding the right answer takes time",
      firstBody:
        "Your team searches through files and conversations before it can answer with confidence.",
      secondTitle:
        "Answers become inconsistent",
      secondBody:
        "Different people give different answers when the right company information is difficult to find.",
      thirdTitle:
        "An assistant should know when to stop",
      thirdBody:
        "If your company knowledge does not contain the answer, AQENA should say so instead of guessing.",
    },

    how: {
      kicker:
        "HOW IT WORKS",
      title:
        "Build a reliable assistant in three simple steps",
      firstTitle:
        "Add your knowledge",
      firstBody:
        "Upload the guides, policies and FAQs your team already relies on.",
      firstFile:
        "Delivery Policy.pdf",
      secondFile:
        "Product FAQ",
      ready:
        "Ready",
      secondTitle:
        "Test real questions",
      secondBody:
        "Ask the questions customers actually send you and review every answer.",
      sampleQuestion:
        "What is your return window?",
      sampleAnswer:
        "Returns are accepted within 30 days",
      thirdTitle:
        "Add it to your website",
      thirdBody:
        "When you are ready, add the assistant to your site with a simple website chat.",
      installReady:
        "Website assistant ready",
      copyCode:
        "Copy code",
    },

    trust: {
      kicker:
        "BUILT FOR TRUST",
      title:
        "Answers you can verify before customers rely on them",
      body:
        "AQENA starts with your company knowledge and keeps the source behind every answer easy to check.",
      firstTitle:
        "Company knowledge first",
      firstBody:
        "Answers come from the guides, policies and FAQs you provide. If the information is missing, AQENA says so.",
      firstProof:
        "Your knowledge",
      secondTitle:
        "Every source stays visible",
      secondBody:
        "See which company document supported an answer and check the information whenever you need to.",
      secondProof:
        "Source included",
      thirdTitle:
        "Test before customers use it",
      thirdBody:
        "Ask real questions first, review the answers and catch gaps in your company knowledge before launch.",
      thirdProof:
        "Review first",
      fourthTitle:
        "Move to your website when ready",
      fourthBody:
        "Once the answers look right, give customers the same helpful experience directly on your website.",
      fourthProof:
        "Website chat",
    },

    preview: {
      kicker:
        "PLAYGROUND",
      title:
        "Review answers before customers see them",
      body:
        "Test customer questions, check the sources and spot missing information before customers see the assistant.",
      firstPoint:
        "Clear feedback while answers are prepared",
      secondPoint:
        "Sources shown with every answer",
      thirdPoint:
        "Clear response when information is missing",
      liveDemo:
        "View live demo",
      assistantLabel:
        "AI support assistant",
      online:
        "Online",
      welcome:
        "Hi — ask me anything about Northstar Coffee products, delivery or returns.",
      question:
        "How quickly do you ship orders?",
      answer:
        "Orders placed before 2 PM ET usually ship the same business day.",
      source:
        "Shipping FAQ",
      input:
        "Ask a question",
    },

    pricing: {
      kicker:
        "PRICING",
      title:
        "Start free, add it to your website when you are ready",
      body:
        "Build and test your first assistant for free. Upgrade when you want website chat and higher limits.",
      freeName:
        "Free",
      freeDescription:
        "For building and testing your first assistant",
      forever:
        "forever",
      startFree:
        "Start with Free",
      freeAssistant:
        "1 assistant",
      freeSources:
        "3 knowledge sources",
      freeMessages:
        "50 messages / month",
      playground:
        "Playground",
      basicCustomization:
        "Basic customization",
      freeLimit:
        "You can embed the widget on your website with the Pro plan.",
      freeUpgradeLink:
        "View Pro →",
      bestForWebsites:
        "LAUNCH OFFER · FIRST 100 USERS",
      proName:
        "Pro",
      proDescription:
        "For assistants ready to support real customers",
      proOldPrice:
        "$29",
      proPrice:
        "$19",
      showSecondaryPrice:
        false,
      proSecondaryLabel:
        "Russia:",
      proSecondaryOldPrice:
        "2,490 RUB",
      proSecondaryPrice:
        "1,490 RUB / month",
      proPriceLock:
        "Promotional price is locked for 12 months from activation with an uninterrupted subscription.",
      perMonth:
        "/ month",
      choosePro:
        "Get Pro",
      proAssistants:
        "Up to 5 assistants",
      proSources:
        "100 knowledge sources",
      proMessages:
        "2,000 messages / month",
      addWebsite:
        "Add to your website",
      customBranding:
        "Custom branding",
      advancedCustomization:
        "Advanced customization",
      proNote:
        "After your request, we will contact you to arrange payment. Pro is activated after payment is confirmed.",
    },

    faq: {
      kicker:
        "FAQ",
      title:
        "Questions before you build",
      body:
        "Start with your company knowledge, test the answers and add the assistant to your website when you are ready.",
      firstQuestion:
        "What can I add as knowledge?",
      firstAnswer:
        "Add PDF, TXT and Markdown files, or paste text directly for quick knowledge entries.",
      secondQuestion:
        "What happens when the answer is not in my company knowledge?",
      secondAnswer:
        "The assistant answers from retrieved company knowledge and says when the available sources do not contain the requested information.",
      thirdQuestion:
        "Can I check where an answer came from?",
      thirdAnswer:
        "Yes. Answers from your knowledge show source references such as the file name and page where available.",
      fourthQuestion:
        "Can I add the assistant to my website?",
      fourthAnswer:
        "Yes. Website chat is included in Pro. Add AQENA to your website with the provided embed code and let customers ask questions directly from your company knowledge.",
      fifthQuestion:
        "Will I be charged during the product demo?",
      fifthAnswer:
        "No. You submit a Pro request in the app. We contact you to arrange payment, and access is activated after payment is confirmed.",
    },

    cta: {
      kicker:
        "GET STARTED",
      title:
        "Give customers answers backed by your actual company knowledge",
    },

    footer: {
      tagline:
        "AQENA by AI24Solutions — AI support grounded in your company knowledge",
    },
  },

  demo: {
    northstar: {
      brand:
        "Northstar Coffee",
      navigationAria:
        "Demo navigation",
      navCoffee:
        "Coffee",
      navWholesale:
        "Wholesale",
      navVisit:
        "Visit",
      navSupport:
        "Support",
      eyebrow:
        "Thoughtfully roasted coffee",
      title:
        "Good coffee for everyday rituals",
      lead:
        "Small-batch coffee, straightforward shipping and support from people who care about the cup. Use the assistant in the lower-right corner if you have a question.",
      backToAQENA:
        "Back to AQENA",
      featureTitle:
        "Coffee worth slowing down for",
      featureBody:
        "Roasted with care and shipped with clear, simple policies.",
    },
  },

  auth: {
    homeLabel:
      "AQENA home",

    common: {
      email:
        "Email",
      password:
        "Password",
      name:
        "Name",
      newPassword:
        "New password",
      confirmNewPassword:
        "Confirm new password",
    },

    password: {
      show:
        "Show password",
      hide:
        "Hide password",
    },

    login: {
      kicker:
        "Your company knowledge",
      heroTitle:
        "Reliable answers start with what your business knows",
      heroBody:
        "Add your documents, test real questions and give customers answers backed by your own knowledge.",
      title:
        "Welcome back",
      subtitle:
        "Sign in to manage your assistants and company knowledge",
      forgotPassword:
        "Forgot password?",
      submit:
        "Sign in",
      newToAQENA:
        "New to AQENA?",
      createAccount:
        "Create an account",
    },

    signUp: {
      kicker:
        "Start with your knowledge",
      heroTitle:
        "Build an assistant your customers can trust",
      heroBody:
        "Your first assistant is free to build and test. No credit card required.",
      title:
        "Create your account",
      subtitle:
        "Set up AQENA and build your first assistant",
      submit:
        "Create account",
      alreadyHaveAccount:
        "Already have an account?",
      signIn:
        "Sign in",
    },

    checkEmail: {
      kicker:
        "Almost ready",
      heroTitle:
        "One quick step before your first assistant",
      title:
        "Check your inbox",
      sentPrefix:
        "We sent a confirmation link",
      to:
        "to",
      sentSuffix:
        "Open the link to finish creating your account.",
      back:
        "Back to sign in",
    },

    forgotPassword: {
      kicker:
        "Account recovery",
      heroTitle:
        "Get back to your assistants and company knowledge",
      heroBody:
        "Enter the email you use for AQENA. We will send you a secure link to choose a new password.",
      title:
        "Reset your password",
      subtitle:
        "Enter your account email and we will send you a reset link",
      submit:
        "Send reset link",
      remembered:
        "Remembered your password?",
      back:
        "Back to sign in",
    },

    resetSent: {
      kicker:
        "Password recovery",
      heroTitle:
        "Check your inbox for the reset link",
      title:
        "Reset link sent",
      accountPrefix:
        "If an AQENA account exists for",
      accountSuffix:
        "you will receive an email with a secure password reset link.",
      back:
        "Back to sign in",
    },

    updatePassword: {
      kicker:
        "Secure your account",
      heroTitle:
        "Choose a new password for AQENA",
      heroBody:
        "Use a password you do not use for other services.",
      title:
        "Set new password",
      subtitle:
        "Your new password must contain at least 8 characters",
      submit:
        "Update password",
    },

    errors: {
      enterEmail:
        "Enter your email address.",
      passwordMin8:
        "Use at least 8 characters for your password.",
      signUpFailed:
        "We could not create your account. Check your details and try again.",
      enterEmailAndPassword:
        "Enter your email and password.",
      signInFailed:
        "We could not sign you in. Check your email and password.",
      resetEmailFailed:
        "We could not send the reset email. Please try again.",
      newPasswordMin8:
        "Use at least 8 characters for your new password.",
      passwordsDoNotMatch:
        "The passwords do not match.",
      resetLinkExpired:
        "Your password reset link has expired. Request a new one.",
      updatePasswordFailed:
        "We could not update your password. Please try again.",
      passwordUpdated:
        "Password updated. Sign in with your new password.",
      invalidAuthLink:
        "This authentication link is invalid or has expired.",
      requestNewResetLink:
        "Request a new password reset link to continue.",
    },
  },
} satisfies Dictionary;
