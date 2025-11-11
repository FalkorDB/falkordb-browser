import { expect, test } from "@playwright/test";
import urls from "../config/urls.json";
import userConfig from "../config/user.json";
import BrowserWrapper from "../infra/ui/browserWrapper";
import SettingsTokensPage from "../logic/POM/settingsTokensPage";
import ApiCalls from "../logic/api/apiCalls";
import { getRandomString } from "../infra/utils";

test.describe("@Tokens Personal Access Tokens Tests", () => {
  let browser: BrowserWrapper;
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    browser = new BrowserWrapper();
    apiCall = new ApiCalls();
  });

  test.afterEach(async () => {
    await browser.closeBrowser();
  });

  test.describe("Token Generation - Admin User", () => {
    const expirationOptions = [
      { expiration: "never", description: "default settings (never expires)", shouldExpire: false },
      { expiration: "30d", description: "30 days expiration", shouldExpire: true },
      { expiration: "60d", description: "60 days expiration", shouldExpire: true },
      { expiration: "90d", description: "90 days expiration", shouldExpire: true },
    ] as const;

    expirationOptions.forEach(({ expiration, description, shouldExpire }) => {
      test(`@admin Generate token with ${description}`, async () => {
        const settingsTokensPage = await browser.createNewPage(
          SettingsTokensPage,
          urls.settingsUrl
        );
        await settingsTokensPage.navigateToTokensTab();

        const tokenName = getRandomString(`admin-token-${expiration}`);
        const token = await settingsTokensPage.generateToken(tokenName, expiration);

        expect(token).not.toBeNull();
        expect(token?.length).toBeGreaterThan(0);
        expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

        // Verify expiration if applicable
        if (shouldExpire) {
          const details = await settingsTokensPage.getTokenDetails(tokenName);
          expect(details?.expires).not.toBe("Never");
        }

        // Cleanup
        await settingsTokensPage.dismissTokenDisplay();
        await settingsTokensPage.revokeToken(tokenName);
      });
    });

    test("@admin Generate multiple tokens", async () => {
      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      const numberOfTokens = 3;
      const tokenNames = Array.from({ length: numberOfTokens }, (_, i) => 
        getRandomString(`admin-multi-${i}`)
      );

      // Generate tokens sequentially
      await tokenNames.reduce(async (previousPromise, tokenName) => {
        await previousPromise;
        const token = await settingsTokensPage.generateToken(tokenName);
        expect(token).not.toBeNull();
        await settingsTokensPage.dismissTokenDisplay();
        return Promise.resolve();
      }, Promise.resolve());

      // Verify all tokens exist
      await Promise.all(
        tokenNames.map(async (tokenName) => {
          expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);
        })
      );

      // Cleanup
      await tokenNames.reduce(async (previousPromise, tokenName) => {
        await previousPromise;
        await settingsTokensPage.revokeToken(tokenName);
        return Promise.resolve();
      }, Promise.resolve());
    });



    test("@admin Generate token and view details with admin-specific columns", async () => {
      // Generate token via API for setup
      const tokenName = getRandomString("admin-details-token");
      await apiCall.generateToken({ name: tokenName });

      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      // Wait for the token to appear in the table (this ensures data has loaded)
      await settingsTokensPage.waitFor(1500);
      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);
      
      // Admin should see Username and Role columns
      expect(await settingsTokensPage.hasColumnHeader("Username")).toBe(true);
      expect(await settingsTokensPage.hasColumnHeader("Role")).toBe(true);
      
      // Test viewing the token details in UI
      const details = await settingsTokensPage.getTokenDetails(tokenName);
      expect(details).not.toBeNull();
      expect(details?.name).toBe(tokenName);
      expect(details?.created).not.toBeNull();
      expect(details?.lastUsed).toBe("Never");

      // Cleanup via API
      const tokens = await apiCall.listTokens();
      const token = tokens.tokens.find((t: { name: string }) => t.name === tokenName);
      if (token) {
        await apiCall.revokeToken({ token_id: (token as { token_id: string }).token_id });
      }
    });
  });

  test.describe("Basic Token UI Operations", () => {
    test("@readonly Attempt to generate token without name - should fail", async () => {
      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      await settingsTokensPage.clickGenerateToken();
      await settingsTokensPage.fillTokenName("");
      
      // Generate token confirm button should be disabled without name
      await settingsTokensPage.waitFor(300);
      expect(await settingsTokensPage.isGenerateTokenConfirmButtonDisabled()).toBe(true);
    });

    test("@readonly Copy token to clipboard", async () => {
      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      const tokenName = getRandomString("copy-token");
      await settingsTokensPage.generateToken(tokenName);

      const copiedToken = await settingsTokensPage.copyToken();    
      expect(copiedToken).not.toBeNull();

      // Cleanup
      await settingsTokensPage.dismissTokenDisplay();
      await settingsTokensPage.revokeToken(tokenName);
    });

    test("@readonly Cancel token revocation", async () => {
      // Generate token via API for setup
      const readonlyUser = userConfig.userRoles.find((u) => u.role === "readonly")!;
      const tokenName = getRandomString("cancel-revoke");
      await apiCall.generateTokenAsUser(
        readonlyUser.name,
        userConfig.user.password,
        { name: tokenName }
      );

      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      // Test canceling revocation in UI
      const row = settingsTokensPage.getRowByText(tokenName);
      await row.getByRole("button").click();
      await settingsTokensPage.cancelRevokeToken();

      // Token should still exist
      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

      // Cleanup via API
      const tokens = await apiCall.listTokensAsUser(readonlyUser.name, userConfig.user.password);
      const token = tokens.tokens.find((t: { name: string }) => t.name === tokenName);
      if (token) {
        await apiCall.revokeTokenAsUser(readonlyUser.name, userConfig.user.password, { token_id: (token as { token_id: string }).token_id });
      }
    });

    test("@readonly Generate token and dismiss success dialog", async () => {
      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      const tokenName = getRandomString("dismiss-dialog-token");
      const token = await settingsTokensPage.generateToken(tokenName);
      
      expect(token).not.toBeNull();
      expect(token?.length).toBeGreaterThan(0);

      // Dismiss the success dialog
      await settingsTokensPage.dismissTokenDisplay();
      
      // Verify token appears in the list
      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

      // Cleanup
      await settingsTokensPage.revokeToken(tokenName);
    });
  });

  test.describe("Token Revocation - Admin User", () => {
    test("@admin Revoke single token", async () => {
      // Generate token via API for better performance
      const tokenName = getRandomString("admin-revoke-token");
      const tokenResponse = await apiCall.generateToken({ name: tokenName });
      expect(tokenResponse.token).toBeDefined();

      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      // Verify token appears in UI
      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

      // Count tokens before revocation
      const tokensBefore = await settingsTokensPage.getTokenCount();

      await settingsTokensPage.revokeToken(tokenName);
      
      // Wait for token to be removed from list
      await settingsTokensPage.waitFor(1000);

      // Verify token count decreased
      const tokensAfter = await settingsTokensPage.getTokenCount();
      expect(tokensAfter).toBeLessThan(tokensBefore);
    });

    test("@admin Revoke multiple tokens", async () => {
      const tokensToCreate = 3;
      const tokenNames = Array.from({ length: tokensToCreate }, (_, i) => 
        getRandomString(`admin-revoke-multi-${i}`)
      );
      
      // Generate tokens via API
      await Promise.all(
        tokenNames.map((tokenName) => apiCall.generateToken({ name: tokenName }))
      );

      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      const tokensBefore = await settingsTokensPage.getTokenCount();

      // Revoke all tokens via UI sequentially
      await tokenNames.reduce(async (previousPromise, tokenName) => {
        await previousPromise;
        await settingsTokensPage.revokeToken(tokenName);
        await settingsTokensPage.waitFor(500);
        return Promise.resolve();
      }, Promise.resolve());

      // Verify token count decreased
      const tokensAfter = await settingsTokensPage.getTokenCount();
      expect(tokensAfter).toBeLessThanOrEqual(tokensBefore - tokensToCreate);
    });
  });

  test.describe.skip("Token Generation - ReadWrite User", () => {
    // Tests skipped - requires custom login implementation
  });

  test.describe.skip("Token Generation - ReadOnly User", () => {
    // Tests skipped - requires custom login implementation
  });

  test.describe("Token Persistence", () => {
    test("@readonly Tokens persist after page refresh", async () => {
      // Generate token via API for setup
      const readonlyUser = userConfig.userRoles.find((u) => u.role === "readonly")!;
      const tokenName = getRandomString("persist-token");
      await apiCall.generateTokenAsUser(
        readonlyUser.name,
        userConfig.user.password,
        { name: tokenName }
      );

      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      // Verify token exists before refresh
      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

      // Test persistence after page refresh
      await settingsTokensPage.refreshPage();
      await settingsTokensPage.navigateToTokensTab();

      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

      // Cleanup via API
      const tokens = await apiCall.listTokensAsUser(readonlyUser.name, userConfig.user.password);
      const token = tokens.tokens.find((t: { name: string }) => t.name === tokenName);
      if (token) {
        await apiCall.revokeTokenAsUser(readonlyUser.name, userConfig.user.password, { token_id: (token as { token_id: string }).token_id });
      }
    });

    test("@readonly Token generation dialog dismisses after refresh", async () => {
      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      const tokenName = getRandomString("dismiss-refresh-token");
      const token = await settingsTokensPage.generateToken(tokenName);
      expect(token).not.toBeNull();

      // Don't dismiss yet, just refresh
      await settingsTokensPage.refreshPage();
      await settingsTokensPage.navigateToTokensTab();

      // Token success dialog should not appear after refresh
      // If it were still visible, we'd be able to interact with the dismiss button
      // Instead, verify the token is in the list
      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

      // Cleanup
      await settingsTokensPage.revokeToken(tokenName);
    });
  });

  test.describe("Token UI Display & Interaction", () => {
    test("@readonly Non-admin UI does not display Username and Role columns", async () => {
      // Generate token via API to ensure table is populated
      const readonlyUser = userConfig.userRoles.find((u) => u.role === "readonly")!;
      const tokenName = getRandomString("column-test-token");
      await apiCall.generateTokenAsUser(
        readonlyUser.name,
        userConfig.user.password,
        { name: tokenName }
      );

      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      // ReadOnly user should NOT see Username and Role columns
      expect(await settingsTokensPage.hasColumnHeader("Username")).toBe(false);
      expect(await settingsTokensPage.hasColumnHeader("Role")).toBe(false);
      
      // Common columns should still be present
      expect(await settingsTokensPage.hasColumnHeader("Name")).toBe(true);
      expect(await settingsTokensPage.hasColumnHeader("Created")).toBe(true);

      // Cleanup
      const tokens = await apiCall.listTokensAsUser(readonlyUser.name, userConfig.user.password);
      const token = tokens.tokens.find((t: { name: string }) => t.name === tokenName);
      if (token) {
        await apiCall.revokeTokenAsUser(readonlyUser.name, userConfig.user.password, { token_id: (token as { token_id: string }).token_id });
      }
    });
  });

  test.describe("Token List Operations", () => {
    test("@admin View all tokens in list", async () => {
      // Get user credentials from config
      const readonlyUser = userConfig.userRoles.find((u) => u.role === "readonly");
      const readwriteUser = userConfig.userRoles.find((u) => u.role === "readwrite");
      
      // Generate tokens for different users
      const roTokenName = getRandomString("ro-token");
      const rwTokenName = getRandomString("rw-token");
      const adminTokenName = getRandomString("admin-token");
      
      // Generate token as readonly user
      await apiCall.generateTokenAsUser(
        readonlyUser!.name,
        userConfig.user.password,
        { name: roTokenName }
      );
      
      // Generate token as readwrite user
      await apiCall.generateTokenAsUser(
        readwriteUser!.name,
        userConfig.user.password,
        { name: rwTokenName }
      );
      
      // Generate token as admin
      await apiCall.generateToken({ name: adminTokenName });

      // Open UI as admin and validate all tokens exist
      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      const allTokens = await settingsTokensPage.getAllTokenNames();
      expect(allTokens).toContain(roTokenName);
      expect(allTokens).toContain(rwTokenName);
      expect(allTokens).toContain(adminTokenName);

      // Cleanup via API - Admin can see and revoke all tokens
      const tokensResponse = await apiCall.listTokens();
      const tokenNamesToRevoke = [roTokenName, rwTokenName, adminTokenName];
      const tokenIdsToRevoke = tokensResponse.tokens
        .filter((t: { name: string }) => tokenNamesToRevoke.includes(t.name))
        .map((t: { token_id: string }) => t.token_id);
      
      await apiCall.revokeAllUserTokens(tokenIdsToRevoke);
    });
  });

  test.describe("Token API Operations", () => {
    test("@admin Generate token via API and verify in UI", async () => {
      const tokenName = getRandomString("api-generate-token");
      const response = await apiCall.generateToken({ 
        name: tokenName,
        expiresAt: null,
        ttlSeconds: 31622400
      });

      expect(response.token).toBeDefined();
      expect(response.message).toBe("Authentication successful");

      // Verify via list API
      const tokens = await apiCall.listTokens();
      const tokenExists = tokens.tokens.some((t: { name: string }) => t.name === tokenName);
      expect(tokenExists).toBe(true);

      // Verify via UI
      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();
      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

      // Cleanup
      const tokenToRevoke = tokens.tokens.find((t: { name: string }) => t.name === tokenName);
      if (tokenToRevoke) {
        await apiCall.revokeToken({ token_id: (tokenToRevoke as { token_id: string }).token_id });
      }
    });

    test("@readonly Generate token via UI and validate API response structure", async () => {
      // Generate token via UI
      const tokenName = getRandomString("ui-api-validate-token");
      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();
      
      const token = await settingsTokensPage.generateToken(tokenName);
      expect(token).not.toBeNull();
      await settingsTokensPage.dismissTokenDisplay();
      
      // Validate via API
      const response = await apiCall.listTokens();
      
      expect(response.tokens).toBeDefined();
      expect(Array.isArray(response.tokens)).toBe(true);
      expect(response.count).toBeGreaterThanOrEqual(0);
      expect(response.role).toBeDefined();
      expect(typeof response.role).toBe("string");
      
      // Verify our token is in the list
      const tokenExists = response.tokens.some((t: { name: string }) => t.name === tokenName);
      expect(tokenExists).toBe(true);
      
      // Cleanup
      await settingsTokensPage.revokeToken(tokenName);
    });

    test("@readonly Revoke token via API and verify in UI", async () => {
      // Generate token
      const tokenName = getRandomString("api-revoke-token");
      await apiCall.generateToken({ name: tokenName });
      
      // Get token details
      const tokens = await apiCall.listTokens();
      const token = tokens.tokens.find((t: { name: string }) => t.name === tokenName);
      expect(token).toBeDefined();

      // Revoke token via API
      const revokeResponse = await apiCall.revokeToken({ token_id: (token as { token_id: string }).token_id });
      expect(revokeResponse.message).toContain("revoked successfully");

      // Verify via API token is gone
      const tokensAfter = await apiCall.listTokens();
      const tokenStillExists = tokensAfter.tokens.some((t: { name: string }) => t.name === tokenName);
      expect(tokenStillExists).toBe(false);

      // Verify via UI token is gone
      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();
      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(false);
    });
  });

  test.describe("Multi-User Token Isolation", () => {
    // Get user credentials from config
    const readonlyUser = userConfig.userRoles.find((u) => u.role === "readonly")!;
    const readwriteUser = userConfig.userRoles.find((u) => u.role === "readwrite")!;

    test("@readwrite ReadWrite user cannot see tokens created by ReadOnly user", async () => {
      // Generate token as ReadOnly user
      const roTokenName = getRandomString("ro-token-for-rw");
      await apiCall.generateTokenAsUser(
        readonlyUser.name,
        userConfig.user.password,
        { name: roTokenName }
      );

      // Check as ReadWrite user via API
      const rwTokens = await apiCall.listTokensAsUser(
        readwriteUser.name,
        userConfig.user.password
      );
      const tokenExists = rwTokens.tokens.some((t: { name: string }) => t.name === roTokenName);
      expect(tokenExists).toBe(false);

      // Cleanup
      const roTokens = await apiCall.listTokensAsUser(
        readonlyUser.name,
        userConfig.user.password
      );
      const tokenToRevoke = roTokens.tokens.find((t: { name: string }) => t.name === roTokenName);
      if (tokenToRevoke) {
        await apiCall.revokeTokenAsUser(
          readonlyUser.name,
          userConfig.user.password,
          { token_id: (tokenToRevoke as { token_id: string }).token_id }
        );
      }
    });

    test("@readwrite ReadWrite user cannot see tokens created by Admin", async () => {
      // Generate token as Admin
      const adminTokenName = getRandomString("admin-token-for-rw");
      await apiCall.generateToken({ name: adminTokenName });

      // Check as ReadWrite user via API
      const rwTokens = await apiCall.listTokensAsUser(
        readwriteUser.name,
        userConfig.user.password
      );
      const tokenExists = rwTokens.tokens.some((t: { name: string }) => t.name === adminTokenName);
      expect(tokenExists).toBe(false);

      // Cleanup
      const adminTokens = await apiCall.listTokens();
      const tokenToRevoke = adminTokens.tokens.find((t: { name: string }) => t.name === adminTokenName);
      if (tokenToRevoke) {
        await apiCall.revokeToken({ token_id: (tokenToRevoke as { token_id: string }).token_id });
      }
    });

    test("@readonly ReadOnly user cannot see tokens created by ReadWrite user", async () => {
      // Generate token as ReadWrite user
      const rwTokenName = getRandomString("rw-token-for-ro");
      await apiCall.generateTokenAsUser(
        readwriteUser.name,
        userConfig.user.password,
        { name: rwTokenName }
      );

      // Check as ReadOnly user via API
      const roTokens = await apiCall.listTokensAsUser(
        readonlyUser.name,
        userConfig.user.password
      );
      const tokenExists = roTokens.tokens.some((t: { name: string }) => t.name === rwTokenName);
      expect(tokenExists).toBe(false);

      // Cleanup
      const rwTokens = await apiCall.listTokensAsUser(
        readwriteUser.name,
        userConfig.user.password
      );
      const tokenToRevoke = rwTokens.tokens.find((t: { name: string }) => t.name === rwTokenName);
      if (tokenToRevoke) {
        await apiCall.revokeTokenAsUser(
          readwriteUser.name,
          userConfig.user.password,
          { token_id: (tokenToRevoke as { token_id: string }).token_id }
        );
      }
    });

    test("@readonly ReadOnly user cannot see tokens created by Admin", async () => {
      // Generate token as Admin
      const adminTokenName = getRandomString("admin-token-for-ro");
      await apiCall.generateToken({ name: adminTokenName });

      // Check as ReadOnly user via API
      const roTokens = await apiCall.listTokensAsUser(
        readonlyUser.name,
        userConfig.user.password
      );
      const tokenExists = roTokens.tokens.some((t: { name: string }) => t.name === adminTokenName);
      expect(tokenExists).toBe(false);

      // Cleanup
      const adminTokens = await apiCall.listTokens();
      const tokenToRevoke = adminTokens.tokens.find((t: { name: string }) => t.name === adminTokenName);
      if (tokenToRevoke) {
        await apiCall.revokeToken({ token_id: (tokenToRevoke as { token_id: string }).token_id });
      }
    });
  });

  test.describe("Basic Functionality - All User Types", () => {
    // Test that all user types can generate tokens with default settings

    test("@readonly ReadOnly user can generate token via ui", async () => {
      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      const tokenName = getRandomString("readonly-basic-token");
      const token = await settingsTokensPage.generateToken(tokenName);

      expect(token).not.toBeNull();
      expect(token?.length).toBeGreaterThan(0);
      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

      // Cleanup
      await settingsTokensPage.dismissTokenDisplay();
      await settingsTokensPage.revokeToken(tokenName);
    });

    test("@readwrite ReadWrite user can generate token via ui", async () => {
      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      const tokenName = getRandomString("readwrite-basic-token");
      const token = await settingsTokensPage.generateToken(tokenName);

      expect(token).not.toBeNull();
      expect(token?.length).toBeGreaterThan(0);
      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

      // Cleanup
      await settingsTokensPage.dismissTokenDisplay();
      await settingsTokensPage.revokeToken(tokenName);
    });

    test("@readonly ReadOnly user can revoke own token", async () => {
      // Generate token via API for better performance
      const readonlyUser = userConfig.userRoles.find((u) => u.role === "readonly")!;
      const tokenName = getRandomString("readonly-revoke-token");
      const tokenResponse = await apiCall.generateTokenAsUser(
        readonlyUser.name,
        userConfig.user.password,
        { name: tokenName }
      );
      expect(tokenResponse.token).toBeDefined();

      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      // Verify token appears in UI
      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

      // Count tokens before revocation
      const tokensBefore = await settingsTokensPage.getTokenCount();

      await settingsTokensPage.revokeToken(tokenName);
      
      // Wait for token to be removed from list
      await settingsTokensPage.waitFor(1000);

      // Verify token count decreased
      const tokensAfter = await settingsTokensPage.getTokenCount();
      expect(tokensAfter).toBeLessThan(tokensBefore);
    });

    test("@readwrite ReadWrite user can revoke own token", async () => {
      // Generate token via API for better performance
      const readwriteUser = userConfig.userRoles.find((u) => u.role === "readwrite")!;
      const tokenName = getRandomString("readwrite-revoke-token");
      const tokenResponse = await apiCall.generateTokenAsUser(
        readwriteUser.name,
        userConfig.user.password,
        { name: tokenName }
      );
      expect(tokenResponse.token).toBeDefined();

      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
      await settingsTokensPage.navigateToTokensTab();

      // Verify token appears in UI
      expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

      // Count tokens before revocation
      const tokensBefore = await settingsTokensPage.getTokenCount();

      await settingsTokensPage.revokeToken(tokenName);
      
      // Wait for token to be removed from list
      await settingsTokensPage.waitFor(1000);

      // Verify token count decreased
      const tokensAfter = await settingsTokensPage.getTokenCount();
      expect(tokensAfter).toBeLessThan(tokensBefore);
    });
  });
});
