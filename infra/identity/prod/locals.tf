locals {
  prefix    = "io"
  env_short = "p"
  env       = "prod"
  location  = "italynorth"
  project   = "${local.prefix}-${local.env_short}"
  domain    = "devportal-frontend"

  repo_name = "io-developer-portal-frontend"

  tags = {
    CostCenter     = "TS310 - PAGAMENTI & SERVIZI"
    CreatedBy      = "Terraform"
    Environment    = "Prod"
    Owner          = "IO"
    ManagementTeam = "IO Enti & Servizi"
    Source         = "https://github.com/pagopa/io-developer-portal-frontend/blob/master/infra/identity/prod"
  }
}
