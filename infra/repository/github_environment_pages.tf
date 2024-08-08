resource "github_repository_environment" "github_repository_environment_github_pages" {
  environment = "github-pages"
  repository  = github_repository.this.name
}