resource "github_branch_default" "default_master" {
  repository = github_repository.this.name
  branch     = "master"
}

resource "github_branch_protection" "protection_master" {
  repository_id = github_repository.this.name
  pattern       = "master"

  required_status_checks {
    strict   = false
    contexts = []
  }

  require_conversation_resolution = true

  #tfsec:ignore:github-branch_protections-require_signed_commits
  require_signed_commits = false

  required_pull_request_reviews {
    dismiss_stale_reviews           = false
    require_code_owner_reviews      = true
    required_approving_review_count = 1
  }

  allows_deletions = false
}

# resource "github_branch_protection" "protection_gh_pages" {
#   repository_id = github_repository.this.name
#   pattern       = "gh-pages"

#   force_push_bypassers = []

#   required_status_checks {
#     strict   = true
#     contexts = []
#   }

#   require_conversation_resolution = false

#   #tfsec:ignore:github-branch_protections-require_signed_commits
#   require_signed_commits = false

#   required_pull_request_reviews {
#     dismiss_stale_reviews           = false
#     require_code_owner_reviews      = false
#     restrict_dismissals             = false
#     required_approving_review_count = 1
#     dismissal_restrictions          = []
#     pull_request_bypassers          = []
#   }

#   allows_deletions = false
# }