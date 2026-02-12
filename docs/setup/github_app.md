# GitHub App Integration Guide

Zeo requires a GitHub App installation to perform analysis and post check results back to your repositories.

## 1. Create the GitHub App

1.  Go to your GitHub Organization Settings > GitHub Apps > **New GitHub App**.
2.  **GitHub App name**: `Zeo Policy Guard` (or your preferred name).
3.  **Homepage URL**: Your production URL.
4.  **Webhook URL**: `https://<your-domain>/api/webhooks/github`.
5.  **Webhook Secret**: Generate a strong secret and save it as `GITHUB_WEBHOOK_SECRET`.

## 2. Permissions

Enable the following permissions:

| Permission | Access | Rationale |
| :--- | :--- | :--- |
| **Checks** | Read & Write | Posting policy evaluation results. |
| **Pull Requests** | Read Only | Accessing diffs and PR metadata. |
| **Contents** | Read Only | Fetching code for static analysis. |
| **Metadata** | Read Only | Basic repository information. |

## 3. Events

Subscribe to the following events:
- **Pull request**: Needed for triggering the analysis loop.

## 4. Install the App

Install the app on the repositories you want to protect. Note the **Installation ID** for troubleshooting.

## 5. Environment Variables

Update your `.env` with:
- `GITHUB_APP_ID`: Your app's ID.
- `GITHUB_PRIVATE_KEY`: The RS256 private key for the app.
- `GITHUB_WEBHOOK_SECRET`: The secret you defined in step 1.
