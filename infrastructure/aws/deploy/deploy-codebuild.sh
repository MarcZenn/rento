#!/usr/bin/env bash

################################################################################
# CodeBuild Database Migration Infrastructure Deployment Script
################################################################################
#
# This script deploys the AWS CodeBuild projects for database migrations
# in both development and production environments.
#
# Usage:
#   ./deploy-codebuild.sh [dev|prod|both]
#
# Examples:
#   ./deploy-codebuild.sh dev      # Deploy development only
#   ./deploy-codebuild.sh prod     # Deploy production only
#   ./deploy-codebuild.sh both     # Deploy both (default)
#
# Prerequisites:
#   - AWS CLI configured with SSO profiles
#   - RDS CloudFormation stacks already deployed
#   - Appropriate AWS permissions
#
################################################################################

set -euo pipefail

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly TEMPLATE_FILE="${SCRIPT_DIR}/../cloudformation-codebuild-migrations.yml"
readonly AWS_REGION="ap-northeast-1"
readonly GITHUB_REPO="marczenn/rento"  # Update this with your GitHub org/repo
readonly GITHUB_BRANCH="main"

# AWS SSO Profiles
readonly DEV_PROFILE="rento-development-sso"
readonly PROD_PROFILE="rento-production-sso"

# Stack names
readonly DEV_STACK_NAME="rento-codebuild-migrations-dev"
readonly PROD_STACK_NAME="rento-codebuild-migrations-prod"

################################################################################
# Helper Functions
################################################################################

log_info() {
    echo -e "${BLUE}ℹ ${NC}$*"
}

log_success() {
    echo -e "${GREEN}✓${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $*"
}

log_error() {
    echo -e "${RED}✗${NC} $*" >&2
}

print_header() {
    echo ""
    echo "========================================================================"
    echo "$*"
    echo "========================================================================"
    echo ""
}

print_separator() {
    echo "------------------------------------------------------------------------"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed"
        log_error "Install it from: https://aws.amazon.com/cli/"
        exit 1
    fi
    log_success "AWS CLI found: $(aws --version | cut -d' ' -f1)"

    # Check if template file exists
    if [[ ! -f "$TEMPLATE_FILE" ]]; then
        log_error "CloudFormation template not found: $TEMPLATE_FILE"
        exit 1
    fi
    log_success "CloudFormation template found"

    echo ""
}

check_aws_sso() {
    local profile=$1
    local profile_name=$2

    log_info "Checking AWS SSO authentication for $profile_name..."

    if ! aws sts get-caller-identity --profile "$profile" --region "$AWS_REGION" &> /dev/null; then
        log_warning "AWS SSO session expired or not authenticated for profile: $profile"
        log_info "Opening browser for SSO login..."

        if ! aws sso login --profile "$profile"; then
            log_error "Failed to authenticate with AWS SSO"
            exit 1
        fi
    fi

    # Get and display account info
    local account_id
    account_id=$(aws sts get-caller-identity --profile "$profile" --region "$AWS_REGION" --query 'Account' --output text)
    log_success "Authenticated to AWS Account: $account_id ($profile_name)"
    echo ""
}

validate_stack_dependencies() {
    local profile=$1
    local environment=$2
    local env_name=$3

    log_info "Validating stack dependencies for $env_name..."

    # Check if RDS stack exists
    local rds_stack_name="rento-postgres-${environment}"
    if ! aws cloudformation describe-stacks \
        --stack-name "$rds_stack_name" \
        --profile "$profile" \
        --region "$AWS_REGION" &> /dev/null; then
        log_error "RDS stack not found: $rds_stack_name"
        log_error "Deploy the RDS stack first before deploying CodeBuild"
        return 1
    fi
    log_success "RDS stack exists: $rds_stack_name"

    # Verify required exports exist
    local required_exports=(
        "${environment}-rento-vpc-id"
        "${environment}-rento-private-subnet-ids"
        "${environment}-rento-app-sg-id"
        "${environment}-rento-kms-key-id"
    )

    for export_name in "${required_exports[@]}"; do
        if ! aws cloudformation list-exports \
            --profile "$profile" \
            --region "$AWS_REGION" \
            --query "Exports[?Name=='${export_name}'].Name" \
            --output text | grep -q "$export_name"; then
            log_error "Required CloudFormation export not found: $export_name"
            log_error "Ensure the RDS stack has completed successfully"
            return 1
        fi
    done
    log_success "All required CloudFormation exports exist"
    echo ""
}

check_stack_exists() {
    local stack_name=$1
    local profile=$2

    if aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --profile "$profile" \
        --region "$AWS_REGION" &> /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

get_stack_status() {
    local stack_name=$1
    local profile=$2

    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --profile "$profile" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].StackStatus' \
        --output text 2>/dev/null || echo "DOES_NOT_EXIST"
}

