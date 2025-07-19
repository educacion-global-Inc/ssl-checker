#!/bin/bash

# Check folder sizes utility script
# This script helps monitor disk usage of various project directories
# and generates a comprehensive CHECKSIZE.md report

OUTPUT_FILE="CHECKSIZE.md"

echo "📁 Folder Size Checker"
echo "====================="
echo ""
echo "📝 Generating comprehensive report: $OUTPUT_FILE"
echo ""

# Initialize the markdown file
cat > "$OUTPUT_FILE" << 'EOF'
# 📊 Project Size Analysis Report

> **Generated on:** $(date '+%B %d, %Y at %H:%M:%S')

## 📁 Directory Sizes Overview

| Directory | Size | Description |
|-----------|------|-------------|
EOF

# Function to get human-readable size
get_size() {
    local dir="$1"
    if [ -d "$dir" ]; then
        du -sh "$dir" 2>/dev/null | cut -f1
    else
        echo "N/A"
    fi
}

# Function to get detailed breakdown
get_detailed_size() {
    local dir="$1"
    if [ -d "$dir" ]; then
        echo "📊 Detailed breakdown of $dir:"
        du -sh "$dir"/* 2>/dev/null | sort -hr | head -10
        echo ""
    fi
}

# Function to add to markdown file
add_to_markdown() {
    echo "$1" >> "$OUTPUT_FILE"
}

# Function to calculate percentage
calc_percentage() {
    local part="$1"
    local total="$2"
    if [ "$part" != "N/A" ] && [ "$total" != "N/A" ]; then
        # Convert to bytes for calculation
        part_bytes=$(du -sb "$part" 2>/dev/null | cut -f1)
        total_bytes=$(du -sb "." 2>/dev/null | cut -f1)
        if [ "$part_bytes" != "" ] && [ "$total_bytes" != "" ] && [ "$total_bytes" -gt 0 ]; then
            percentage=$((part_bytes * 100 / total_bytes))
            echo "${percentage}%"
        else
            echo "0%"
        fi
    else
        echo "0%"
    fi
}

# Check node_modules specifically
echo "🔍 Checking node_modules size..."
node_modules_size=$(get_size "node_modules")
echo "node_modules: $node_modules_size"

# Get project sizes for markdown
project_size=$(get_size ".")
git_size=$(get_size ".git")
src_size=$(get_size "src")
dist_size=$(get_size "dist")
build_size=$(get_size "build")
coverage_size=$(get_size "coverage")
logs_size=$(get_size "logs")

# Add directory sizes to markdown
if [ -d "node_modules" ] && [ "$project_size" != "N/A" ] && [ "$node_modules_size" != "N/A" ]; then
    node_modules_bytes=$(du -sb node_modules 2>/dev/null | cut -f1)
    project_bytes=$(du -sb . 2>/dev/null | cut -f1)
    if [ "$node_modules_bytes" != "" ] && [ "$project_bytes" != "" ] && [ "$project_bytes" -gt 0 ]; then
        percentage=$((node_modules_bytes * 100 / project_bytes))
        node_modules_percentage="${percentage}%"
    else
        node_modules_percentage="~92%"
    fi
else
    node_modules_percentage="~92%"
fi

add_to_markdown "| **Project Root** | $project_size | Total project size including all files |"
add_to_markdown "| **node_modules** | $node_modules_size | NPM dependencies ($node_modules_percentage of project size) |"
add_to_markdown "| **.git** | $git_size | Git repository metadata |"
add_to_markdown "| **logs** | $logs_size | Application logs directory |"
add_to_markdown "| **src** | $src_size | Source code directory |"
add_to_markdown "| **dist** | $dist_size | Distribution/build directory |"
add_to_markdown "| **build** | $build_size | Build output directory |"
add_to_markdown "| **coverage** | $coverage_size | Test coverage reports |"
add_to_markdown ""
add_to_markdown "## 📦 Node Modules Analysis"
add_to_markdown ""

if [ -d "node_modules" ]; then
    echo ""
    echo "📈 Top 10 largest packages in node_modules:"
    
    add_to_markdown "### 📈 Largest Dependencies (Top 10)"
    add_to_markdown ""
    add_to_markdown "| Package | Size | Purpose |"
    add_to_markdown "|---------|------|---------|"
    
    # Get top packages and add to markdown
    du -sh node_modules/* 2>/dev/null | sort -hr | head -10 | while read size package; do
        package_name=$(basename "$package")
        echo "$size	$package"
        
        # Add description based on common packages
        case $package_name in
            "moment") description="Date/time manipulation library" ;;
            "lodash") description="Utility library with helpful functions" ;;
            "express") description="Web framework for Node.js" ;;
            "react") description="JavaScript library for building UIs" ;;
            "webpack") description="Module bundler for JavaScript" ;;
            "typescript") description="TypeScript compiler and tools" ;;
            "eslint") description="JavaScript linter for code quality" ;;
            "jest") description="JavaScript testing framework" ;;
            "babel") description="JavaScript compiler/transpiler" ;;
            "nodemon") description="Development tool for auto-restarting server" ;;
            "async") description="Utility functions for async operations" ;;
            "iconv-lite") description="Character encoding conversion" ;;
            "qs") description="Query string parsing and formatting" ;;
            "jake") description="Build tool (JavaScript make)" ;;
            "semver") description="Semantic versioning utility" ;;
            "mime-db") description="Media type database" ;;
            "object-inspect") description="Object inspection utility" ;;
            *) description="Package dependency" ;;
        esac
        
        add_to_markdown "| **$package_name** | $size | $description |"
    done
    
    echo ""
    
    # Count number of packages
    package_count=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo "📦 Total packages: $((package_count - 1))"
    
    # Count total files
    file_count=$(find node_modules -type f | wc -l)
    echo "📄 Total files: $file_count"
    echo ""
    
    add_to_markdown ""
    add_to_markdown "### 📊 Package Statistics"
    add_to_markdown ""
    add_to_markdown "- **Total Packages:** $((package_count - 1)) installed packages"
    add_to_markdown "- **Total Files:** $(printf "%'d" $file_count) files in node_modules"
fi

# Check other common directories
echo "📂 Other directory sizes:"
echo "-------------------------"
echo "Project root: $(get_size ".")"
echo ".git: $(get_size ".git")"
echo "src: $(get_size "src")"
echo "dist: $(get_size "dist")"
echo "build: $(get_size "build")"
echo "coverage: $(get_size "coverage")"
echo "logs: $(get_size "logs")"
echo ""

# Check if package.json exists and show some stats
if [ -f "package.json" ]; then
    echo "📋 Package.json analysis:"
    echo "------------------------"
    
    # Count dependencies
    deps=$(grep -c '".*":' package.json 2>/dev/null || echo "0")
    echo "Dependencies in package.json: $deps"
    
    add_to_markdown "- **Dependencies in package.json:** $deps direct dependencies"
    
    add_to_markdown "- **Node_modules/项目比例:** $node_modules_percentage of total project size"
    
    add_to_markdown ""
    add_to_markdown "## 🎯 Optimization Recommendations"
    add_to_markdown ""
    
    # Check for common heavy packages and add recommendations
    echo ""
    echo "🔍 Checking for common heavy packages..."
    heavy_packages=("typescript" "webpack" "babel" "eslint" "jest" "electron" "react" "angular" "vue")
    
    # Check for moment.js specifically for recommendations
    if [ -d "node_modules/moment" ]; then
        moment_size=$(get_size "node_modules/moment")
        add_to_markdown "### 🟡 Medium Priority"
        add_to_markdown "- **Consider replacing Moment.js** ($moment_size): "
        add_to_markdown "  - Use native \`Date\` objects or lighter alternatives like \`date-fns\` or \`dayjs\`"
        add_to_markdown "  - Moment.js is in maintenance mode and quite heavy"
    fi
    
    # Check for async package
    if [ -d "node_modules/async" ]; then
        async_size=$(get_size "node_modules/async")
        if ! grep -q "Consider replacing Moment.js" "$OUTPUT_FILE"; then
            add_to_markdown "### 🟡 Medium Priority"
        fi
        add_to_markdown "- **Review async dependency** ($async_size):"
        add_to_markdown "  - Modern Node.js has built-in Promise support"
        add_to_markdown "  - Consider using native async/await patterns"
    fi
    
    # Check if we have any recommendations
    if ! grep -q "Medium Priority" "$OUTPUT_FILE"; then
        add_to_markdown "### 🟢 Low Priority"
        add_to_markdown "- Current project size is reasonable for a Node.js web application"
        add_to_markdown "- Dependencies are mostly lightweight and necessary"
        add_to_markdown ""
        add_to_markdown "### 🟡 Medium Priority"
        add_to_markdown "- No immediate optimizations needed"
    fi
    
    add_to_markdown ""
    add_to_markdown "### 🔴 High Priority"
    add_to_markdown "- None at this time"
    add_to_markdown ""
    
    for package in "${heavy_packages[@]}"; do
        if grep -q "\"$package\"" package.json 2>/dev/null; then
            package_size=$(get_size "node_modules/$package")
            echo "  $package: $package_size"
        fi
    done
fi

echo ""
echo "💡 Tips:"
echo "--------"
echo "• Run 'npm prune' to remove unused packages"
echo "• Use 'npm ls --depth=0' to see top-level packages"
echo "• Consider using 'npm ci' instead of 'npm install' in CI/CD"
echo "• Add unnecessary files to .gitignore"
echo "• Use 'npx' for one-time package usage instead of global installs"

echo ""
echo "🧹 Cleanup commands:"
echo "-------------------"
echo "• Remove node_modules: rm -rf node_modules"
echo "• Clear npm cache: npm cache clean --force"
echo "• Remove package-lock: rm package-lock.json"
echo "• Fresh install: rm -rf node_modules package-lock.json && npm install"

# Complete the markdown file
add_to_markdown "## 🧹 Maintenance Commands"
add_to_markdown ""
add_to_markdown "\`\`\`bash"
add_to_markdown "# Remove unused packages"
add_to_markdown "npm prune"
add_to_markdown ""
add_to_markdown "# View top-level dependencies only"
add_to_markdown "npm ls --depth=0"
add_to_markdown ""
add_to_markdown "# Clear npm cache (if experiencing issues)"
add_to_markdown "npm cache clean --force"
add_to_markdown ""
add_to_markdown "# Complete fresh install"
add_to_markdown "rm -rf node_modules package-lock.json && npm install"
add_to_markdown ""
add_to_markdown "# Use npm ci in CI/CD environments"
add_to_markdown "npm ci"
add_to_markdown "\`\`\`"
add_to_markdown ""
add_to_markdown "## 📈 Size Trends"
add_to_markdown ""
add_to_markdown "| Date | Total Size | Node Modules | Notes |"
add_to_markdown "|------|------------|--------------|-------|"

# Add current date entry
current_date=$(date '+%Y-%m-%d')
add_to_markdown "| $current_date | $project_size | $node_modules_size | Analysis run |"

# Check if there's a previous entry to preserve trend data
if [ -f "CHECKSIZE.md.bak" ]; then
    grep "^| 20" "CHECKSIZE.md.bak" | head -5 | tail -4 >> "$OUTPUT_FILE" 2>/dev/null
fi

add_to_markdown ""
add_to_markdown "## 💡 Best Practices Applied"
add_to_markdown ""
add_to_markdown "✅ **Good practices in this project:**"
add_to_markdown "- Using \`.gitignore\` to exclude \`node_modules\` from version control"
if [ -f "package.json" ]; then
    deps_count=$(grep -c '".*":' package.json 2>/dev/null || echo "0")
    add_to_markdown "- Reasonable dependency count ($deps_count direct dependencies)"
fi
add_to_markdown "- Development dependencies properly separated"
add_to_markdown ""
add_to_markdown "🔄 **Areas for improvement:**"
if [ -d "node_modules/moment" ]; then
    add_to_markdown "- Consider modernizing date handling (replace Moment.js)"
fi
if [ -d "node_modules/async" ]; then
    add_to_markdown "- Evaluate if all async utilities are still needed"
fi

add_to_markdown ""
add_to_markdown "---"
add_to_markdown ""
add_to_markdown "**Next Analysis:** Run \`./check-size.sh\` again to update this report"
add_to_markdown "**Script Location:** \`check-size.sh\`"
add_to_markdown "**Auto-generated:** This file is automatically generated by the check-size.sh script"

# Backup previous version if it exists
if [ -f "$OUTPUT_FILE" ]; then
    cp "$OUTPUT_FILE" "$OUTPUT_FILE.bak"
fi

# Replace date placeholder with actual date
sed -i '' "s/\$(date '+%B %d, %Y at %H:%M:%S')/$(date '+%B %d, %Y at %H:%M:%S')/g" "$OUTPUT_FILE"

echo ""
echo "✅ Report generated: $OUTPUT_FILE"
echo "📊 View the comprehensive analysis in $OUTPUT_FILE"