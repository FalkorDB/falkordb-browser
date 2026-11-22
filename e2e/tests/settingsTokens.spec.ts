import { expect, test } from "../infra/coverage";
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

  test("@admin Custom token expiration rejects missing and past dates before sending a request", async () => {
    const settingsTokensPage = await browser.createNewPage(SettingsTokensPage);
    const page = await browser.getPage();
    let mutations = 0;
    await page.route("**/api/auth/tokens", async route => {
      if (route.request().method() === "GET") {
        await route.fulfill({ json: { tokens: [], role: "Admin" } });
      } else {
        mutations += 1;
        await route.fulfill({ status: 400, json: { message: "Unexpected mutation" } });
      }
    });
    await browser.navigateTo(urls.settingsUrl);
    await settingsTokensPage.navigateToTokensTab();
    await settingsTokensPage.clickGenerateTokenButton();
    await settingsTokensPage.fillTokenNameInput("mock-custom-expiration");
    await settingsTokensPage.clickExpirationSelect();
    await settingsTokensPage.clickExpirationOption("Custom");
    await settingsTokensPage.clickGenerateTokenConfirmButton();
    await expect(settingsTokensPage.missingDateError).toBeVisible();
    await expect(settingsTokensPage.generateTokenConfirmButton).toBeEnabled();
    await settingsTokensPage.customDateInput.fill("2000-01-01");
    await settingsTokensPage.clickGenerateTokenConfirmButton();
    await expect(settingsTokensPage.pastDateError).toBeVisible();
    await expect(settingsTokensPage.customDateInput).toHaveValue("2000-01-01");
    await expect(settingsTokensPage.tokenNameInput).toHaveValue("mock-custom-expiration");
    await expect(settingsTokensPage.generateTokenConfirmButton).toBeEnabled();
    expect(mutations).toBe(0);
  });

  test.describe("Custom expiration in a western timezone", () => {
    test.use({ timezoneId: "America/Los_Angeles", locale: "en-US" });
    [
      { date: "2030-01-14", expiresAt: "2030-01-15T07:59:59.999Z", label: "Jan 14, 2030" },
      { date: "2030-03-10", expiresAt: "2030-03-11T06:59:59.999Z", label: "Mar 10, 2030" },
    ].forEach(({ date, expiresAt, label }) => {
      test(`@admin Failed token generation preserves custom expiration and can be retried (${date})`,async () => {
        const settingsTokensPage=await browser.createNewPage(SettingsTokensPage);
        const page=await browser.getPage();
        const name="mock-generate-retry";
        const now = Date.parse("2030-01-01T12:00:00Z");
        const submissions: { name: string; expiresAt: string; ttlSeconds: number }[]=[];
        const requestTimes: number[]=[];
        const methods: string[]=[];
        await page.route("**/api/auth/tokens",async route => {
          if(route.request().method()==="GET") {
            await route.fulfill({ json: { tokens: [],role: "Admin" } });
          } else {
            methods.push(route.request().method());
            requestTimes.push(await page.evaluate(() => Date.now()));
            submissions.push(route.request().postDataJSON() as typeof submissions[number]);
            await route.fulfill(submissions.length===1
              ? { status: 400,json: { message: "Token generation rejected" } }
              :{ json: { token: "mock-token-not-a-real-credential" } });
          }
        });
        await browser.navigateTo(urls.settingsUrl);
        await settingsTokensPage.navigateToTokensTab();
        await page.clock.setFixedTime(now);
        await settingsTokensPage.clickGenerateTokenButton();
        await settingsTokensPage.fillTokenNameInput(name);
        await settingsTokensPage.clickExpirationSelect();
        await settingsTokensPage.clickExpirationOption("Custom");
        await settingsTokensPage.customDateInput.fill(date);
        await settingsTokensPage.clickGenerateTokenConfirmButton();
        await expect(settingsTokensPage.requestErrorToast).toBeVisible();
        await expect(settingsTokensPage.tokenNameInput).toHaveValue(name);
        await expect(settingsTokensPage.customDateInput).toHaveValue(date);
        await expect(settingsTokensPage.generateTokenConfirmButton).toBeEnabled();
        await settingsTokensPage.clickGenerateTokenConfirmButton();
        await expect(settingsTokensPage.generatedTokenInput).toHaveValue("mock-token-not-a-real-credential");
        await expect(settingsTokensPage.expirationLabel(label)).toBeVisible();
        expect(submissions).toHaveLength(2);
        expect(methods).toEqual(["POST","POST"]);
        for(const [index,submission] of submissions.entries()) {
          expect(submission).toMatchObject({ name,expiresAt });
          expect(submission.ttlSeconds).toBeGreaterThan(0);
          expect(submission.ttlSeconds).toBeLessThanOrEqual(31622400);
          const expectedTtl=Math.floor((Date.parse(expiresAt)-requestTimes[index])/1000);
          expect(Math.abs(submission.ttlSeconds-expectedTtl)).toBeLessThanOrEqual(5);
        }
      });
    });
  });

  test("@admin Failed token revocation retains the row and confirmation for retry", async () => {
    const settingsTokensPage = await browser.createNewPage(SettingsTokensPage);
    const page = await browser.getPage();
    const name = "mock-revoke-retry";
    let attempts = 0;
    const methods: string[] = [];
    await page.route("**/api/auth/tokens", route => route.fulfill({
      json: { role: "Admin", tokens: [{
        token_id: "mock-token-id", name, username: "mock-user", role: "Read-Only",
        created_at: "2026-01-01T00:00:00Z", last_used: null, expires_at: null,
      }] },
    }));
    await page.route("**/api/auth/tokens/mock-token-id", async route => {
      methods.push(route.request().method());
      attempts += 1;
      await route.fulfill(attempts === 1
        ? { status: 403, json: { message: "Token revocation denied" } }
        : { json: {} });
    });
    await browser.navigateTo(urls.settingsUrl);
    await settingsTokensPage.navigateToTokensTab();
    await settingsTokensPage.clickRevokeButtonByName(name);
    await settingsTokensPage.clickRevokeConfirmButton();
    await expect(settingsTokensPage.requestErrorToast).toBeVisible();
    // The modal hides the underlying table from the accessibility tree.
    await expect(settingsTokensPage.rowBehindDialog(name)).toBeVisible();
    await expect(settingsTokensPage.revokeDialog).toBeVisible();
    await expect(settingsTokensPage.revokeConfirmButton).toBeEnabled();
    await settingsTokensPage.clickRevokeConfirmButton();
    await expect(settingsTokensPage.revokeDialog).toHaveCount(0);
    await expect(settingsTokensPage.getRowByText(name)).toHaveCount(0);
    await expect(settingsTokensPage.emptyTokenList).toBeVisible();
    expect(attempts).toBe(2);
    expect(methods).toEqual(["DELETE", "DELETE"]);
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

        // Dismiss the token display dialog before verifying the token in the list
        await settingsTokensPage.dismissTokenDisplay();
        expect(await settingsTokensPage.verifyTokenExists(tokenName)).toBe(true);

        // Verify expiration if applicable
        if (shouldExpire) {
          const details = await settingsTokensPage.getTokenDetails(tokenName);
          expect(details?.expires).not.toBe("Never");
        }

        // Cleanup
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
        await apiCall.revokeToken((token as { token_id: string }).token_id);
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
      await expect.poll(() => settingsTokensPage.isGenerateTokenConfirmButtonDisabled()).toBe(true);
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

    for (const clipboardMode of ["rejected", "unavailable"] as const) {
      test(`@readonly Failed clipboard copy (${clipboardMode}) keeps the token visible`, async () => {
        const settingsTokensPage = await browser.createNewPage(SettingsTokensPage);
        const page = await browser.getPage();
        const token = "mock-generated-token";

        await page.addInitScript((mode) => {
          Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: mode === "unavailable"
              ? undefined
              : {
                writeText: async () => {
                  throw new DOMException("Write permission denied", "NotAllowedError");
                },
              },
          });
        }, clipboardMode);
        await page.route("**/api/auth/tokens", async route => {
          if (route.request().method() === "GET") {
            await route.fulfill({ json: { tokens: [], role: "Read-Only" } });
          } else {
            await route.fulfill({ json: { token } });
          }
        });

        await browser.navigateTo(urls.settingsUrl);
        await settingsTokensPage.navigateToTokensTab();
        await settingsTokensPage.generateToken("clipboard-failure");
        await settingsTokensPage.copyToken();

        await expect(settingsTokensPage.copyFailureToast).toContainText("Failed to copy token");
        await expect(settingsTokensPage.generatedTokenInput).toHaveValue(token);
      });
    }

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
        await apiCall.revokeTokenAsUser(readonlyUser.name, userConfig.user.password, (token as { token_id: string }).token_id);
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

      // Verify token count decreased
      const tokensAfter = await settingsTokensPage.getTokenCount();
      expect(tokensAfter).toBeLessThan(tokensBefore);
    });

    test("@admin Revoke multiple tokens", async () => {
      const tokenName1 = getRandomString(`admin-revoke-multi`);
      const tokenName2 = getRandomString(`admin-revoke-multi`);
      await apiCall.generateToken({ name: tokenName1 });
      await apiCall.generateToken({ name: tokenName2 });
    
      const settingsTokensPage = await browser.createNewPage(
        SettingsTokensPage,
        urls.settingsUrl
      );
  
      await settingsTokensPage.navigateToTokensTab();
      expect(await settingsTokensPage.verifyTokenExists(tokenName2)).toBe(true);
      const tokensBefore = await settingsTokensPage.getTokenCount();
      await settingsTokensPage.revokeToken(tokenName1);
      await settingsTokensPage.revokeToken(tokenName2);
      // The table re-renders after each revoke; poll until it settles.
      await expect.poll(() => settingsTokensPage.getTokenCount()).toBe(tokensBefore - 2);
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
        await apiCall.revokeTokenAsUser(readonlyUser.name, userConfig.user.password, (token as { token_id: string }).token_id);
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
        await apiCall.revokeTokenAsUser(readonlyUser.name, userConfig.user.password, (token as { token_id: string }).token_id);
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
      expect(response.message).toBe("Token created successfully");

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
        await apiCall.revokeToken((tokenToRevoke as { token_id: string }).token_id);
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
      const revokeResponse = await apiCall.revokeToken((token as { token_id: string }).token_id);
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
          (tokenToRevoke as { token_id: string }).token_id
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
        await apiCall.revokeToken((tokenToRevoke as { token_id: string }).token_id);
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
          (tokenToRevoke as { token_id: string }).token_id
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
        await apiCall.revokeToken((tokenToRevoke as { token_id: string }).token_id);
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

      // Verify token count decreased
      const tokensAfter = await settingsTokensPage.getTokenCount();
      expect(tokensAfter).toBeLessThan(tokensBefore);
    });
  });

  test.describe("Token Storage - Cypher escaping", () => {
    test("@admin Token name that is a Cypher fragment is stored as data", async () => {
      const sentinelName = getRandomString("sentinel-token");
      await apiCall.generateToken({ name: sentinelName });

      // The FalkorDB-backed store writes the token name into a query. `\'` exits
      // a FalkorDB string literal cleanly, so naive `''` doubling would leave the
      // rest of this name running as Cypher. The trailing `//` comments out the
      // remainder, so the unique suffix keeps the payload hostile while keeping
      // this row distinguishable from one a parallel project created.
      const HOSTILE_NAME = `x\\'}) MATCH (v) DETACH DELETE v // ${getRandomString("h")}`;
      const created = await apiCall.generateToken({ name: HOSTILE_NAME });
      expect(created.token).toBeDefined();

      const response = await apiCall.listTokens();
      const hostile = response.tokens.find((t: { name: string }) => t.name === HOSTILE_NAME);
      expect(hostile).toBeDefined();
      // The sentinel is the canary: the payload's DETACH DELETE would take it.
      expect(response.tokens.some((t: { name: string }) => t.name === sentinelName)).toBe(true);

      await apiCall.revokeToken((hostile as { token_id: string }).token_id);
      const sentinel = response.tokens.find((t: { name: string }) => t.name === sentinelName);
      await apiCall.revokeToken((sentinel as { token_id: string }).token_id);
    });
  });
});

