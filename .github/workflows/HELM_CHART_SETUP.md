# Helm Chart CI/CD Setup

This document describes how to configure the GitHub Actions workflow for publishing Helm charts to GitHub Container Registry (GHCR).

## Prerequisites

To publish Helm charts to `ghcr.io/falkordb/charts`, you need a GitHub token with appropriate permissions.

## Setting up the GHCR_TOKEN Secret

### Step 1: Create a Personal Access Token (PAT)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - URL: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Configure the token:
   - **Note**: `Helm Chart Publishing for FalkorDB`
   - **Expiration**: Set based on your security policy (recommend 90 days with auto-renewal)
   - **Scopes**: Select the following permissions:
     - ✅ `write:packages` - Upload packages to GitHub Package Registry
     - ✅ `read:packages` - Download packages from GitHub Package Registry
     - ✅ `delete:packages` - Delete packages from GitHub Package Registry (optional)
4. Click "Generate token"
5. **Important**: Copy the token immediately - you won't be able to see it again!

### Step 2: Add the Token as a Repository Secret

1. Go to your repository: `https://github.com/FalkorDB/falkordb-browser`
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Configure the secret:
   - **Name**: `GHCR_TOKEN`
   - **Value**: Paste the PAT you created in Step 1
5. Click "Add secret"

### Alternative: Organization-Level Secret (Recommended for Multiple Repos)

If you manage multiple repositories in the FalkorDB organization:

1. Go to the organization settings: `https://github.com/organizations/FalkorDB/settings/secrets/actions`
2. Click "New organization secret"
3. Configure the secret:
   - **Name**: `GHCR_TOKEN`
   - **Value**: Paste the PAT
   - **Repository access**: Select "Selected repositories" and add `falkordb-browser`
4. Click "Add secret"

## Workflow Behavior

The workflow uses the following token priority:

1. **GHCR_TOKEN** (if available) - Custom PAT with full GHCR permissions
2. **GITHUB_TOKEN** (fallback) - Default GitHub Actions token

```yaml
echo ${{ secrets.GHCR_TOKEN || secrets.GITHUB_TOKEN }} | helm registry login ghcr.io -u ${{ github.actor }} --password-stdin
```

### When GHCR_TOKEN is Required

The `GITHUB_TOKEN` may not work in the following scenarios:

- Publishing to an organization namespace (`ghcr.io/falkordb/charts`)
- Cross-organization package publishing
- Fine-grained access control requirements

### When GITHUB_TOKEN is Sufficient

The default `GITHUB_TOKEN` works for:

- Publishing to user namespace (`ghcr.io/username/charts`)
- Same repository package operations
- Pull requests (read-only operations)

## Verifying the Setup

After adding the secret:

1. Push a change to the `helm/**` directory or workflow file
2. Check the workflow run in Actions tab
3. Verify the "Login to GitHub Container Registry" step succeeds
4. Verify the "Push Helm chart to GHCR" step completes successfully

## Troubleshooting

### Error: "unauthorized: unauthenticated"

**Cause**: No valid token is configured or the token lacks permissions.

**Solution**: 
- Verify `GHCR_TOKEN` secret exists and is correctly set
- Ensure the PAT has `write:packages` scope
- Check the token hasn't expired

### Error: "denied: permission_denied"

**Cause**: Token exists but lacks write permissions to the packages.

**Solution**:
- Regenerate the PAT with `write:packages` scope
- For organization packages, ensure the token owner has write access to the organization

### Error: "resource access forbidden"

**Cause**: Organization policy prevents package publishing.

**Solution**:
- Check organization package settings at `https://github.com/organizations/FalkorDB/settings/packages`
- Ensure "Allow members to publish packages" is enabled

## Token Security Best Practices

1. **Rotation**: Regularly rotate tokens (every 90 days recommended)
2. **Scope Minimization**: Only grant necessary permissions (`write:packages`)
3. **Audit**: Regularly review token usage in organization audit logs
4. **Monitoring**: Set up alerts for unusual package publishing activity
5. **Expiration**: Use tokens with expiration dates rather than no expiration

## Publishing Process

The workflow automatically publishes charts when:

1. **On push to main/staging**: Publishes with version from `Chart.yaml`
2. **On version tag** (e.g., `v1.6.7`): Publishes with version from tag

Published charts are available at:
```
oci://ghcr.io/falkordb/charts/falkordb-browser
```

## Manual Publishing (If Needed)

If you need to manually publish a chart:

```bash
# Login to GHCR
echo $GHCR_TOKEN | helm registry login ghcr.io -u your-github-username --password-stdin

# Package the chart
helm package helm/falkordb-browser

# Push to GHCR
helm push falkordb-browser-*.tgz oci://ghcr.io/falkordb/charts
```

## References

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [Working with Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Helm Registry Documentation](https://helm.sh/docs/topics/registries/)
