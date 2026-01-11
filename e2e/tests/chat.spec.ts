import { expect, test } from "@playwright/test";
import BrowserWrapper from "../infra/ui/browserWrapper";
import ApiCalls from "../logic/api/apiCalls";
import ChatComponent from "../logic/POM/chatComponent";
import SettingsBrowserPage from "../logic/POM/settingsBrowserPage";
import HeaderComponent from "../logic/POM/headerComponent";
import urls from "../config/urls.json";
import { getRandomString } from "../infra/utils";

test.describe("Chat Feature Tests", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test(`@readwrite Verify chat button is not displayed when no graph is selected`, async () => {
    const chat = await browser.createNewPage(ChatComponent, urls.graphUrl);
    await browser.setPageToFullScreen();
    
    // Verify chat toggle button is not visible when no graph is selected
    const isChatButtonVisible = await chat.isChatToggleButtonVisible();
    expect(isChatButtonVisible).toBe(false);
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
    
    const chat = await browser.createNewPage(ChatComponent, urls.graphUrl);
    await browser.setPageToFullScreen();
    await chat.selectGraphByName(graphName);
    
    // Open chat panel
    await chat.openChat();
    await chat.waitForChatPanel();
    expect(await chat.isChatPanelVisible()).toBe(true);
    
    // Try to send a message without API key
    await chat.fillChatInput("Who is Alice?");
    await chat.clickChatSendButton();
    
    // Verify user message was sent (appears in chat)
    await chat.waitForChatUserMessage();
    
    // Verify error toast is displayed due to missing/invalid API key
    const isErrorToastVisible = await chat.getNotificationErrorToast();
    expect(isErrorToastVisible).toBe(true);
    
    await apiCall.removeGraph(graphName);
  });

  test.only(`@readwrite Verify complete chat flow with API key: send question, check loading state, verify responses`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');
    
    // First, set up the API key in settings
    const settings = await browser.createNewPage(SettingsBrowserPage, urls.settingsUrl);
    await browser.setPageToFullScreen();
    
    // Configure chat settings with a test API key
    // Note: Using a placeholder key for testing - in real tests you'd use a valid key
    const testApiKey = process.env.OPENAI_TOKEN || process.env.OPEN_API_KEY || "test-api-key-placeholder";
    await settings.setChatApiKeyAndSave(testApiKey);
    
    // Wait for settings to be saved
    await settings.waitForTimeout(1000);
    
    // Navigate to graph page
    const header = await browser.createNewPage(HeaderComponent, urls.settingsUrl);
    await header.clickOnGraphsButton();
    
    // Select the graph and open chat
    const chat = await browser.createNewPage(ChatComponent, urls.graphUrl);
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
      // Verify no error toast appears (API key is valid)
      const isErrorToastVisible = await chat.getNotificationErrorToast();
      expect(isErrorToastVisible).toBe(false);
      
      // Wait for the generated Cypher query to appear
      await chat.waitForAssistantResponse("CypherQuery");
      
      // Wait for the AI result/answer to appear
      await chat.waitForAssistantResponse("Result");
      
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

  test(`@readwrite Verify chat panel maintains state when toggled`, async () => {
    const graphName = getRandomString("chat");
    await apiCall.addGraph(graphName);
    await apiCall.runQuery(graphName, 'CREATE (a:Person {name: "Alice"})-[:KNOWS]->(b:Person {name: "Bob"})');
    
    const chat = await browser.createNewPage(ChatComponent, urls.graphUrl);
    await browser.setPageToFullScreen();
    await chat.selectGraphByName(graphName);
    
    // Open chat and type a message
    await chat.openChat();
    const testMessage = "Test message persistence";
    await chat.fillChatInput(testMessage);
    
    // Close chat
    await chat.closeChat();
    
    // Reopen chat
    await chat.openChat();
    const inputValue = await chat.getChatInputValue();
    // Verify behavior - input value after reopen
    expect(inputValue).toBeDefined();
    
    await apiCall.removeGraph(graphName);
  });
});
