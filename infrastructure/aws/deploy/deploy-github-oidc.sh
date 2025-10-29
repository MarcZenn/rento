#!/usr/bin/env bash

################################################################################
# GitHub Actions OIDC Infrastructure Deployment Script
################################################################################
#
# This script deploys the GitHub OIDC Provider and IAM Roles that allow
# GitHub Actions to authenticate with AWS without long-lived credentials.
#
# Usage:
#   ./deploy-github-oidc.sh [dev|prod|both]
#
# Examples:
#   ./deploy-github-oidc.sh dev      # Deploy development role only
#   ./deploy-github-oidc.sh prod     # Deploy production role only
#   ./deploy-github-oidc.sh both     # Deploy both (default)
#
# Prerequisites:
#   - AWS CLI configured with SSO profiles
#   - Appropriate AWS permissions to create IAM resources
#   - GitHub repository: marczenn/rento
#
# IMPORTANT:
#   - The OIDC Provider is created only ONCE per AWS account
#   - If it already exists, the script will use the existing provider
#   - Each environment gets its own IAM role
#
################################################################################

set -euo pipefail

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly TEMPLATE_FILE="${SCRIPT_DIR}/../cloudformation-github-oidc.yml"
readonly AWS_REGION="ap-northeast-1"
readonly GITHUB_ORG="marczenn"
readonly GITHUB_REPO="rento"

# AWS SSO Profiles
readonly DEV_PROFILE="rento-development-sso"
readonly PROD_PROFILE="rento-production-sso"

# Stack names
readonly DEV_STACK_NAME="rento-github-oidc-dev"
readonly PROD_STACK_NAME="rento-github-oidc-prod"

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