test.describe("@Tokens Token API Tests", () => {
  type TokenRow = {
    token_id: string;
    name: string;
    username: string;
    created_at: string;
    expires_at: string | null;
    is_active?: boolean;
  };

  const readwriteUser = userConfig.userRoles.find((u) => u.role === "readwrite")!;
  const pastExpiry = "2000-01-01T00:00:00.000Z";
  let apiCall: ApiCalls;

  test.beforeEach(async () => {
    apiCall = new ApiCalls();
  });

  const findToken = async (name: string) => {
    const { tokens } = await apiCall.listTokens();
    return (tokens as TokenRow[]).find((t) => t.name === name);
  };

  // Revoked after every test so a failing body leaves nothing active; a failed
  // revoke is reported next to (not instead of) the test's own failure.
  const trackedNames: string[] = [];
  test.afterEach(async () => {
    const names = trackedNames.splice(0);
    const { tokens } = await apiCall.listTokens();
    await Promise.all(
      (tokens as TokenRow[])
        .filter((t) => names.includes(t.name))
        .map(async (t) => {
          const revoked = await apiCall.revokeTokenRaw(t.token_id);
          expect(revoked.status, `revoke ${t.name}`).toBe(200);
        })
    );
  });

  test.describe("Create token validation", () => {
    [
      { label: "malformed JSON", sendsName: false, build: () => "{not valid json", message: "Invalid JSON in request body" },
      { label: "empty name", sendsName: false, build: () => ({ name: "" }), message: "Token name cannot be empty" },
      { label: "non-numeric ttlSeconds", sendsName: true, build: (name: string) => ({ name, ttlSeconds: "60" }), message: "Invalid TTL value" },
      { label: "ttlSeconds below 1", sendsName: true, build: (name: string) => ({ name, ttlSeconds: 0 }), message: "TTL must be at least 1 second" },
      { label: "ttlSeconds above one year", sendsName: true, build: (name: string) => ({ name, ttlSeconds: 31622401 }), message: "TTL cannot exceed 1 year" },
      { label: "past expiresAt", sendsName: true, build: (name: string) => ({ name, expiresAt: pastExpiry }), message: "Expiration date must be in the future" },
    ].forEach(({ label, sendsName, build, message }) => {
      test(`@admin Create token rejects ${label} with 400`, async () => {
        const name = getRandomString("invalid-token");
        trackedNames.push(name);
        const response = await apiCall.generateTokenRaw(build(name));
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(message);
        expect(response.body.token).toBeUndefined();
        if (sendsName) expect(await findToken(name)).toBeUndefined();
      });
    });
  });

  test.describe("Token lifecycle", () => {
    const futureExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    [
      { label: "a TTL", payload: { ttlSeconds: 3600 }, expectExpiry: (row: TokenRow) => {
        const lifetime = (Date.parse(row.expires_at!) - Date.parse(row.created_at)) / 1000;
        expect(lifetime).toBeGreaterThanOrEqual(3590);
        expect(lifetime).toBeLessThanOrEqual(3610);
      } },
      { label: "an absolute expiresAt", payload: { expiresAt: futureExpiry.toISOString() }, expectExpiry: (row: TokenRow) => {
        expect(row.expires_at).toBe(new Date(Math.floor(futureExpiry.getTime() / 1000) * 1000).toISOString());
      } },
      { label: "no expiry", payload: {}, expectExpiry: (row: TokenRow) => {
        expect(row.expires_at).toBeNull();
      } },
    ].forEach(({ label, payload, expectExpiry }) => {
      test(`@admin Token created with ${label} can be listed, viewed and revoked once`, async () => {
        const name = getRandomString("lifecycle-token");
        trackedNames.push(name);
        const created = await apiCall.generateTokenRaw({ name, ...payload });
        expect(created.status).toBe(200);
        expect(created.body.message).toBe("Token created successfully");
        expect(typeof created.body.token).toBe("string");

        const listed = await apiCall.listTokensRaw();
        expect(listed.status).toBe(200);
        const row = (listed.body.tokens as TokenRow[]).find((t) => t.name === name)!;
        expect(row).toBeDefined();
        expectExpiry(row);

        const detail = await apiCall.getTokenDetailsRaw(row.token_id);
        expect(detail.status).toBe(200);
        expect(detail.body.token).toMatchObject({
          token_id: row.token_id,
          name,
          expires_at: row.expires_at,
          is_active: true,
        });

        const revoked = await apiCall.revokeTokenRaw(row.token_id);
        expect(revoked.status).toBe(200);
        expect(revoked.body).toMatchObject({ message: "Token revoked successfully", tokenId: row.token_id });
        expect(await findToken(name)).toBeUndefined();
        const revokedDetail = await apiCall.getTokenDetailsRaw(row.token_id);
        expect(revokedDetail.status).toBe(200);
        expect(revokedDetail.body.token.is_active).toBe(false);

        const secondRevoke = await apiCall.revokeTokenRaw(row.token_id);
        expect(secondRevoke.status).toBe(400);
        expect(secondRevoke.body.message).toBe("Token is already revoked");
      });
    });

    test("@admin Viewing or revoking an unknown token id returns 404", async () => {
      const unknownId = getRandomString("missing-token");
      const detail = await apiCall.getTokenDetailsRaw(unknownId);
      expect(detail.status).toBe(404);
      expect(detail.body.message).toBe("Token not found");
      const revoke = await apiCall.revokeTokenRaw(unknownId);
      expect(revoke.status).toBe(404);
      expect(revoke.body.message).toBe("Token not found");
    });
  });

  test.describe("Token ownership", () => {
    test("@admin Read-write user cannot view or revoke an admin token, admin can manage the user's token", async () => {
      const adminTokenName = getRandomString("admin-owned-token");
      const userTokenName = getRandomString("rw-owned-token");
      trackedNames.push(adminTokenName, userTokenName);
      expect((await apiCall.generateTokenRaw({ name: adminTokenName })).status).toBe(200);
      const adminRow = (await findToken(adminTokenName))!;
      expect(adminRow).toBeDefined();

      const userLogin = await apiCall.generateTokenWithCredentialsRaw({
        username: readwriteUser.name,
        password: userConfig.user.password,
        name: userTokenName,
      });
      expect(userLogin.status).toBe(200);
      const userBearer = userLogin.body.token as string;

      const userList = await apiCall.listTokensRaw(userBearer);
      expect(userList.status).toBe(200);
      const userNames = (userList.body.tokens as TokenRow[]).map((t) => t.name);
      expect(userNames).toContain(userTokenName);
      expect(userNames).not.toContain(adminTokenName);

      const view = await apiCall.getTokenDetailsRaw(adminRow.token_id, userBearer);
      expect(view.status).toBe(403);
      expect(view.body.message).toBe("Forbidden: You can only view tokens for your connection");
      const revoke = await apiCall.revokeTokenRaw(adminRow.token_id, userBearer);
      expect(revoke.status).toBe(403);
      expect(revoke.body.message).toBe("Forbidden: You can only revoke tokens for your connection");
      expect((await apiCall.getTokenDetailsRaw(adminRow.token_id)).body.token.is_active).toBe(true);

      const userRow = (await findToken(userTokenName))!;
      expect(userRow).toBeDefined();
      expect(userRow.username).toBe(readwriteUser.name);
      const adminView = await apiCall.getTokenDetailsRaw(userRow.token_id);
      expect(adminView.status).toBe(200);
      expect(adminView.body.token.name).toBe(userTokenName);
      const adminRevoke = await apiCall.revokeTokenRaw(userRow.token_id);
      expect(adminRevoke.status).toBe(200);
      expect((await apiCall.getTokenDetailsRaw(userRow.token_id)).body.token.is_active).toBe(false);
    });
  });

  test.describe("Credentials token endpoint", () => {
    const credentials = { username: readwriteUser.name, password: userConfig.user.password };

    [
      { label: "malformed JSON", sendsName: false, build: () => "{not valid json", message: "Invalid JSON in request body" },
      { label: "empty username", sendsName: false, build: () => ({ username: "" }), message: "Username cannot be empty" },
      { label: "non-numeric ttlSeconds", sendsName: true, build: (name: string) => ({ ...credentials, name, ttlSeconds: "60" }), message: "Invalid TTL value" },
      { label: "past expiresAt", sendsName: true, build: (name: string) => ({ ...credentials, name, expiresAt: pastExpiry }), message: "Expiration date must be in the future" },
      { label: "ttlSeconds below 1", sendsName: true, build: (name: string) => ({ ...credentials, name, ttlSeconds: 0 }), message: "Invalid TTL value (must be between 1 and 31622400 seconds)" },
      { label: "ttlSeconds above one year", sendsName: true, build: (name: string) => ({ ...credentials, name, ttlSeconds: 31622401 }), message: "Invalid TTL value (must be between 1 and 31622400 seconds)" },
    ].forEach(({ label, sendsName, build, message }) => {
      test(`@admin Credentials token rejects ${label} with 400`, async () => {
        const name = getRandomString("invalid-credentials-token");
        trackedNames.push(name);
        const response = await apiCall.generateTokenWithCredentialsRaw(build(name));
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(message);
        expect(response.body.token).toBeUndefined();
        if (sendsName) expect(await findToken(name)).toBeUndefined();
      });
    });

    test("@admin Credentials token with a wrong password returns 401", async () => {
      const name = getRandomString("wrong-password-token");
      trackedNames.push(name);
      const response = await apiCall.generateTokenWithCredentialsRaw({
        username: readwriteUser.name,
        password: `${userConfig.user.password}-wrong`,
        name,
      });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials or connection failed");
      expect(response.body.token).toBeUndefined();
      expect(await findToken(name)).toBeUndefined();
    });

    test("@admin Credentials token is usable and its owner can view and revoke it", async () => {
      const name = getRandomString("credentials-token");
      trackedNames.push(name);
      const created = await apiCall.generateTokenWithCredentialsRaw({ ...credentials, name, ttlSeconds: 3600 });
      expect(created.status).toBe(200);
      expect(created.body.message).toBe("Token created successfully");
      const bearer = created.body.token as string;

      const listed = await apiCall.listTokensRaw(bearer);
      expect(listed.status).toBe(200);
      const row = (listed.body.tokens as TokenRow[]).find((t) => t.name === name)!;
      expect(row).toBeDefined();
      expect(row.username).toBe(readwriteUser.name);
      expect(row.expires_at).not.toBeNull();

      const ownDetail = await apiCall.getTokenDetailsRaw(row.token_id, bearer);
      expect(ownDetail.status).toBe(200);
      expect(ownDetail.body.token).toMatchObject({ token_id: row.token_id, name, is_active: true });

      const revoked = await apiCall.revokeTokenRaw(row.token_id, bearer);
      expect(revoked.status).toBe(200);
      expect(revoked.body).toMatchObject({ message: "Token revoked successfully", tokenId: row.token_id });

      const afterRevoke = await apiCall.listTokensRaw(bearer);
      expect(afterRevoke.status).toBe(401);
      expect(afterRevoke.body.message).toBe("Invalid or revoked access token");
    });
  });
});
