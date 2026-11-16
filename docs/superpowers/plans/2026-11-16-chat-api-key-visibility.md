# Chat API Key Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep saved chat API keys hidden by default and change their card visibility only when the user explicitly clicks Show or Hide, without coupling edit-input visibility to that preference.

**Architecture:** Keep `visibleKeyIds` as the sole state for the card's Show/Hide choice. Entering edit mode will not mutate it, and the edit input will remain plain text independently of the card state. Add E2E coverage in the existing settings page object/spec pattern.

**Tech Stack:** React, TypeScript, Playwright E2E.

**Spec:** `/home/anchel/.copilot/session-state/763cda2d-1e88-4761-8309-0ac64195c820/files/2213-chat-api-key-visibility-design.md`

## Global Constraints

- Keys start hidden by default.
- Only an explicit click on the visibility control changes the card's Show/Hide state.
- The edit input remains readable while editing and does not change the card's visibility state.
- Do not change key storage, encryption, or visibility persistence across page reloads.

## Review Focus

- A hidden key stays hidden after opening and cancelling an edit; the edit input is plain text.
- A hidden key stays hidden after saving an edit; the edit input is plain text.
- A key explicitly shown before editing remains shown after save and cancel.
- Newly added keys remain hidden until the user clicks Show.
- Switching between keys while editing does not reveal any other key.

---

### Task 1: Decouple edit input from saved-key visibility

**Files:**
- Modify: `app/settings/browserSettings.tsx`
- Modify: `e2e/logic/POM/settingsBrowserPage.ts`
- Test: `e2e/tests/settingsBrowser.spec.ts`

**Interfaces:**
- Consumes: `visibleKeyIds` and existing chat API key card/edit controls.
- Produces: E2E page-object actions/assertions for edit input type and saved-card visibility.

- [ ] **Step 1: Add failing E2E coverage**

Add E2E cases in `settingsBrowser.spec.ts` that create keys, confirm new cards are hidden, enter edit mode and confirm the edit input is type `text`, and verify hidden cards stay hidden after Cancel and Save. Also verify a key explicitly shown before edit remains shown after Save and Cancel, and editing one key does not reveal another. Keep using the existing `SettingsBrowserPage` page-object pattern.

- [ ] **Step 2: Run the targeted E2E test and confirm it fails**

Run `npx playwright test e2e/tests/settingsBrowser.spec.ts --project='[Read-Write] - Chromium' --grep='Chat API key visibility'` with the required test environment. Expected: the current implementation reveals the hidden key on edit, and its edit input is password-typed when the card is hidden.

- [ ] **Step 3: Implement the single visibility-state behavior**

In `browserSettings.tsx`, remove the visibility-state mutation from `handleEditKey` and render the edit input as plain text regardless of `isVisible`. Leave the card's Show/Hide rendering and `toggleKeyVisibility` as the only way to change `visibleKeyIds`.

- [ ] **Step 4: Run targeted E2E and lint checks**

Run `npx playwright test e2e/tests/settingsBrowser.spec.ts --project='[Read-Write] - Chromium' --grep='Chat API key visibility'` and lint the changed TypeScript files. Expected: all new visibility regressions pass and lint reports no errors.

- [ ] **Step 5: Open one PR linked to issue #2213**

Commit the fix and tests on this task branch, push it, and open a PR that references `Fixes #2213`. Do not start another issue; report the PR link and the issues left in oldest-to-newest order, then stop.
