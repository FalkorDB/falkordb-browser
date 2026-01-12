/* eslint-disable @typescript-eslint/no-explicit-any */
import { Locator } from "@playwright/test";
import {
  interactWhenVisible,
  waitForElementToBeVisible,
  waitForElementToNotBeVisible,
} from "@/e2e/infra/utils";
import GraphPage from "./graphPage";

export default class ChatComponent extends GraphPage {
  // Chat Toggle Button in Header
  private get chatToggleButton(): Locator {
    return this.page.getByTestId("chatToggleButton");
  }

  // Chat Panel
  private get chatPanel(): Locator {
    return this.page.getByTestId("chatPanel");
  }

  private get chatCloseButton(): Locator {
    return this.page.getByTestId("chatCloseButton");
  }

  // Messages
  private get chatMessagesList(): Locator {
    return this.page.getByTestId("chatMessagesList");
  }

  private get chatUserMessages(): Locator {
    return this.page.getByTestId("chatUserMessage");
  }

  private chatAssistantMessage(type: string): Locator {
    return this.page.getByTestId(`chatAssistantMessage-${type}`);
  }

  // Input and Send
  private get chatForm(): Locator {
    return this.page.getByTestId("chatForm");
  }

  private get chatInput(): Locator {
    return this.page.getByTestId("chatInput");
  }

  private get chatSendButton(): Locator {
    return this.page.getByTestId("chatSendButton");
  }

  // Query Actions
  private get chatRunQueryButton(): Locator {
    return this.page.getByTestId("chatRunQueryButton");
  }

  private get chatCopyQueryButton(): Locator {
    return this.page.getByTestId("chatCopyQueryButton");
  }

  // Wait for Interactive Methods
  async waitForChatToggleButton(): Promise<boolean> {
    return waitForElementToBeVisible(this.chatToggleButton);
  }

  async waitForChatPanel(): Promise<boolean> {
    return waitForElementToBeVisible(this.chatPanel);
  }

  async waitForChatPanelNotVisible(): Promise<boolean> {
    return waitForElementToNotBeVisible(this.chatPanel);
  }

  async waitForChatInput(): Promise<boolean> {
    return waitForElementToBeVisible(this.chatInput);
  }

  async waitForChatSendButton(): Promise<boolean> {
    return waitForElementToBeVisible(this.chatSendButton);
  }

  async waitForChatUserMessage(): Promise<boolean> {
    return waitForElementToBeVisible(this.chatUserMessages.first());
  }

  async waitForChatAssistantMessage(type: string): Promise<boolean> {
    return waitForElementToBeVisible(this.chatAssistantMessage(type));
  }

  async waitForChatSendButtonEnabled(): Promise<void> {
    await this.chatSendButton.waitFor({ state: "attached", timeout: 30000 });
    // Wait for the button to be enabled (not disabled)
    // This indicates loading is complete and chat is ready for next message
    await this.page.waitForFunction(
      () => {
        const button = document.querySelector('[data-testid="chatSendButton"]') as HTMLButtonElement;
        return button && !button.disabled;
      },
      { timeout: 30000 }
    );
  }

  // Visibility Methods
  async isChatToggleButtonVisible(): Promise<boolean> {
    return this.chatToggleButton.isVisible();
  }

  async isChatPanelVisible(): Promise<boolean> {
    return this.chatPanel.isVisible();
  }

  async isChatInputVisible(): Promise<boolean> {
    return this.chatInput.isVisible();
  }

  async isChatSendButtonEnabled(): Promise<boolean> {
    return this.chatSendButton.isEnabled();
  }

  async isChatSendButtonDisabled(): Promise<boolean> {
    return this.chatSendButton.isDisabled();
  }

  // Click Methods
  async clickChatToggleButton(): Promise<void> {
    await interactWhenVisible(
      this.chatToggleButton,
      (el) => el.click(),
      "Chat Toggle Button"
    );
  }

  async clickChatCloseButton(): Promise<void> {
    await interactWhenVisible(
      this.chatCloseButton,
      (el) => el.click(),
      "Chat Close Button"
    );
  }

  async clickChatSendButton(): Promise<void> {
    await interactWhenVisible(
      this.chatSendButton,
      (el) => el.click(),
      "Chat Send Button"
    );
  }

  async clickChatRunQueryButton(): Promise<void> {
    await interactWhenVisible(
      this.chatRunQueryButton,
      (el) => el.click(),
      "Chat Run Query Button"
    );
  }

  async clickChatCopyQueryButton(): Promise<void> {
    await interactWhenVisible(
      this.chatCopyQueryButton,
      (el) => el.click(),
      "Chat Copy Query Button"
    );
  }

  // Fill Methods
  async fillChatInput(message: string): Promise<void> {
    await interactWhenVisible(
      this.chatInput,
      (el) => el.fill(message),
      "Chat Input"
    );
  }

  async clearChatInput(): Promise<void> {
    await interactWhenVisible(
      this.chatInput,
      (el) => el.clear(),
      "Chat Input Clear"
    );
  }

  // Get Content Methods
  async getChatInputValue(): Promise<string> {
    return interactWhenVisible(
      this.chatInput,
      (el) => el.inputValue(),
      "Chat Input Value"
    );
  }

  async getChatUserMessagesCount(): Promise<number> {
    return this.chatUserMessages.count();
  }

  async getChatAssistantMessagesCount(type: string): Promise<number> {
    return this.chatAssistantMessage(type).count();
  }

  async getLastUserMessageContent(): Promise<string | null> {
    return interactWhenVisible(
      this.chatUserMessages.last(),
      (el) => el.textContent(),
      "Last User Message"
    );
  }

  async getLastAssistantMessageContent(type: string): Promise<string | null> {
    return interactWhenVisible(
      this.chatAssistantMessage(type).last(),
      (el) => el.textContent(),
      "Last Assistant Message"
    );
  }

  // Combined Actions
  async openChat(): Promise<void> {
    await this.clickChatToggleButton();
    await this.waitForChatPanel();
  }

  async closeChat(): Promise<void> {
    await this.clickChatCloseButton();
    await this.waitForChatPanelNotVisible();
  }

  async toggleChat(): Promise<void> {
    const isVisible = await this.isChatPanelVisible();
    if (isVisible) {
      await this.closeChat();
    } else {
      await this.openChat();
    }
  }

  async sendMessage(message: string): Promise<void> {
    await this.fillChatInput(message);
    await this.clickChatSendButton();
  }

  async waitForAssistantResponse(type: string = "Result"): Promise<void> {
    await this.waitForChatAssistantMessage(type);
  }

  async sendMessageAndWaitForResponse(
    message: string,
    responseType: string = "Result"
  ): Promise<void> {
    await this.sendMessage(message);
    await this.waitForAssistantResponse(responseType);
  }

  async getClipboardContent(): Promise<string> {
    return this.page.evaluate(() => navigator.clipboard.readText());
  }

  async isNodeVisibleInCanvas(nodeName: string): Promise<boolean> {
    // Wait for canvas to render
    await this.waitForTimeout(1000);
    
    // Check if node with the given name exists in the canvas
    // Try to find tooltip or node element containing the name
    const nodeElement = this.page.locator(`[data-tooltip*="${nodeName}"], text="${nodeName}"`).first();
    const visible = await nodeElement.isVisible().catch(() => false);
    return visible;
  }
}
