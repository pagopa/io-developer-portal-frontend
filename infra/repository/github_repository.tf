resource "github_repository" "this" {
  name        = "io-developer-portal-frontend"
  description = "The developer portal frontend"

  #tfsec:ignore:github-repositories-private
  visibility = "public"

  allow_auto_merge            = true
  allow_rebase_merge          = true
  allow_merge_commit          = false
  allow_squash_merge          = true
  squash_merge_commit_title   = "COMMIT_OR_PR_TITLE"
  squash_merge_commit_message = "COMMIT_MESSAGES"

  delete_branch_on_merge = true

  has_projects    = false
  has_wiki        = false
  has_discussions = false
  has_issues      = false
  has_downloads   = true

  topics = ["digital-citizenship"]

  vulnerability_alerts = true

  homepage_url = "https://developer.io.italia.it"

  pages {
    build_type = "legacy"
    cname      = "developer.io.italia.it"

    source {
      branch = "gh-pages"
      path   = "/"
    }
  }

  security_and_analysis {
    secret_scanning {
      status = "enabled"
    }

    secret_scanning_push_protection {
      status = "enabled"
    }
  }
}
