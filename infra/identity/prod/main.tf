terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "<= 3.112.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfappprodio"
    container_name       = "terraform-state"
    key                  = "io-developer-portal-frontend.identity.tfstate"
  }
}

provider "azurerm" {
  features {
  }
}

module "federated_identities" {
  source  = "pagopa-dx/azure-federated-identity-with-github/azurerm"
  version = "0.0.2"

  prefix    = local.prefix
  env_short = local.env_short
  env       = local.env
  domain    = local.domain

  repositories = [local.repo_name]

  location = "westeurope"

  continuos_delivery = {
    enable = true
    roles = {
      subscription = ["Contributor"]
      resource_groups = {
        "terraform-state-rg" = ["Storage Blob Data Contributor"],
        "io-p-rg-common"     = ["Key Vault Certificates Officer"]
      }
    }
  }

  tags = local.tags
}

resource "azurerm_federated_identity_credential" "prod_tls_cd" {
  name                = "prod-tls-cd"
  resource_group_name = module.federated_identities.federated_cd_identity.resource_group_name
  parent_id           = data.azurerm_user_assigned_identity.identity_prod_cd.id
  audience            = ["api://AzureADTokenExchange"]
  issuer              = "https://token.actions.githubusercontent.com"
  subject             = "repo:${local.repo_owner}/${local.repo_name}:environment:prod-tls-cd"
}