deploy_stack() {
    local stack_name=$1
    local profile=$2
    local environment=$3
    local env_name=$4

    print_header "Deploying CodeBuild Stack: $env_name"

    # Check if stack exists
    if check_stack_exists "$stack_name" "$profile"; then
        local stack_status
        stack_status=$(get_stack_status "$stack_name" "$profile")
        log_info "Stack already exists with status: $stack_status"

        # Ask user if they want to update
        echo ""
        read -p "Do you want to UPDATE this stack? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_warning "Skipping $env_name deployment"
            return 0
        fi

        log_info "Updating stack: $stack_name"
        local operation="update-stack"
    else
        log_info "Creating new stack: $stack_name"
        local operation="create-stack"
    fi

    # Deploy/Update stack
    log_info "Deploying CloudFormation stack..."
    log_info "Template: $TEMPLATE_FILE"
    log_info "Parameters:"
    log_info "  - Environment: $environment"
    log_info "  - GitHubRepo: $GITHUB_REPO"
    log_info "  - GitHubBranch: $GITHUB_BRANCH"
    echo ""

    if aws cloudformation "$operation" \
        --stack-name "$stack_name" \
        --template-body "file://${TEMPLATE_FILE}" \
        --parameters \
            ParameterKey=Environment,ParameterValue="$environment" \
            ParameterKey=GitHubRepo,ParameterValue="$GITHUB_REPO" \
            ParameterKey=GitHubBranch,ParameterValue="$GITHUB_BRANCH" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region "$AWS_REGION" \
        --profile "$profile" &> /dev/null; then

        if [[ "$operation" == "create-stack" ]]; then
            log_success "Stack creation initiated"
        else
            log_success "Stack update initiated"
        fi
    else
        local exit_code=$?
        if [[ $exit_code -eq 254 ]] || aws cloudformation describe-stacks \
            --stack-name "$stack_name" \
            --profile "$profile" \
            --region "$AWS_REGION" 2>&1 | grep -q "No updates are to be performed"; then
            log_warning "No changes detected - stack is already up to date"
            return 0
        else
            log_error "Failed to $operation"
            return 1
        fi
    fi

    # Wait for stack operation to complete
    log_info "Waiting for stack operation to complete (this may take 3-5 minutes)..."

    if [[ "$operation" == "create-stack" ]]; then
        local wait_command="stack-create-complete"
    else
        local wait_command="stack-update-complete"
    fi

    if aws cloudformation wait "$wait_command" \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" \
        --profile "$profile"; then
        log_success "Stack operation completed successfully!"
    else
        log_error "Stack operation failed or timed out"
        log_error "Check AWS Console for details: https://console.aws.amazon.com/cloudformation"
        return 1
    fi

    # Display outputs
    echo ""
    log_info "Stack Outputs:"
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --profile "$profile" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs[].[OutputKey,OutputValue,Description]' \
        --output table

    echo ""
    log_success "$env_name CodeBuild stack deployed successfully!"
    echo ""
}

display_next_steps() {
    print_header "Next Steps"

    echo "1. Update GitHub Actions IAM Roles with CodeBuild permissions"
    echo "   - See: infrastructure/aws/deploy/IAM_POLICIES_REFERENCE.md"
    echo ""
    echo "2. Verify database credentials are stored in SSM Parameter Store:"
    echo "   Development: /development/rento/postgres/password"
    echo "   Production:  /production/rento/postgres/password"
    echo ""
    echo "3. Test the deployment via GitHub Actions:"
    echo "   - Go to: https://github.com/${GITHUB_REPO}/actions"
    echo "   - Run: 'Deploy Database Migrations' workflow"
    echo ""
    echo "4. Monitor CodeBuild projects:"
    echo "   Development: https://console.aws.amazon.com/codesuite/codebuild/projects/development-rento-database-migration"
    echo "   Production:  https://console.aws.amazon.com/codesuite/codebuild/projects/production-rento-database-migration"
    echo ""

    print_separator
    log_success "Deployment complete!"
    echo ""
}

################################################################################
# Main Deployment Function
################################################################################

deploy_environment() {
    local env_type=$1

    case $env_type in
        dev)
            check_aws_sso "$DEV_PROFILE" "Development"
            validate_stack_dependencies "$DEV_PROFILE" "development" "Development" || return 1
            deploy_stack "$DEV_STACK_NAME" "$DEV_PROFILE" "development" "Development"
            ;;
        prod)
            check_aws_sso "$PROD_PROFILE" "Production"
            validate_stack_dependencies "$PROD_PROFILE" "production" "Production" || return 1
            deploy_stack "$PROD_STACK_NAME" "$PROD_PROFILE" "production" "Production"
            ;;
        *)
            log_error "Invalid environment: $env_type"
            return 1
            ;;
    esac
}

################################################################################
# Main Script
################################################################################

main() {
    local deploy_target="${1:-both}"

    print_header "CodeBuild Database Migration Infrastructure Deployment"

    echo "Configuration:"
    echo "  Region:        $AWS_REGION"
    echo "  GitHub Repo:   $GITHUB_REPO"
    echo "  GitHub Branch: $GITHUB_BRANCH"
    echo "  Deploy Target: $deploy_target"
    echo ""

    # Check prerequisites
    check_prerequisites

    # Deploy based on target
    case $deploy_target in
        dev)
            log_info "Deploying Development environment only"
            deploy_environment "dev"
            ;;
        prod)
            log_info "Deploying Production environment only"
            deploy_environment "prod"
            ;;
        both)
            log_info "Deploying both Development and Production environments"
            deploy_environment "dev" && deploy_environment "prod"
            ;;
        *)
            log_error "Invalid deployment target: $deploy_target"
            echo ""
            echo "Usage: $0 [dev|prod|both]"
            echo ""
            echo "Examples:"
            echo "  $0 dev      # Deploy development only"
            echo "  $0 prod     # Deploy production only"
            echo "  $0 both     # Deploy both (default)"
            exit 1
            ;;
    esac

    # Display next steps
    display_next_steps
}

# Run main function
main "$@"
