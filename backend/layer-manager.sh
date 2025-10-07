#!/bin/bash

# Layer Version Management Helper Script
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGION=${AWS_REGION:-us-east-1}

show_help() {
    cat << EOF
Lambda Layer Version Management Helper

USAGE:
    $0 <command> [options]

COMMANDS:
    list-versions <layer-name>     List all versions of a layer
    get-latest <layer-name>        Get the latest version number of a layer
    update-config <env> <version>  Update layer version in configuration
    show-config                    Show current layer configuration
    validate-config                Validate all layer ARNs in configuration
    promote <from-env> <to-env>    Promote layer version from one env to another

EXAMPLES:
    $0 list-versions feature-flags-deps-dev
    $0 get-latest feature-flags-deps-prod
    $0 update-config prod 5
    $0 show-config
    $0 validate-config
    $0 promote staging prod

EOF
}

list_versions() {
    local layer_name=$1
    if [ -z "$layer_name" ]; then
        echo "❌ Layer name required"
        exit 1
    fi
    
    echo "📋 Versions for layer: $layer_name"
    aws lambda list-layer-versions \
        --layer-name "$layer_name" \
        --region "$REGION" \
        --query 'LayerVersions[].[Version,CreatedDate,Description]' \
        --output table
}

get_latest() {
    local layer_name=$1
    if [ -z "$layer_name" ]; then
        echo "❌ Layer name required"
        exit 1
    fi
    
    local latest_version=$(aws lambda list-layer-versions \
        --layer-name "$layer_name" \
        --region "$REGION" \
        --query 'LayerVersions[0].Version' \
        --output text)
    
    echo "Latest version of $layer_name: $latest_version"
}

update_config() {
    local env=$1
    local version=$2
    local config_file="$SCRIPT_DIR/layer-versions.env"
    
    if [ -z "$env" ] || [ -z "$version" ]; then
        echo "❌ Environment and version required"
        exit 1
    fi
    
    if [ ! -f "$config_file" ]; then
        echo "❌ Configuration file not found: $config_file"
        exit 1
    fi
    
    case $env in
        dev|DEV)
            sed -i.bak "s/\(DEV_LAYER_ARN=.*:\)[0-9]\+$/\1$version/" "$config_file"
            echo "✅ Updated DEV layer version to $version"
            ;;
        staging|STAGING)
            sed -i.bak "s/\(STAGING_LAYER_ARN=.*:\)[0-9]\+$/\1$version/" "$config_file"
            echo "✅ Updated STAGING layer version to $version"
            ;;
        prod|PROD|production)
            sed -i.bak "s/\(PROD_LAYER_ARN=.*:\)[0-9]\+$/\1$version/" "$config_file"
            echo "✅ Updated PROD layer version to $version"
            ;;
        *)
            echo "❌ Unknown environment: $env (use dev/staging/prod)"
            exit 1
            ;;
    esac
    
    rm -f "$config_file.bak"
    echo "📄 Updated configuration file: $config_file"
}

show_config() {
    local config_file="$SCRIPT_DIR/layer-versions.env"
    
    if [ ! -f "$config_file" ]; then
        echo "❌ Configuration file not found: $config_file"
        exit 1
    fi
    
    echo "📋 Current Layer Configuration:"
    echo "================================"
    
    source "$config_file" 2>/dev/null || true
    
    echo "AWS Account ID: ${AWS_ACCOUNT_ID:-'Not set'}"
    echo "AWS Region: ${AWS_REGION:-'Not set'}"
    echo ""
    echo "Environment Layer ARNs:"
    echo "  DEV:     $(eval echo ${DEV_LAYER_ARN:-'Not set'})"
    echo "  STAGING: $(eval echo ${STAGING_LAYER_ARN:-'Not set'})"
    echo "  PROD:    $(eval echo ${PROD_LAYER_ARN:-'Not set'})"
}

validate_config() {
    local config_file="$SCRIPT_DIR/layer-versions.env"
    
    if [ ! -f "$config_file" ]; then
        echo "❌ Configuration file not found: $config_file"
        exit 1
    fi
    
    echo "🔍 Validating Layer Configuration..."
    source "$config_file"
    
    local errors=0
    
    for env in DEV STAGING PROD; do
        local arn_var="${env}_LAYER_ARN"
        local arn=$(eval echo \$${arn_var})
        
        if [ -n "$arn" ]; then
            echo -n "Validating $env layer... "
            if aws lambda get-layer-version-by-arn --arn "$arn" --region "$REGION" > /dev/null 2>&1; then
                echo "✅"
            else
                echo "❌ Invalid ARN: $arn"
                ((errors++))
            fi
        else
            echo "⚠️  $env layer ARN not configured"
        fi
    done
    
    if [ $errors -eq 0 ]; then
        echo "✅ All configured layers are valid!"
    else
        echo "❌ $errors layer(s) failed validation"
        exit 1
    fi
}

promote() {
    local from_env=$1
    local to_env=$2
    local config_file="$SCRIPT_DIR/layer-versions.env"
    
    if [ -z "$from_env" ] || [ -z "$to_env" ]; then
        echo "❌ Source and target environments required"
        exit 1
    fi
    
    if [ ! -f "$config_file" ]; then
        echo "❌ Configuration file not found: $config_file"
        exit 1
    fi
    
    source "$config_file"
    
    # Get source version
    local from_var="${from_env^^}_LAYER_ARN"
    local from_arn=$(eval echo \$${from_var})
    
    if [ -z "$from_arn" ]; then
        echo "❌ Source environment $from_env not configured"
        exit 1
    fi
    
    # Extract version number
    local version=$(echo "$from_arn" | sed 's/.*://')
    
    echo "🚀 Promoting layer version $version from $from_env to $to_env"
    echo "Source ARN: $from_arn"
    
    # Update target environment
    update_config "$to_env" "$version"
    
    echo "✅ Promotion completed!"
    show_config
}

# Main script logic
case "${1:-help}" in
    list-versions)
        list_versions "$2"
        ;;
    get-latest)
        get_latest "$2"
        ;;
    update-config)
        update_config "$2" "$3"
        ;;
    show-config)
        show_config
        ;;
    validate-config)
        validate_config
        ;;
    promote)
        promote "$2" "$3"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac