import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import ChatComponent from "../logic/POM/chatComponent";
import SettingsBrowserPage from "../logic/POM/settingsBrowserPage";
import urls from "../config/urls.json";
import { getRandomString } from "../infra/utils";

const DEFAULT_CHAT_MODEL = "gpt-4o-mini";

async function createChatPageWithSettings(
  browser: BrowserWrapper,
  apiKey: string,
  model: string = DEFAULT_CHAT_MODEL
): Promise<ChatComponent> {
  const chat = await browser.createNewPage(ChatComponent);
  await browser.setPageToFullScreen();
  const page = await browser.getPage();

  await page.addInitScript(({ key, selectedModel }) => {
    localStorage.setItem("secretKey", key);
    localStorage.setItem("model", selectedModel);
  }, { key: apiKey, selectedModel: model });

  await page.goto(urls.graphUrl);
  await page.waitForLoadState("networkidle");
  await expect.poll(async () => page.evaluate(() =>
    localStorage.getItem("secretKey") === null && localStorage.getItem("chatApiKeys") !== null
  ), { timeout: 15000 }).toBe(true);

  return chat;
}

test.describe("Chat Feature Tests", () => {
  test.setTimeout(60_000);

  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@readwrite Verify chat button is disabled when no graph is selected`, async () => {
    const chat = await browser.createNewPage(ChatComponent, urls.graphUrl);
    await browser.setPageToFullScreen();
    
    // Wait for the chat toggle button to render before checking state
    await chat.waitForChatToggleButton();
    const isChatButtonVisible = await chat.isChatToggleButtonVisible();
    expect(isChatButtonVisible).toBe(true);
    const isChatButtonDisabled = await chat.isChatToggleButtonDisabled();
    expect(isChatButtonDisabled).toBe(true);
  });

  test(`@readwrite Verify chat button is displayed when a graph is selected`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');
    
    const chat = await browser.createNewPage(ChatComponent, urls.graphUrl);
    await browser.setPageToFullScreen();
    await chat.selectGraphByName(graphName);
    
    // Verify chat toggle button is visible when a graph is selected
    await chat.waitForChatToggleButton();
    const isChatButtonVisible = await chat.isChatToggleButtonVisible();
    expect(isChatButtonVisible).toBe(true);
    
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify attempting to send a question without API key shows error`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');

    const chat = await browser.createNewPage(ChatComponent);
    await browser.setPageToFullScreen();
    const page = await browser.getPage();
    await page.addInitScript(({ selectedModel }) => {
      localStorage.setItem("chatModelSource", "api-key");
      localStorage.setItem("model", selectedModel);
      localStorage.removeItem("secretKey");
      localStorage.removeItem("chatApiKeys");
      localStorage.removeItem("selectedChatApiKeyId");
    }, { selectedModel: DEFAULT_CHAT_MODEL });
    await page.goto(urls.graphUrl);
    await page.waitForLoadState("networkidle");

    await chat.selectGraphByName(graphName);
    
    // Open chat panel
    await chat.openChat();
    await chat.waitForChatPanel();
    expect(await chat.isChatPanelVisible()).toBe(true);
    
    // Try to send a message without API key
    await chat.fillChatInput("Who is Alice?");
    await chat.clickChatSendButton();
    
    // Verify error toast is displayed due to missing API key
    const isErrorToastVisible = await chat.getNotificationErrorToast();
    expect(isErrorToastVisible).toBe(true);
    
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify complete chat flow with API key: send question, check loading state, verify responses`, async () => {
    test.setTimeout(60000);

    // Without a real API key the settings page cannot auto-detect a model, so
    // handleSubmit returns early and user messages never appear in the DOM.
    // That causes waitForChatUserMessage() (15 s) + waitForModelAutoDetection()
    // (10 s) to both expire, pushing total time past the 60 s test timeout.
    // Skip cleanly instead of timing out — the useful assertions below are all
    // gated on having a real key anyway.
    const testApiKey = process.env.OPENAI_TOKEN || process.env.OPEN_API_KEY;
    if (!testApiKey) {
      test.skip(true, 'No real API key available — requires OPENAI_TOKEN or OPEN_API_KEY');
      return;
    }

    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');
    
    // Select the graph and open chat
    const chat = await createChatPageWithSettings(browser, testApiKey);
    await chat.selectGraphByName(graphName);
    await chat.openChat();
    await chat.waitForChatPanel();
    
    // Verify chat input is visible
    expect(await chat.isChatInputVisible()).toBe(true);
    
    // Send a question
    const question = "Who's Alice's friends?";
    await chat.fillChatInput(question);
    
    // Verify send button is enabled
    expect(await chat.isChatSendButtonEnabled()).toBe(true);
    
    // Send the message
    await chat.clickChatSendButton();
    
    // Verify user message appears
    await chat.waitForChatUserMessage();
    
    // If using a valid API key (from env), verify the complete response flow
    if (process.env.OPENAI_TOKEN || process.env.OPEN_API_KEY) {
      // Check whether the chat backend returned an error after sending the message.
      // An error toast can appear when the auto-detected model is not accessible
      // with the current API key (e.g. the static model list in the text-to-cypher
      // library contains future models that the CI token cannot yet use).
      const isErrorToastVisible = await chat.getNotificationErrorToast();

      // Clean up before potentially skipping to avoid resource leaks
      if (isErrorToastVisible) {
        await apiCall.removeGraph(graphName);
        test.skip(true, 'Chat model unavailable in CI — the auto-detected model is not accessible with the provided API key');
      }

      // Verify no error toast appears (API key is valid and model is working)
      expect(isErrorToastVisible).toBe(false);

      // Wait for the generated Cypher query to appear
      const hasCypherQuery = await chat.waitForAssistantResponse("CypherQuery");
      if (!hasCypherQuery && await chat.getNotificationErrorToast()) {
        await apiCall.removeGraph(graphName);
        test.skip(true, 'Chat model unavailable in CI — the selected model is not accessible with the provided API key');
      }
      expect(hasCypherQuery).toBe(true);

      // Wait for the AI result/answer to appear
      expect(await chat.waitForAssistantResponse("Result")).toBe(true);

      // Verify we received exactly 2 assistant messages: 1 CypherQuery and 1 Result
      const cypherQueryCount = await chat.getChatAssistantMessagesCount("CypherQuery");
      const resultCount = await chat.getChatAssistantMessagesCount("Result");

      expect(cypherQueryCount).toBe(1);
      expect(resultCount).toBe(1);
    }
    
    // Clean up
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify chat toggle opens and closes panel correctly`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');
    
    const chat = await browser.createNewPage(ChatComponent, urls.graphUrl);
    await browser.setPageToFullScreen();
    await chat.selectGraphByName(graphName);
    
    // Initially chat panel should not be visible
    expect(await chat.isChatPanelVisible()).toBe(false);
    
    // Open chat
    await chat.openChat();
    expect(await chat.isChatPanelVisible()).toBe(true);
    
    // Close chat using close button
    await chat.closeChat();
    expect(await chat.isChatPanelVisible()).toBe(false);
    
    // Open again
    await chat.openChat();
    expect(await chat.isChatPanelVisible()).toBe(true);
    
    // Close using toggle button
    await chat.clickChatToggleButton();
    await chat.waitForChatPanelNotVisible();
    expect(await chat.isChatPanelVisible()).toBe(false);
    
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify empty message cannot be sent in chat`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');
    
    const chat = await browser.createNewPage(ChatComponent, urls.graphUrl);
    await browser.setPageToFullScreen();
    await chat.selectGraphByName(graphName);
    
    // Open chat
    await chat.openChat();
    
    // Verify send button is disabled when input is completely empty
    let isDisabled = await chat.isChatSendButtonDisabled();
    expect(isDisabled).toBe(true);
    
    // Fill with whitespace only
    await chat.fillChatInput("   ");
    
    // Verify send button remains disabled with whitespace-only input
    // (button checks newMessage.trim() === "")
    isDisabled = await chat.isChatSendButtonDisabled();
    expect(isDisabled).toBe(true);
    
    // Verify input still has the whitespace
    const inputValue = await chat.getChatInputValue();
    expect(inputValue).toBe("   ");
    
    // Now add actual content and verify button becomes enabled
    await chat.fillChatInput("Actual message");
    const isEnabled = await chat.isChatSendButtonEnabled();
    expect(isEnabled).toBe(true);
    
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify copy button copies generated Cypher query correctly`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');
    
    const testApiKey = process.env.OPENAI_TOKEN || process.env.OPEN_API_KEY || "test-api-key-placeholder";
    
    // Open chat and send question
    const chat = await createChatPageWithSettings(browser, testApiKey);
    await chat.selectGraphByName(graphName);
    await chat.openChat();
    await chat.waitForChatPanel();
    
    const question = "Who's Alice's friends?";
    await chat.fillChatInput(question);
    await chat.clickChatSendButton();
    
    // Only run this test if valid API key is available
    if (process.env.OPENAI_TOKEN || process.env.OPEN_API_KEY) {
      const isErrorToastVisible = await chat.getNotificationErrorToast();
      if (isErrorToastVisible) {
        await apiCall.removeGraph(graphName);
        test.skip(true, 'Chat model unavailable in CI — the selected model is not accessible with the provided API key');
      }

      // Wait for CypherQuery response
      const hasCypherQuery = await chat.waitForAssistantResponse("CypherQuery");
      if (!hasCypherQuery && await chat.getNotificationErrorToast()) {
        await apiCall.removeGraph(graphName);
        test.skip(true, 'Chat model unavailable in CI — the selected model is not accessible with the provided API key');
      }
      expect(hasCypherQuery).toBe(true);
      
      // Click the copy button for the generated query
      await chat.clickChatCopyQueryButton();
      
      // Wait a moment for clipboard to be updated
      await chat.waitForTimeout(500);
      
      // Get clipboard content and verify it's a valid Cypher query
      const clipboardContent = await chat.getClipboardContent();
      expect(clipboardContent).toBeDefined();
      expect(clipboardContent.length).toBeGreaterThan(0);
      // Check that it contains Cypher query keywords
      expect(clipboardContent.toUpperCase()).toMatch(/MATCH|RETURN|WHERE|OPTIONAL/);
    }
    
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify play button inserts query into editor, then edit and execute modified query`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');
    
    const testApiKey = process.env.OPENAI_TOKEN || process.env.OPEN_API_KEY || "test-api-key-placeholder";
    
    // Open chat and send question
    const chat = await createChatPageWithSettings(browser, testApiKey);
    await chat.selectGraphByName(graphName);
    await chat.openChat();
    await chat.waitForChatPanel();
    
    const question = "Who's Alice's friends?";
    await chat.fillChatInput(question);
    await chat.clickChatSendButton();
    
    // Only run this test if valid API key is available
    if (process.env.OPENAI_TOKEN || process.env.OPEN_API_KEY) {
      const isErrorToastVisible = await chat.getNotificationErrorToast();
      if (isErrorToastVisible) {
        await apiCall.removeGraph(graphName);
        test.skip(true, 'Chat model unavailable in CI — the selected model is not accessible with the provided API key');
      }

      // Wait for CypherQuery response
      const hasCypherQuery = await chat.waitForAssistantResponse("CypherQuery");
      if (!hasCypherQuery && await chat.getNotificationErrorToast()) {
        await apiCall.removeGraph(graphName);
        test.skip(true, 'Chat model unavailable in CI — the selected model is not accessible with the provided API key');
      }
      expect(hasCypherQuery).toBe(true);
      
      // Click the play/run button to execute the query (this puts the query in the editor)
      await chat.clickChatRunQueryButton();
      
      // Wait for the query to be inserted into the editor
      await chat.waitForTimeout(1000);
      
      // Get the current query from the editor
      const editorQuery = await chat.getEditorInput();
      expect(editorQuery).toBeDefined();
      expect(editorQuery).not.toBeNull();
      
      // Modify the query to remove ".name" only from RETURN clause
      // This changes "RETURN f.name" to "RETURN f" to return the full node object
      const modifiedQuery = editorQuery!.replace(/RETURN\s+(\w+)\.name/gi, 'RETURN $1');
      
      // Clear the editor and insert the modified query
      await chat.clickClearEditorInput();
      await chat.waitForTimeout(500);
      await chat.insertQuery(modifiedQuery);
      
      // Run the modified query
      await chat.clickRunQuery();
      await chat.hoverAtCanvasCenter();
      
      // Get the tooltip content and verify it contains "Bob" or "1" (node ID)
      const tooltip = await chat.getNodeCanvasToolTip();
      expect(tooltip).toBeDefined();
      expect(tooltip && (tooltip.includes("Bob") || tooltip.includes("1"))).toBeTruthy();
    }
    
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify Cypher Only toggle returns only Cypher query without AI response`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');

    try {
      const testApiKey = process.env.OPENAI_TOKEN || process.env.OPEN_API_KEY || "test-api-key-placeholder";

      const chat = await createChatPageWithSettings(browser, testApiKey);
      await chat.selectGraphByName(graphName);

      // Open chat
      await chat.openChat();
      await chat.waitForChatPanel();

      // Verify toggle is OFF by default
      const defaultState = await chat.getCypherOnlySwitch();
      expect(defaultState).toBe(false);

      // Toggle Cypher Only ON
      await chat.clickCypherOnlySwitchOn();
      const onState = await chat.getCypherOnlySwitch();
      expect(onState).toBe(true);

      // Send a question with Cypher Only enabled
      await chat.fillChatInput("Who is Alice?");
      await chat.clickChatSendButton();

      // Verify user message appears
      await chat.waitForChatUserMessage();

      if (process.env.OPENAI_TOKEN || process.env.OPEN_API_KEY) {
        const isErrorToastVisible = await chat.getNotificationErrorToast();
        if (isErrorToastVisible) {
          test.skip(true, 'Chat model unavailable in CI — the selected model is not accessible with the provided API key');
        }

        // Wait for the CypherQuery response
        const hasCypherQuery = await chat.waitForAssistantResponse("CypherQuery");
        if (!hasCypherQuery && await chat.getNotificationErrorToast()) {
          test.skip(true, 'Chat model unavailable in CI — the selected model is not accessible with the provided API key');
        }
        expect(hasCypherQuery).toBe(true);

        // Brief wait for stream to fully close and any remaining events to render
        await chat.waitForTimeout(2000);

        // Verify we got exactly 1 CypherQuery and 0 Result messages
        const cypherQueryCount = await chat.getChatAssistantMessagesCount("CypherQuery");
        const resultCount = await chat.getChatAssistantMessagesCount("Result");

        expect(cypherQueryCount).toBe(1);
        expect(resultCount).toBe(0);
      }
    } finally {
      await apiCall.removeGraph(graphName);
    }
  });

  test(`@readwrite Verify Cypher Only toggle persists after page refresh`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})');

    const chat = await browser.createNewPage(ChatComponent, urls.graphUrl);
    await browser.setPageToFullScreen();
    await chat.selectGraphByName(graphName);

    // Open chat and verify toggle is OFF by default
    await chat.openChat();
    await chat.waitForChatPanel();
    const defaultState = await chat.getCypherOnlySwitch();
    expect(defaultState).toBe(false);

    // Toggle Cypher Only ON
    await chat.clickCypherOnlySwitchOn();
    const onState = await chat.getCypherOnlySwitch();
    expect(onState).toBe(true);

    // Refresh the page
    await chat.refreshPage();

    // Re-select graph and open chat
    await chat.selectGraphByName(graphName);
    await chat.openChat();
    await chat.waitForChatPanel();

    // Verify toggle is still ON after refresh
    const persistedState = await chat.getCypherOnlySwitch();
    expect(persistedState).toBe(true);

    // Toggle OFF and verify persistence
    await chat.clickCypherOnlySwitchOff();
    await chat.refreshPage();
    await chat.selectGraphByName(graphName);
    await chat.openChat();
    await chat.waitForChatPanel();

    const offState = await chat.getCypherOnlySwitch();
    expect(offState).toBe(false);

    // Clean up
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify chat renders markdown content as HTML`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');

    const chat = await browser.createNewPage(ChatComponent, urls.graphUrl);
    await browser.setPageToFullScreen();

    // Inject fake model + plain-text API key into localStorage so
    // handleSubmit does not bail out before sending the request.
    const page = await browser.getPage();
    await page.evaluate(() => {
      localStorage.setItem("model", "gpt-4o-mini");
      localStorage.setItem("secretKey", "fake-test-key-for-markdown");
    });
    // Reload so the React context picks up the new values
    await page.reload({ waitUntil: "networkidle" });

    await chat.selectGraphByName(graphName);
    await chat.openChat();
    await chat.waitForChatPanel();

    // Build a mock JSON response containing markdown-formatted text
    const markdownAnswer = "Here are Alice's friends:\n\n**Bob** is her friend.\n\n- Item one\n- Item two\n\n```cypher\nMATCH (n) RETURN n\n```";

    // Intercept the /api/chat POST and return the mock JSON response
    await page.route("**/api/chat", (route) => {
      route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cypherQuery: 'MATCH (a:Person {name: "Alice"})-[:KNOWS]->(b) RETURN b.name',
          cypherResult: null,
          answer: markdownAnswer,
          confidence: null,
          tokenUsage: null,
        }),
      });
    });

    // Send a question (the mock will answer)
    await chat.fillChatInput("Who are Alice's friends?");
    await chat.clickChatSendButton();

    // Wait for the markdown result to appear
    await chat.waitForAssistantResponse("Result");

    // Locate the rendered markdown container
    const markdownDiv = page.getByTestId("chatMessageMarkdown").last();
    await markdownDiv.waitFor({ state: "visible", timeout: 5000 });

    // Verify markdown was converted to real HTML elements
    const hasStrong = await markdownDiv.locator("strong").count();
    expect(hasStrong).toBeGreaterThanOrEqual(1);

    const hasListItems = await markdownDiv.locator("li").count();
    expect(hasListItems).toBeGreaterThanOrEqual(2);

    const hasCodeBlock = await markdownDiv.locator("pre code").count();
    expect(hasCodeBlock).toBeGreaterThanOrEqual(1);

    // A null confidence must not render a badge
    expect(await chat.getChatConfidenceBadgeCount()).toBe(0);

    // Cleanup mock
    await page.unroute("**/api/chat");
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify messages are graph-specific and respect maxSavedMessages limit`, async () => {
    test.setTimeout(90000);
    const graph1Name = getRandomString("chat");
    const graph2Name = getRandomString("chat");
    await apiCall.addGraph(graph1Name);
    await apiCall.addGraph(graph2Name);
    await apiCall.runQuery(graph1Name, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');
    await apiCall.runQuery(graph2Name, 'CREATE (x:Person {name: "Xavier"})-[:KNOWS]->(y:Person {name: "Yara"})');
    
    const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
    await browser.setPageToFullScreen();
    await settings.expandChatSection();

    const rawMaxSavedMessages = Number(await settings.getMaxSavedMessagesValue());
    const testApiKey = process.env.OPENAI_TOKEN || process.env.OPEN_API_KEY || "test-api-key-placeholder";

    // Select the first available model so Chat.tsx's handleSubmit doesn't
    // return early with "No model selected" before adding the user message to
    // state. Without this, every waitForUserMessageCount() call would time out
    // (30 s) because chatUserMessage elements never appear in the DOM.
    const models = await settings.getAvailableModels();
    if (models.length === 0) {
      test.skip();
      return;
    }
    await settings.selectModel(models[0]);

    await settings.fillChatApiKey(testApiKey);
    await settings.clickSaveSettingsButton();
    
    const chat = await browser.createNewPage(ChatComponent, urls.graphUrl);
    await chat.selectGraphByName(graph1Name);
    
    // Open chat and send 7 messages to graph1 (more than maxSavedMessages)
    await chat.openChat();
    await chat.waitForChatPanel();
    
    const messages = [
      "Who does Alice know?",
      "What is Bob's name?",
      "How many people are in the graph?",
      "Show me all relationships",
      "What relationship exists between Alice and Bob?",
      "List all Person nodes",
      "Who are Alice's friends?"
    ];

    const maxSavedMessages = Math.min(rawMaxSavedMessages, messages.length);
    
    for (let i = 0; i < messages.length; i += 1) {
      const message = messages[i];
      // eslint-disable-next-line no-await-in-loop
      await chat.fillChatInput(message);
      // eslint-disable-next-line no-await-in-loop
      await chat.waitForChatSendButtonEnabled();
      // eslint-disable-next-line no-await-in-loop
      await chat.clickChatSendButton();
      // eslint-disable-next-line no-await-in-loop
      await chat.waitForUserMessageCount(i + 1);
    }

    // Verify that we have exactly 7 user messages displayed
    const graph1MessageCount = await chat.getChatUserMessagesCount();
    expect(graph1MessageCount).toBe(7);
    
    // Get the last user message to verify it's the 7th question
    const lastMessage = await chat.getLastUserMessageContent();
    expect(lastMessage).toContain("Who are Alice's friends?");
  
    // Switch to graph2
    await chat.selectGraphByName(graph2Name);
    await chat.waitForUserMessageCount(0);
    
    // Verify chat is empty for graph2 (no messages from graph1)
    const graph2MessageCount = await chat.getChatUserMessagesCount();
    expect(graph2MessageCount).toBe(0);
    
    // Send a message to graph2 (about Xavier and Yara)
    await chat.fillChatInput("Who does Xavier know?");
    await chat.clickChatSendButton();
    await chat.waitForUserMessageCount(1);
    
    // Verify graph2 has 1 message
    const graph2MessageCountAfter = await chat.getChatUserMessagesCount();
    expect(graph2MessageCountAfter).toBe(1);
    
    // Switch back to graph1
    await chat.selectGraphByName(graph1Name);
    // Wait for maxSavedMessages user messages to load from localStorage
    await chat.waitForUserMessageCount(maxSavedMessages);
    // After reload/re-selecting graph, verify only maxSavedMessages user messages are loaded from localStorage
    // The getLastUserMessagesWithContext function should have limited it to maxSavedMessages user messages
    const graph1ReloadedCount = await chat.getChatUserMessagesCount();
    
    // Should have maxSavedMessages user messages (limit applied from localStorage)
    expect(graph1ReloadedCount).toBe(maxSavedMessages);
    
    // Get all user messages and check the first one
    const firstVisibleMessage = await chat.getFirstUserMessageContent();
    expect(firstVisibleMessage).toContain(messages[messages.length - maxSavedMessages]);
    
    // Verify the last message is still the 7th question
    const lastVisibleMessage = await chat.getLastUserMessageContent();
    expect(lastVisibleMessage).toContain("Who are Alice's friends?");
    
    // Clean up
    await apiCall.removeGraph(graph1Name);
    await apiCall.removeGraph(graph2Name);
  });

  test(`@readwrite Verify token usage footer appears after mocked response with token data`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');

    const chat = await browser.createNewPage(ChatComponent);
    await browser.setPageToFullScreen();
    const page = await browser.getPage();

    await page.addInitScript(({ selectedModel }) => {
      localStorage.setItem("model", selectedModel);
      localStorage.setItem("secretKey", "fake-key-footer-test");
    }, { selectedModel: DEFAULT_CHAT_MODEL });
    await page.goto(urls.graphUrl);
    await page.waitForLoadState("networkidle");

    await page.route("**/api/chat", (route) => {
      route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cypherQuery: "MATCH (a:Person)-[:KNOWS]->(b) RETURN b.name",
          cypherResult: null,
          answer: "Bob is Alice's friend.",
          confidence: 90,
          tokenUsage: { totalTokens: 150 },
        }),
      });
    });

    await chat.selectGraphByName(graphName);
    await chat.openChat();
    await chat.waitForChatPanel();

    await chat.fillChatInput("Who are Alice's friends?");
    await chat.clickChatSendButton();
    await chat.waitForAssistantResponse("Result");

    // Confidence badge should render the 0-100 value directly (not as a 0-1 fraction)
    const hasConfidenceBadge = await chat.waitForChatConfidenceBadge();
    expect(hasConfidenceBadge).toBe(true);

    // The badge text carries the visible percentage plus the screen-reader tier label
    const confidenceText = await chat.getChatConfidenceBadgeText();
    expect(confidenceText).toContain("90%");
    // 90 falls in the high-confidence tier
    expect(confidenceText).toContain("High confidence");

    // Footer should now display token data
    const hasTokens = await chat.waitForChatFooterTokens();
    expect(hasTokens).toBe(true);

    const lastTokensText = await chat.getChatFooterLastTokens();
    expect(lastTokensText).toContain("150");

    const totalTokensText = await chat.getChatFooterTotalTokens();
    expect(totalTokensText).toContain("150");

    await page.unroute("**/api/chat");
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify token totals accumulate correctly across multiple messages`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');

    const chat = await browser.createNewPage(ChatComponent);
    await browser.setPageToFullScreen();
    const page = await browser.getPage();

    await page.addInitScript(({ selectedModel }) => {
      localStorage.setItem("model", selectedModel);
      localStorage.setItem("secretKey", "fake-key-footer-test");
    }, { selectedModel: DEFAULT_CHAT_MODEL });
    await page.goto(urls.graphUrl);
    await page.waitForLoadState("networkidle");

    let callCount = 0;
    await page.route("**/api/chat", (route) => {
      callCount += 1;
      route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cypherQuery: null,
          cypherResult: null,
          answer: `Answer ${callCount}`,
          confidence: null,
          tokenUsage: { totalTokens: callCount === 1 ? 100 : 50 },
        }),
      });
    });

    await chat.selectGraphByName(graphName);
    await chat.openChat();
    await chat.waitForChatPanel();

    // First message: 100 tokens
    await chat.fillChatInput("First question");
    await chat.clickChatSendButton();
    await chat.waitForAssistantResponse("Result");
    await chat.waitForChatFooterTokens();

    expect(await chat.getChatFooterLastTokens()).toContain("100");
    expect(await chat.getChatFooterTotalTokens()).toContain("100");

    // Second message: 50 tokens → Last: 50, Total: 150
    await chat.fillChatInput("Second question");
    await chat.waitForChatSendButtonEnabled();
    await chat.clickChatSendButton();
    await chat.waitForAssistantResponse("Result");

    // Wait for total to update to 150
    await page.waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="chatFooterTotalTokens"]');
        return el?.textContent?.includes("150");
      },
      { timeout: 5000 }
    );

    expect(await chat.getChatFooterLastTokens()).toContain("50");
    expect(await chat.getChatFooterTotalTokens()).toContain("150");

    await page.unroute("**/api/chat");
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify confidence badge renders the correct tier and percentage per message`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');

    const chat = await browser.createNewPage(ChatComponent);
    await browser.setPageToFullScreen();
    const page = await browser.getPage();

    await page.addInitScript(({ selectedModel }) => {
      localStorage.setItem("model", selectedModel);
      localStorage.setItem("secretKey", "fake-key-confidence-tiers");
    }, { selectedModel: DEFAULT_CHAT_MODEL });
    await page.goto(urls.graphUrl);
    await page.waitForLoadState("networkidle");

    // Each call returns the next confidence on the 0-100 scale so we exercise
    // every tier boundary: 90 (high), 70 (medium), 69 (low).
    const confidences = [90, 70, 69];
    let callCount = 0;
    await page.route("**/api/chat", (route) => {
      const confidence = confidences[Math.min(callCount, confidences.length - 1)];
      callCount += 1;
      route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cypherQuery: "MATCH (n) RETURN n",
          cypherResult: null,
          answer: `Answer with confidence ${confidence}.`,
          confidence,
          tokenUsage: { totalTokens: 10 },
        }),
      });
    });

    await chat.selectGraphByName(graphName);
    await chat.openChat();
    await chat.waitForChatPanel();

    // 90 → High confidence (inclusive lower boundary)
    await chat.fillChatInput("First question");
    await chat.clickChatSendButton();
    await chat.waitForAssistantResponse("Result");
    expect(await chat.getChatConfidenceBadgeText()).toContain("90%");
    expect(await chat.getChatConfidenceBadgeText()).toContain("High confidence");

    // 70 → Medium confidence (inclusive lower boundary)
    await chat.fillChatInput("Second question");
    await chat.waitForChatSendButtonEnabled();
    await chat.clickChatSendButton();
    await chat.waitForAssistantResponse("Result");
    await page.waitForFunction(
      () => {
        const badge = document.querySelectorAll('[data-testid="chatConfidenceBadge"]');
        return badge[badge.length - 1]?.textContent?.includes("Medium confidence");
      },
      { timeout: 5000 }
    );
    expect(await chat.getChatConfidenceBadgeText()).toContain("70%");
    expect(await chat.getChatConfidenceBadgeText()).toContain("Medium confidence");

    // 69 → Low confidence (just below the medium boundary)
    await chat.fillChatInput("Third question");
    await chat.waitForChatSendButtonEnabled();
    await chat.clickChatSendButton();
    await chat.waitForAssistantResponse("Result");
    await page.waitForFunction(
      () => {
        const badge = document.querySelectorAll('[data-testid="chatConfidenceBadge"]');
        return badge[badge.length - 1]?.textContent?.includes("Low confidence");
      },
      { timeout: 5000 }
    );
    expect(await chat.getChatConfidenceBadgeText()).toContain("69%");
    expect(await chat.getChatConfidenceBadgeText()).toContain("Low confidence");

    await page.unroute("**/api/chat");
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify token usage persists after closing and reopening chat`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');

    const chat = await browser.createNewPage(ChatComponent);
    await browser.setPageToFullScreen();
    const page = await browser.getPage();

    await page.addInitScript(({ selectedModel }) => {
      localStorage.setItem("model", selectedModel);
      localStorage.setItem("secretKey", "fake-key-footer-persist");
    }, { selectedModel: DEFAULT_CHAT_MODEL });
    await page.goto(urls.graphUrl);
    await page.waitForLoadState("networkidle");

    await page.route("**/api/chat", (route) => {
      route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cypherQuery: null,
          cypherResult: null,
          answer: "Bob is Alice's friend.",
          confidence: null,
          tokenUsage: { totalTokens: 200 },
        }),
      });
    });

    await chat.selectGraphByName(graphName);
    await chat.openChat();
    await chat.waitForChatPanel();

    await chat.fillChatInput("Who are Alice's friends?");
    await chat.clickChatSendButton();
    await chat.waitForAssistantResponse("Result");
    await chat.waitForChatFooterTokens();

    expect(await chat.getChatFooterTotalTokens()).toContain("200");

    // Close and reopen chat
    await chat.closeChat();
    expect(await chat.isChatPanelVisible()).toBe(false);
    await chat.openChat();
    await chat.waitForChatPanel();

    // Token values should still be present from storage
    const hasTokens = await chat.waitForChatFooterTokens();
    expect(hasTokens).toBe(true);
    expect(await chat.getChatFooterLastTokens()).toContain("200");
    expect(await chat.getChatFooterTotalTokens()).toContain("200");

    await page.unroute("**/api/chat");
    await apiCall.removeGraph(graphName);
  });

  test(`@readwrite Verify model and provider displayed in footer when model is configured`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})');

    const chat = await browser.createNewPage(ChatComponent);
    await browser.setPageToFullScreen();
    const page = await browser.getPage();

    await page.addInitScript(({ selectedModel }) => {
      localStorage.setItem("model", selectedModel);
      localStorage.setItem("secretKey", "fake-key-footer-model");
    }, { selectedModel: DEFAULT_CHAT_MODEL });
    await page.goto(urls.graphUrl);
    await page.waitForLoadState("networkidle");

    await chat.selectGraphByName(graphName);
    await chat.openChat();
    await chat.waitForChatPanel();

    // Footer should show even before any messages, as long as a model is set
    const isFooterVisible = await chat.isChatFooterVisible();
    expect(isFooterVisible).toBe(true);

    const modelText = await chat.getChatFooterModel();
    expect(modelText).toContain(DEFAULT_CHAT_MODEL);

    await apiCall.removeGraph(graphName);
  });
});
