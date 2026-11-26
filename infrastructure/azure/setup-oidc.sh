#!/usr/bin/env bash
# Switch Deploy API from publish profiles (long-lived passwords) to OIDC (SEC-08, ADR-0018).
# A person with Owner on the subscription runs this once; agents never run it.
# It creates a user-assigned managed identity (no app registration needed), trusts GitHub's OIDC tokens
# for the repo's staging / production Environments, lets it deploy only to the two MENO apps, stores the
# ids as Environment variables, deletes the publish-profile secrets and turns basic-auth publishing off.
# Rollback: delete the identity (az identity delete -g nitheesh_group -n id-meno-github-deploy), re-enable SCM basic
# auth on the apps and set AZURE_WEBAPP_PUBLISH_PROFILE again (docs/deployment/AZURE_APP_SERVICE.md).
set -euo pipefail
RG=${RG:-nitheesh_group}
REPO=${REPO:-Setups-Works/medical-erp}
ID_NAME=${ID_NAME:-id-meno-github-deploy}
# "<GitHub Environment>:<App Service>" pairs (plain bash 3 for macOS).
PAIRS=${PAIRS:-"staging:meno-api-staging production:meno-api-production"}

SUB=$(az account show --query id -o tsv)
TENANT=$(az account show --query tenantId -o tsv)
az identity create -g "$RG" -n "$ID_NAME" -o none
CLIENT=$(az identity show -g "$RG" -n "$ID_NAME" --query clientId -o tsv)
PRINCIPAL=$(az identity show -g "$RG" -n "$ID_NAME" --query principalId -o tsv)

for pair in $PAIRS; do
  env=${pair%%:*}
  app=${pair#*:}
  az identity federated-credential create -g "$RG" --identity-name "$ID_NAME" -n "github-$env" \
    --issuer https://token.actions.githubusercontent.com \
    --subject "repo:$REPO:environment:$env" --audiences api://AzureADTokenExchange -o none
  az role assignment create --assignee-object-id "$PRINCIPAL" --assignee-principal-type ServicePrincipal \
    --role "Website Contributor" --scope "$(az webapp show -g "$RG" -n "$app" --query id -o tsv)" -o none
  gh variable set AZURE_CLIENT_ID --env "$env" --body "$CLIENT" -R "$REPO"
  gh variable set AZURE_TENANT_ID --env "$env" --body "$TENANT" -R "$REPO"
  gh variable set AZURE_SUBSCRIPTION_ID --env "$env" --body "$SUB" -R "$REPO"
  gh secret delete AZURE_WEBAPP_PUBLISH_PROFILE --env "$env" -R "$REPO" || true
  for kind in scm ftp; do
    az resource update -g "$RG" --namespace Microsoft.Web --resource-type basicPublishingCredentialsPolicies \
      --parent "sites/$app" -n "$kind" --set properties.allow=false -o none
  done
  echo "$env -> $app: OIDC ready, publish profile removed, basic auth off"
done
echo "Re-run the last Deploy API run to confirm OIDC works."