log_step() {
    echo -e "${CYAN}▶${NC} $*"
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
    log_step "Checking prerequisites..."

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

validate_template() {
    local profile=$1

    # Validate CloudFormation template
    log_info "Validating CloudFormation template syntax..."
    if aws cloudformation validate-template \
        --template-body "file://${TEMPLATE_FILE}" \
        --region "$AWS_REGION" \
        --profile "$profile" &> /dev/null; then
        log_success "Template validation passed"
    else
        log_error "CloudFormation template validation failed"
        log_error "Run this to see the error:"
        log_error "aws cloudformation validate-template --template-body file://${TEMPLATE_FILE} --region ${AWS_REGION} --profile ${profile}"
        exit 1
    fi
    echo ""
}

check_aws_sso() {
    local profile=$1
    local profile_name=$2

    log_step "Checking AWS SSO authentication for $profile_name..."

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

check_oidc_provider_exists() {
    local profile=$1

    log_info "Checking if GitHub OIDC Provider already exists..." >&2

    local provider_arn
    provider_arn=$(aws iam list-open-id-connect-providers \
        --profile "$profile" \
        --query 'OpenIDConnectProviderList[?contains(Arn, `token.actions.githubusercontent.com`)].Arn' \
        --output text 2>/dev/null || echo "")

    if [[ -n "$provider_arn" ]]; then
        log_success "GitHub OIDC Provider already exists: $provider_arn" >&2
        echo "$provider_arn"
        return 0
    else
        log_info "GitHub OIDC Provider does not exist - will create new one" >&2
        echo ""
        return 1
    fi
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
    local oidc_provider_arn=${5:-}

    print_header "Deploying GitHub OIDC Stack: $env_name"

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

        log_step "Updating stack: $stack_name"
        local operation="update-stack"
    else
        log_step "Creating new stack: $stack_name"
        local operation="create-stack"
    fi

    # Prepare parameters
    local params=(
        ParameterKey=Environment,ParameterValue="$environment"
        ParameterKey=GitHubOrg,ParameterValue="$GITHUB_ORG"
        ParameterKey=GitHubRepo,ParameterValue="$GITHUB_REPO"
    )

    # Add OIDC Provider ARN if it exists
    if [[ -n "$oidc_provider_arn" ]]; then
        params+=(ParameterKey=OIDCProviderArn,ParameterValue="$oidc_provider_arn")
        log_info "Using existing OIDC Provider: $oidc_provider_arn"
    else
        params+=(ParameterKey=OIDCProviderArn,ParameterValue="")
        log_info "Will create new OIDC Provider"
    fi

    # Deploy/Update stack
    log_info "Deploying CloudFormation stack..."
    log_info "Template: $TEMPLATE_FILE"
    log_info "Parameters:"
    log_info "  - Environment: $environment"
    log_info "  - GitHubOrg: $GITHUB_ORG"
    log_info "  - GitHubRepo: $GITHUB_REPO"
    echo ""

    # Run the CloudFormation command and show output in real-time
    set +e  # Temporarily disable exit on error
    aws cloudformation "$operation" \
        --stack-name "$stack_name" \
        --template-body "file://${TEMPLATE_FILE}" \
        --parameters "${params[@]}" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region "$AWS_REGION" \
        --profile "$profile"

    local exit_code=$?
    set -e  # Re-enable exit on error

    if [[ $exit_code -eq 0 ]]; then
        if [[ "$operation" == "create-stack" ]]; then
            log_success "Stack creation initiated"
        else
            log_success "Stack update initiated"
        fi
    else
        log_error "Failed to $operation (exit code: $exit_code)"
        log_error ""
        log_error "Common issues:"
        log_error "  1. IAM permissions - ensure your user can create IAM roles and OIDC providers"
        log_error "  2. OIDC provider already exists - check if it needs to be deleted first"
        log_error "  3. Role name conflict - role may already exist"
        log_error ""
        log_error "Debug command:"
        log_error "  aws cloudformation $operation \\"
        log_error "    --stack-name $stack_name \\"
        log_error "    --template-body file://${TEMPLATE_FILE} \\"
        log_error "    --parameters ${params[*]} \\"
        log_error "    --capabilities CAPABILITY_NAMED_IAM \\"
        log_error "    --region $AWS_REGION \\"
        log_error "    --profile $profile"
        return 1
    fi

    # Wait for stack operation to complete
    log_info "Waiting for stack operation to complete (this may take 1-2 minutes)..."

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
    display_stack_outputs "$stack_name" "$profile"

    # Extract and display GitHub secrets instructions
    display_github_secrets_instructions "$stack_name" "$profile" "$environment"

    log_success "$env_name GitHub OIDC stack deployed successfully!"
    echo ""
}

display_stack_outputs() {
    local stack_name=$1
    local profile=$2

    echo ""
    log_info "Stack Outputs:"
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --profile "$profile" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs[].[OutputKey,OutputValue]' \
        --output table
    echo ""
}

display_github_secrets_instructions() {
    local stack_name=$1
    local profile=$2
    local environment=$3

    print_separator

    # Get the role ARN
    local role_arn
    role_arn=$(aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --profile "$profile" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`GitHubActionsRoleArn`].OutputValue' \
        --output text)

    # Get the account ID
    local account_id
    account_id=$(aws sts get-caller-identity \
        --profile "$profile" \
        --region "$AWS_REGION" \
        --query 'Account' \
        --output text)

    local env_upper=$(echo "$environment" | tr '[:lower:]' '[:upper:]')

    echo ""
    log_step "📋 GitHub Secrets Configuration"
    echo ""
    echo "Add these secrets to your GitHub repository:"
    echo "https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/settings/secrets/actions"
    echo ""
    echo "Secret 1:"
    echo "  Name:  AWS_ROLE_ARN_${env_upper}"
    echo "  Value: ${role_arn}"
    echo ""
    echo "Secret 2:"
    echo "  Name:  AWS_ACCOUNT_ID_${env_upper}"
    echo "  Value: ${account_id}"
    echo ""
    print_separator
}

display_next_steps() {
    print_header "Next Steps"

    echo ""
    echo "1. Test the GitHub Actions workflow:"
    echo "   - Go to: https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/actions"
    echo "   - Run: 'Deploy Database Migrations' workflow"
    echo "   - Select environment: development"
    echo ""
    echo "2. Verify the deployment:"
    echo "   - Check CodeBuild console for successful build"
    echo "   - Verify database migrations ran successfully"
    echo ""

    print_separator
    log_success "GitHub OIDC setup complete!"
    echo ""
}

################################################################################
# Main Deployment Function
################################################################################

deploy_environment() {
    local env_type=$1
    local oidc_provider_arn=""

    case $env_type in
        dev)
            check_aws_sso "$DEV_PROFILE" "Development"
            validate_template "$DEV_PROFILE"

            # Check for existing OIDC provider
            if oidc_provider_arn=$(check_oidc_provider_exists "$DEV_PROFILE"); then
                # Provider exists, use it
                :
            else
                # Provider doesn't exist, will create new one
                oidc_provider_arn=""
            fi

            deploy_stack "$DEV_STACK_NAME" "$DEV_PROFILE" "development" "Development" "$oidc_provider_arn"
            ;;
        prod)
            check_aws_sso "$PROD_PROFILE" "Production"
            validate_template "$PROD_PROFILE"

            # Check for existing OIDC provider
            if oidc_provider_arn=$(check_oidc_provider_exists "$PROD_PROFILE"); then
                # Provider exists, use it
                :
            else
                # Provider doesn't exist, will create new one
                oidc_provider_arn=""
            fi

            deploy_stack "$PROD_STACK_NAME" "$PROD_PROFILE" "production" "Production" "$oidc_provider_arn"
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

    print_header "GitHub Actions OIDC Infrastructure Deployment"

    echo "Configuration:"
    echo "  Region:      $AWS_REGION"
    echo "  GitHub Org:  $GITHUB_ORG"
    echo "  GitHub Repo: $GITHUB_REPO"
    echo "  Deploy To:   $deploy_target"
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
            echo ""
            deploy_environment "dev"
            echo ""
            echo ""
            deploy_environment "prod"
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
