#!/bin/bash

# ====================================
# IMAGE OPTIMIZATION SCRIPT - BASH
# ====================================
# Prerequisites: Install cwebp
# Ubuntu/Debian: sudo apt-get install webp
# macOS: brew install webp
# Windows (Git Bash): Download from https://developers.google.com/speed/webp/download

echo "🚀 Starting image optimization..."
echo ""

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp not found. Please install:"
    echo "   Ubuntu/Debian: sudo apt-get install webp"
    echo "   macOS: brew install webp"
    echo "   Windows: https://developers.google.com/speed/webp/download"
    exit 1
fi

echo "✅ cwebp found"
echo ""
echo "📊 Phase 1: Top 5 Critical Images"
echo "================================="
echo ""

total_saved=0
files_processed=0

# Function to optimize image
optimize_image() {
    local image_path="$1"
    local quality="$2"
    shift 2
    local sizes=("$@")
    
    if [ ! -f "$image_path" ]; then
        echo "⚠️  Skipping: $image_path (not found)"
        return
    fi
    
    local original_size=$(stat -f%z "$image_path" 2>/dev/null || stat -c%s "$image_path" 2>/dev/null)
    local filename="${image_path%.*}"
    local extension="${image_path##*.}"
    local directory=$(dirname "$image_path")
    local basename=$(basename "$filename")
    
    echo "📸 Processing: $basename.$extension"
    echo "   Original size: $((original_size / 1024)) KB"
    
    # Convert to WebP at original size
    local output_path="${filename}-optimized.webp"
    
    if cwebp -q "$quality" "$image_path" -o "$output_path" > /dev/null 2>&1; then
        local new_size=$(stat -f%z "$output_path" 2>/dev/null || stat -c%s "$output_path" 2>/dev/null)
        local saved=$((original_size - new_size))
        total_saved=$((total_saved + saved))
        local percentage=$((saved * 100 / original_size))
        
        echo "   ✅ Optimized: $((new_size / 1024)) KB (saved ${percentage}%)"
        
        # Generate responsive sizes
        for width in "${sizes[@]}"; do
            local responsive_path="${filename}-${width}.webp"
            cwebp -q "$quality" -resize "$width" 0 "$image_path" -o "$responsive_path" > /dev/null 2>&1
            
            if [ -f "$responsive_path" ]; then
                local responsive_size=$(stat -f%z "$responsive_path" 2>/dev/null || stat -c%s "$responsive_path" 2>/dev/null)
                echo "   📐 Created: ${width}px → $((responsive_size / 1024)) KB"
            fi
        done
        
        files_processed=$((files_processed + 1))
    else
        echo "   ❌ Error processing $basename"
    fi
    
    echo ""
}

# Optimize critical images
optimize_image "assets/images/hero-bg.webp" 75 1920 1200 800
optimize_image "assets/images/website card.webp" 85 1200 800 400
optimize_image "assets/images/social media card.webp" 85 1200 800 400
optimize_image "assets/images/review 1.webp" 85 1200 800 400
optimize_image "assets/images/process-1.jpg" 82 1200 800 400

echo "================================="
echo "✅ Optimization Complete!"
echo ""
echo "📊 Summary:"
echo "   Files processed: $files_processed"
echo "   Total saved: $((total_saved / 1024)) KB ($((total_saved / 1024 / 1024)) MB)"
echo ""
echo "📝 Next Steps:"
echo "   1. Update HTML to use <picture> elements"
echo "   2. Test images on different screen sizes"
echo "   3. Run Lighthouse to verify improvements"
echo ""
