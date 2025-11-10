# Image Optimization Script for Windows PowerShell
# Fixes the arrow character encoding issue

param(
    [string]$ImageDir = "assets/images",
    [int]$Quality = 85
)

# Color output function
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Check if cwebp is installed
function Test-CWebP {
    try {
        $null = & cwebp -version 2>&1
        return $true
    }
    catch {
        return $false
    }
}

# Optimize single image
function Optimize-Image {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Quality = 85,
        [int]$Width = $null
    )
    
    try {
        $resizeParam = if ($Width) { "-resize $Width 0" } else { "" }
        
        if ($resizeParam) {
            & cwebp -q $Quality -resize $Width 0 $InputPath -o $OutputPath 2>&1 | Out-Null
        } else {
            & cwebp -q $Quality $InputPath -o $OutputPath 2>&1 | Out-Null
        }
        
        if (Test-Path $OutputPath) {
            $outputSize = (Get-Item $OutputPath).Length
            return $outputSize
        }
        return 0
    }
    catch {
        Write-ColorOutput "   Error: $($_.Exception.Message)" "Red"
        return 0
    }
}

# Main script
Write-ColorOutput "`nStarting image optimization..." "Cyan"

# Check for cwebp
if (-not (Test-CWebP)) {
    Write-ColorOutput "Error: cwebp not found!" "Red"
    Write-ColorOutput "Please install WebP tools:" "Yellow"
    Write-ColorOutput "  1. Download from: https://developers.google.com/speed/webp/download" "Yellow"
    Write-ColorOutput "  2. Extract and add to PATH" "Yellow"
    Write-ColorOutput "  3. Or install via Chocolatey: choco install webp" "Yellow"
    exit 1
}

Write-ColorOutput "cwebp found - ready to optimize!" "Green"

# Define critical images (Phase 1)
$criticalImages = @(
    @{ Name = "hero-bg"; Ext = ".jpg" },
    @{ Name = "website card"; Ext = ".webp" },
    @{ Name = "social media card"; Ext = ".webp" },
    @{ Name = "review 1"; Ext = ".webp" },
    @{ Name = "process-1"; Ext = ".jpg" }
)

# Responsive sizes
$sizes = @(1920, 1200, 800, 400)

Write-ColorOutput "`nPhase 1: Top 5 Critical Images" "Cyan"
Write-ColorOutput "=================================" "Cyan"

foreach ($img in $criticalImages) {
    $inputFile = Join-Path $ImageDir "$($img.Name)$($img.Ext)"
    
    if (-not (Test-Path $inputFile)) {
        Write-ColorOutput "`nSkipping: $($img.Name) (file not found)" "Yellow"
        continue
    }
    
    Write-ColorOutput "`nProcessing: $($img.Name)" "White"
    
    $originalSize = (Get-Item $inputFile).Length
    Write-ColorOutput "   Original size: $([math]::Round($originalSize/1KB, 2)) KB" "Gray"
    
    # Create optimized main version
    $outputPath = Join-Path $ImageDir "$($img.Name)-optimized.webp"
    $optimizedSize = Optimize-Image -InputPath $inputFile -OutputPath $outputPath -Quality $Quality
    
    if ($optimizedSize -gt 0) {
        $savings = [math]::Round((1 - $optimizedSize/$originalSize) * 100, 1)
        Write-ColorOutput "   Optimized: $([math]::Round($optimizedSize/1KB, 2)) KB (saved $savings%)" "Green"
        
        # Create responsive versions
        foreach ($width in $sizes) {
            $responsivePath = Join-Path $ImageDir "$($img.Name)-$width.webp"
            $responsiveSize = Optimize-Image -InputPath $inputFile -OutputPath $responsivePath -Quality $Quality -Width $width
            
            if ($responsiveSize -gt 0) {
                Write-ColorOutput "   Created: ${width}px = $([math]::Round($responsiveSize/1KB, 2)) KB" "Cyan"
            }
        }
    }
}

# Summary
Write-ColorOutput "`n=================================" "Cyan"
Write-ColorOutput "Optimization complete!" "Green"
Write-ColorOutput "`nNext steps:" "Yellow"
Write-ColorOutput "1. Update HTML to use -optimized.webp versions" "White"
Write-ColorOutput "2. Use picture elements for responsive images" "White"
Write-ColorOutput "3. Test with: python -m http.server 8000" "White"
Write-ColorOutput "`nSee picture-element-template.html for examples`n" "White"