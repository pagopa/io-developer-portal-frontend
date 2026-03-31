resource "github_repository_environment" "github_repository_environment_prod_tls_cd" {
  environment = "prod-tls-cd"
  repository  = github_repository.this.name

  deployment_branch_policy {
    protected_branches     = true
    custom_branch_policies = false
  }
}

resource "github_actions_environment_secret" "env_prod_cd_secrets" {
  for_each = local.prod-tls-cd.secrets

  repository      = github_repository.this.name
  environment     = github_repository_environment.github_repository_environment_prod_tls_cd.environment
  secret_name     = each.key
  plaintext_value = each.value
}