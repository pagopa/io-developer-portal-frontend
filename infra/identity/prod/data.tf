data "azurerm_user_assigned_identity" "identity_prod_cd" {
  name                = "${local.project}-devportal-frontend-github-cd-identity"
  resource_group_name = local.identity_resource_group_name
}