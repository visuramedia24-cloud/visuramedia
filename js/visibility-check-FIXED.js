/**
 * VISIBILITY CHECK - WEBSITE PERFORMANCE ANALYZER (FIXED VERSION)
 * Visura Media Lead Generation Tool
 * 
 * FIXES:
 * - Now fetches ALL categories (performance, accessibility, best-practices, seo)
 * - Displays all 4 scores like PageSpeed Insights does
 * - Shows detailed metrics for each category
 */

// Google PageSpeed Insights API Configuration
// ⚠️ SECURITY NOTE: This API key is client-side visible (required for browser usage)
// IMPORTANT: Add HTTP referrer restrictions in Google Cloud Console:
// 1. Go to: https://console.cloud.google.com/apis/credentials
// 2. Edit this API key
// 3. Under "Application restrictions" → Select "HTTP referrers (web sites)"
// 4. Add your domain: visuramedia.de/* and www.visuramedia.de/*
// This prevents unauthorized usage from other domains
const PAGESPEED_API_KEY = 'AIzaSyAR71irjlfWeA1yNLZ9j-yyqD66H--rEto';
const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

// Authorized domains for this tool (additional client-side protection)
const AUTHORIZED_DOMAINS = ['visuramedia.de', 'www.visuramedia.de', 'localhost', '127.0.0.1'];

/**
 * Security: Check if current domain is authorized
 * Note: This is client-side only - real protection must be done via Google Cloud Console
 */
function isDomainAuthorized() {
    const hostname = window.location.hostname;
    return AUTHORIZED_DOMAINS.some(domain => hostname.includes(domain));
}

// Industry benchmarks for calculations
const industryData = {
    restaurant: {
        avgConversion: 3.5,
        avgTransactionValue: 45,
        avgMonthlyTraffic: 800,
        avgMonthlySearches: 2400,
        displayName: 'Gastronomie'
    },
    retail: {
        avgConversion: 2.5,
        avgTransactionValue: 85,
        avgMonthlyTraffic: 1200,
        avgMonthlySearches: 3200,
        displayName: 'Einzelhandel'
    },
    services: {
        avgConversion: 4.2,
        avgTransactionValue: 250,
        avgMonthlyTraffic: 600,
        avgMonthlySearches: 1800,
        displayName: 'Dienstleistungen'
    },
    health: {
        avgConversion: 5.5,
        avgTransactionValue: 120,
        avgMonthlyTraffic: 900,
        avgMonthlySearches: 2200,
        displayName: 'Gesundheit/Wellness'
    },
    professional: {
        avgConversion: 6.0,
        avgTransactionValue: 500,
        avgMonthlyTraffic: 400,
        avgMonthlySearches: 1200,
        displayName: 'Beratung/Freiberufler'
    },
    trades: {
        avgConversion: 4.8,
        avgTransactionValue: 380,
        avgMonthlyTraffic: 500,
        avgMonthlySearches: 1600,
        displayName: 'Handwerk'
    },
    other: {
        avgConversion: 3.0,
        avgTransactionValue: 150,
        avgMonthlyTraffic: 700,
        avgMonthlySearches: 2000,
        displayName: 'Allgemein'
    }
};

/**
 * HELPER FUNCTIONS FOR DYNAMIC TEXT
 */

// Get dynamic status based on score
function getScoreStatus(score) {
    if (score >= 90) return { icon: '✅', label: 'Exzellent', color: 'green' };
    if (score >= 75) return { icon: '⚠️', label: 'Gut', color: 'orange' };
    if (score >= 50) return { icon: '⚠️', label: 'Verbesserungsbedarf', color: 'orange' };
    return { icon: '❌', label: 'Kritisch', color: 'red' };
}

// Calculate realistic target score based on current performance
function calculateTargetScore(currentScore) {
    if (currentScore < 30) return 75; // Very poor → Decent
    if (currentScore < 50) return 85; // Poor → Good
    if (currentScore < 70) return 90; // Okay → Excellent
    return 95; // Already good → Near perfect
}

// Estimate realistic timeframe based on severity
function estimateTimeframe(currentScore) {
    if (currentScore < 30) return '4-6 Wochen';
    if (currentScore < 50) return '3-4 Wochen';
    if (currentScore < 70) return '2-3 Wochen';
    return '1-2 Wochen';
}

// Scale revenue estimate based on improvement potential
function estimateRevenue(currentScore, targetScore) {
    const improvement = targetScore - currentScore;
    const baseRevenue = 1500;
    
    // More improvement potential = higher revenue estimate
    const multiplier = improvement / 20; // 20 points = 1x, 40 points = 2x, etc.
    
    return Math.round(baseRevenue * multiplier / 100) * 100; // Round to nearest 100
}

// Calculate bounce rate based on LCP time
function calculateBounceRate(lcpSeconds) {
    // Research shows: 
    // 1-2.5s = ~30% bounce
    // 2.5-4s = ~50% bounce  
    // 4-8s = ~70% bounce
    // 8s+ = ~90%+ bounce
    
    if (lcpSeconds <= 2.5) return 30;
    if (lcpSeconds <= 4) return 50;
    if (lcpSeconds <= 8) return 70;
    if (lcpSeconds <= 15) return 90;
    return 95;
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
});

function initializeForm() {
    const form = document.getElementById('visibilityForm');
    
    if (!form) {
        return;
    }
    
    form.addEventListener('submit', handleFormSubmit);
    
    const inputs = form.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
    });
    
    const websiteField = form.querySelector('#website');
    if (websiteField) {
        websiteField.addEventListener('blur', validateField);
        websiteField.addEventListener('input', clearError);
    }
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    clearError({ target: field });
    
    if (!value && field.hasAttribute('required')) {
        showError(field, 'Dieses Feld ist erforderlich');
        return false;
    }
    
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showError(field, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
            return false;
        }
    }
    
    if (field.id === 'website' && value) {
        let urlValue = value;
        
        if (!urlValue.startsWith('http://') && !urlValue.startsWith('https://')) {
            urlValue = 'https://' + urlValue;
            field.value = urlValue;
        }
        
        try {
            new URL(urlValue);
        } catch (e) {
            showError(field, 'Bitte geben Sie eine gültige URL ein (z.B. visuramedia.de)');
            return false;
        }
    }
    
    return true;
}

function showError(field, message) {
    field.classList.add('border-red-500');
    
    let errorEl = field.parentElement.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.className = 'error-message text-red-500 text-sm mt-1';
        field.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
}

function clearError(event) {
    const field = event.target;
    field.classList.remove('border-red-500');
    
    const errorEl = field.parentElement.querySelector('.error-message');
    if (errorEl) {
        errorEl.remove();
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = document.getElementById('btnText');
    const originalText = btnText.textContent;
    
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        return;
    }
    
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
    
    const formData = {
        businessName: document.getElementById('businessName').value.trim(),
        website: document.getElementById('website').value.trim(),
        industry: document.getElementById('industry').value,
        email: document.getElementById('email').value.trim(),
        timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem('visibilityCheckData', JSON.stringify(formData));
    
    trackFormSubmission(formData);
    
    document.getElementById('hero-check').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
    
    // Run analysis with FULL API data (all categories)
    const pageSpeedData = await runAnalysisWithAPI(formData.website);
    
    const report = await generateReport(formData, pageSpeedData);
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    }
    
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('results').classList.add('reveal');
    
    setTimeout(() => {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * FIXED: Fetch ALL categories from PageSpeed API
 */
async function fetchPageSpeedData(url, strategy = 'mobile') {
    try {
        // Security check: Prevent API usage from unauthorized domains
        if (!isDomainAuthorized()) {
            console.error('⛔ Unauthorized domain detected. API access blocked.');
            throw new Error('This tool can only be used on authorized domains.');
        }

        // FIXED: Request ALL categories (performance, accessibility, best-practices, seo)
        const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
        const categoryParams = categories.map(cat => `category=${cat}`).join('&');

        const apiUrl = `${PAGESPEED_API_URL}?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&strategy=${strategy}&${categoryParams}`;


        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (response.status === 400) {
                throw new Error('Invalid website URL provided.');
            } else if (response.status === 403) {
                throw new Error('API authentication failed.');
            }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

/**
 * FIXED: Parse ALL categories from PageSpeed API response
 */
function parsePageSpeedData(data) {
    if (!data || !data.lighthouseResult) {
        return null;
    }
    
    const lighthouse = data.lighthouseResult;
    const audits = lighthouse.audits;
    const categories = lighthouse.categories;
    
    // Extract ALL scores (0-100)
    const metrics = {
        // MAIN SCORES
        performanceScore: Math.round(categories.performance?.score * 100 || 0),
        accessibilityScore: Math.round(categories.accessibility?.score * 100 || 0),
        bestPracticesScore: Math.round(categories['best-practices']?.score * 100 || 0),
        seoScore: Math.round(categories.seo?.score * 100 || 0),
        
        // CORE WEB VITALS
        fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
        lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
        tbt: audits['total-blocking-time']?.displayValue || 'N/A',
        cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
        speedIndex: audits['speed-index']?.displayValue || 'N/A',
        
        // NUMERIC VALUES
        fcpNumeric: audits['first-contentful-paint']?.numericValue || 0,
        lcpNumeric: audits['largest-contentful-paint']?.numericValue || 0,
        tbtNumeric: audits['total-blocking-time']?.numericValue || 0,
        clsNumeric: audits['cumulative-layout-shift']?.numericValue || 0,
        speedIndexNumeric: audits['speed-index']?.numericValue || 0,
        
        // RAW DATA for detailed analysis
        rawAudits: audits,
        rawCategories: categories
    };
    
        Performance: metrics.performanceScore,
        Accessibility: metrics.accessibilityScore,
        'Best Practices': metrics.bestPracticesScore,
        SEO: metrics.seoScore,
        'Core Web Vitals': {
            LCP: metrics.lcp,
            FCP: metrics.fcp,
            TBT: metrics.tbt,
            CLS: metrics.cls,
            'Speed Index': metrics.speedIndex
        }
    });
    
    return metrics;
}

async function runAnalysisWithAPI(websiteUrl) {
    const messages = [
        { text: 'Verbinde mit Google PageSpeed Insights...', progress: 15 },
        { text: 'Analysiere Performance...', progress: 30 },
        { text: 'Prüfe Accessibility...', progress: 50 },
        { text: 'Messe Best Practices...', progress: 70 },
        { text: 'Analysiere SEO...', progress: 85 },
        { text: 'Erstelle vollständigen Bericht...', progress: 100 }
    ];
    
    const progressBar = document.getElementById('progressBar');
    const loadingMessage = document.getElementById('loadingMessage');
    
    loadingMessage.textContent = messages[0].text;
    progressBar.style.width = `${messages[0].progress}%`;
    await new Promise(resolve => setTimeout(resolve, 500));
    
    loadingMessage.textContent = messages[1].text;
    progressBar.style.width = `${messages[1].progress}%`;
    
    // Fetch ALL data from API
    const fullData = await fetchPageSpeedData(websiteUrl, 'mobile');
    
    for (let i = 2; i < messages.length; i++) {
        loadingMessage.textContent = messages[i].text;
        progressBar.style.width = `${messages[i].progress}%`;
        await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    const metrics = parsePageSpeedData(fullData);
    
    return metrics;
}

async function generateReport(data, pageSpeedData = null) {
    const industry = industryData[data.industry] || industryData.other;
    
    let scores = {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0
    };
    
    let realMetrics = null;
    
    // Use real PageSpeed data if available
    if (pageSpeedData) {
        scores.performance = pageSpeedData.performanceScore;
        scores.accessibility = pageSpeedData.accessibilityScore;
        scores.bestPractices = pageSpeedData.bestPracticesScore;
        scores.seo = pageSpeedData.seoScore;
        realMetrics = pageSpeedData;
        
    } else {
        // Fallback to simulated scores
        const nameHash = hashCode(data.businessName);
        const baseScore = 20 + (nameHash % 40);
        scores.performance = Math.max(25, Math.min(65, baseScore + (nameHash % 20)));
        scores.accessibility = Math.max(70, Math.min(95, baseScore + 40));
        scores.bestPractices = Math.max(75, Math.min(100, baseScore + 50));
        scores.seo = Math.max(60, Math.min(90, baseScore + 30));
        
    }
    
    // Calculate overall score (average of all categories)
    const overallScore = Math.round(
        (scores.performance + scores.accessibility + scores.bestPractices + scores.seo) / 4
    );
    
    // Display ALL scores
    displayAllScores(scores, overallScore);
    
    // Populate dynamic problem section with calculated values
    populateProblemSection(scores, realMetrics);
    
    // Display real metrics if available
    if (realMetrics) {
        displayRealMetrics(realMetrics);
        
        const badge = document.getElementById('dataSourceBadge');
        if (badge) {
            badge.textContent = '✅ Echte Daten von Google PageSpeed Insights';
            badge.className = 'inline-block px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30';
        }
    } else {
        const badge = document.getElementById('dataSourceBadge');
        if (badge) {
            badge.textContent = '⚠️ API nicht verfügbar - Geschätzte Daten';
            badge.className = 'inline-block px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30';
        }
    }
    
    // Calculate opportunity
    const currentMonthlyCustomers = Math.round(industry.avgMonthlyTraffic * 0.015);
    const potentialMonthlyCustomers = Math.round(industry.avgMonthlyTraffic * (industry.avgConversion / 100));
    const customerGap = potentialMonthlyCustomers - currentMonthlyCustomers;
    const monthlyRevenueLoss = Math.round(customerGap * industry.avgTransactionValue);
    
    displayOpportunity({
        revenue: monthlyRevenueLoss,
        industry: industry.displayName
    });
    
    document.getElementById('resultBusinessName').textContent = data.businessName;
    
    // Update status based on overall score
    updateStatusDisplay(overallScore);
    
    // Send report via email
    try {
        await emailjs.send(
            'service_8was0z5',
            'template_dlfzzil',
            {
                to_email: data.email,
                from_email: data.email,
                business_name: data.businessName,
                website: data.website || 'Keine Website',
                industry: industry.displayName,
                timestamp: new Date().toLocaleString('de-DE'),
                overall_score: overallScore,
                performance_score: scores.performance,
                accessibility_score: scores.accessibility,
                best_practices_score: scores.bestPractices,
                seo_score: scores.seo,
                revenue_opportunity: `€${monthlyRevenueLoss.toLocaleString('de-DE')}`,
                status_text: getStatusText(overallScore)
            }
        );
    } catch (error) {
    }
    
    return {
        businessName: data.businessName,
        website: data.website,
        industry: data.industry,
        email: data.email,
        scores: {
            overall: overallScore,
            ...scores
        },
        metrics: realMetrics,
        opportunity: {
            monthlyRevenueLoss: monthlyRevenueLoss,
            currentCustomers: currentMonthlyCustomers,
            potentialCustomers: potentialMonthlyCustomers
        },
        timestamp: data.timestamp
    };
}

/**
 * NEW: Display ALL scores (Performance, Accessibility, Best Practices, SEO)
 */
function displayAllScores(scores, overall) {
    // Animate overall score
    animateNumber('overallScore', 0, overall, 1500);
    
    // Animate performance score (main one)
    setTimeout(() => {
        animateNumber('performanceScore', 0, scores.performance, 1000);
    }, 200);
    
    // Update the "good" scores display (SEO, Best Practices, Accessibility)
    const seoScoreEl = document.getElementById('displaySEOScore');
    const bestPracticesScoreEl = document.getElementById('displayBestPracticesScore');
    const accessibilityScoreEl = document.getElementById('displayAccessibilityScore');
    
    if (seoScoreEl) {
        setTimeout(() => animateNumber('displaySEOScore', 0, scores.seo, 1000), 300);
        // Set dynamic status for SEO
        const seoStatus = getScoreStatus(scores.seo);
        const seoStatusEl = document.getElementById('seoStatus');
        if (seoStatusEl) {
            seoStatusEl.textContent = `${seoStatus.icon} ${seoStatus.label}`;
            seoStatusEl.className = `text-sm text-${seoStatus.color}-300`;
        }
    }
    
    if (bestPracticesScoreEl) {
        setTimeout(() => animateNumber('displayBestPracticesScore', 0, scores.bestPractices, 1000), 400);
        // Set dynamic status for Best Practices
        const bpStatus = getScoreStatus(scores.bestPractices);
        const bpStatusEl = document.getElementById('bestPracticesStatus');
        if (bpStatusEl) {
            bpStatusEl.textContent = `${bpStatus.icon} ${bpStatus.label}`;
            bpStatusEl.className = `text-sm text-${bpStatus.color}-300`;
        }
    }
    
    if (accessibilityScoreEl) {
        setTimeout(() => animateNumber('displayAccessibilityScore', 0, scores.accessibility, 1000), 500);
        // Set dynamic status for Accessibility
        const a11yStatus = getScoreStatus(scores.accessibility);
        const a11yStatusEl = document.getElementById('accessibilityStatus');
        if (a11yStatusEl) {
            a11yStatusEl.textContent = `${a11yStatus.icon} ${a11yStatus.label}`;
            a11yStatusEl.className = `text-sm text-${a11yStatus.color}-300`;
        }
    }
    
    // Also update the duplicate performance score display if it exists
    const displayPerformanceScoreEl = document.getElementById('displayPerformanceScore');
    if (displayPerformanceScoreEl) {
        setTimeout(() => animateNumber('displayPerformanceScore', 0, scores.performance, 1000), 600);
    }
    
    // Log all scores
        'Overall': overall,
        'Performance': scores.performance,
        'Accessibility': scores.accessibility,
        'Best Practices': scores.bestPractices,
        'SEO': scores.seo
    });
}

/**
 * Populate all dynamic text in the problem section
 */
function populateProblemSection(scores, metrics) {
    const performanceScore = scores.performance;
    const averageScore = Math.round((scores.performance + scores.accessibility + scores.bestPractices + scores.seo) / 4);
    
    // Update "Das Problem" section with actual scores
    const avgScoreEl = document.getElementById('averageScoreText');
    const perfScoreEl = document.getElementById('performanceScoreText');
    
    if (avgScoreEl) {
        avgScoreEl.textContent = averageScore;
    }
    
    if (perfScoreEl) {
        perfScoreEl.textContent = performanceScore;
    }
    
    // Calculate and display bounce rate based on LCP
    if (metrics && metrics.lcpNumeric) {
        const lcpSeconds = (metrics.lcpNumeric / 1000).toFixed(1);
        const bounceRate = calculateBounceRate(parseFloat(lcpSeconds));
        
        const bounceRateEl = document.getElementById('bounceRateText');
        const lcpTimeEl = document.getElementById('lcpTimeText');
        
        if (bounceRateEl) {
            bounceRateEl.textContent = bounceRate;
        }
        
        if (lcpTimeEl) {
            lcpTimeEl.textContent = lcpSeconds;
        }
    }
    
    // Update growth potential scenario
    const targetScore = calculateTargetScore(performanceScore);
    const currentScoreEl = document.getElementById('currentScoreText');
    const targetScoreEl = document.getElementById('targetScoreText');
    
    if (currentScoreEl) {
        currentScoreEl.textContent = performanceScore;
    }
    
    if (targetScoreEl) {
        targetScoreEl.textContent = targetScore;
    }
    
    // Update timeframe and plan
    const timeframe = estimateTimeframe(performanceScore);
    const timeframeEl = document.getElementById('timeframeText');
    const planCurrentScoreEl = document.getElementById('planCurrentScore');
    const planTargetScoreEl = document.getElementById('planTargetScore');
    
    if (timeframeEl) {
        timeframeEl.textContent = timeframe;
    }
    
    if (planCurrentScoreEl) {
        planCurrentScoreEl.textContent = performanceScore;
    }
    
    if (planTargetScoreEl) {
        planTargetScoreEl.textContent = targetScore;
    }
    
    // Update revenue estimate
    const estimatedRevenue = estimateRevenue(performanceScore, targetScore);
    const revenueEstimateEl = document.getElementById('revenueEstimate');
    const monthlyLossEl = document.getElementById('monthlyLoss');
    
    if (revenueEstimateEl) {
        revenueEstimateEl.textContent = `€${estimatedRevenue.toLocaleString('de-DE')}`;
    }
    
    // Also update monthly loss (same value)
    if (monthlyLossEl) {
        monthlyLossEl.textContent = `€${estimatedRevenue.toLocaleString('de-DE')}`;
    }
    
    // Update LCP mention in strategy section
    if (metrics && metrics.lcpNumeric) {
        const lcpSeconds = (metrics.lcpNumeric / 1000).toFixed(1);
        const lcpStrategyEl = document.getElementById('lcpStrategyText');
        
        if (lcpStrategyEl) {
            lcpStrategyEl.textContent = lcpSeconds;
        }
    }
    
        averageScore,
        performanceScore,
        targetScore,
        timeframe,
        estimatedRevenue
    });
}

function displayRealMetrics(metrics) {
    const detailsList = document.querySelector('#performanceDetails');
    if (!detailsList) return;
    
    const getStatusIcon = (metric, value) => {
        const thresholds = {
            fcp: { good: 1800, poor: 3000 },
            lcp: { good: 2500, poor: 4000 },
            tbt: { good: 200, poor: 600 },
            cls: { good: 0.1, poor: 0.25 },
            speedIndex: { good: 3400, poor: 5800 }
        };
        
        const threshold = thresholds[metric];
        if (!threshold) return '❌';
        
        if (value <= threshold.good) return '✅';
        if (value <= threshold.poor) return '⚠️';
        return '❌';
    };
    
    const metricsHTML = `
        <li class="flex items-start gap-2">
            <span class="text-xl">${getStatusIcon('lcp', metrics.lcpNumeric)}</span>
            <span><strong>LCP:</strong> ${metrics.lcp} (Largest Contentful Paint)</span>
        </li>
        <li class="flex items-start gap-2">
            <span class="text-xl">${getStatusIcon('fcp', metrics.fcpNumeric)}</span>
            <span><strong>FCP:</strong> ${metrics.fcp} (First Contentful Paint)</span>
        </li>
        <li class="flex items-start gap-2">
            <span class="text-xl">${getStatusIcon('tbt', metrics.tbtNumeric)}</span>
            <span><strong>TBT:</strong> ${metrics.tbt} (Total Blocking Time)</span>
        </li>
        <li class="flex items-start gap-2">
            <span class="text-xl">${getStatusIcon('cls', metrics.clsNumeric)}</span>
            <span><strong>CLS:</strong> ${metrics.cls} (Cumulative Layout Shift)</span>
        </li>
        <li class="flex items-start gap-2">
            <span class="text-xl">${getStatusIcon('speedIndex', metrics.speedIndexNumeric)}</span>
            <span><strong>Speed Index:</strong> ${metrics.speedIndex}</span>
        </li>
        <li class="flex items-start gap-2 border-t border-gray-600 pt-3 mt-3">
            <span class="text-xl">📊</span>
            <div>
                <strong>Alle Scores:</strong><br>
                <span class="text-sm">
                    Performance: ${metrics.performanceScore}/100 | 
                    Accessibility: ${metrics.accessibilityScore}/100<br>
                    Best Practices: ${metrics.bestPracticesScore}/100 | 
                    SEO: ${metrics.seoScore}/100
                </span>
            </div>
        </li>
    `;
    
    detailsList.innerHTML = metricsHTML;
}

function displayOpportunity(data) {
    const formattedRevenue = `€${data.revenue.toLocaleString('de-DE')}`;
    
    const revenueEl = document.getElementById('revenueOpportunity');
    const monthlyLossEl = document.getElementById('monthlyLoss');
    const industryEl = document.getElementById('industryName');
    
    // Keep old ID for backward compatibility (though now also set by populateProblemSection)
    if (revenueEl) revenueEl.textContent = formattedRevenue;
    if (monthlyLossEl) monthlyLossEl.textContent = formattedRevenue;
    if (industryEl) industryEl.textContent = data.industry;
}

function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
            element.classList.add('score-reveal');
        }
        element.textContent = Math.round(current);
    }, 16);
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function getStatusText(score) {
    if (score >= 90) return 'Exzellent';
    if (score >= 75) return 'Gut';
    if (score >= 60) return 'Mittelmäßig';
    if (score >= 45) return 'Kritisch';
    return 'Alarmierend';
}

function updateStatusDisplay(score) {
    let statusText = getStatusText(score);
    let statusColor = 'from-red-500 to-orange-500';
    let warningBadge = '⚠️ KRITISCH';
    let warningBgColor = 'bg-red-500';
    let borderColor = 'border-red-500/50';
    
    if (score >= 90) {
        statusColor = 'from-green-400 to-emerald-500';
        warningBadge = '✅ EXZELLENT';
        warningBgColor = 'bg-green-500';
        borderColor = 'border-green-500/50';
    } else if (score >= 75) {
        statusColor = 'from-yellow-400 to-orange-400';
        warningBadge = '⚡ GUT';
        warningBgColor = 'bg-yellow-500';
        borderColor = 'border-yellow-500/50';
    } else if (score >= 60) {
        statusColor = 'from-orange-500 to-red-400';
        warningBadge = '⚠️ MITTELMÄSSIG';
        warningBgColor = 'bg-orange-500';
        borderColor = 'border-orange-500/50';
    }
    
    const overallScoreCard = document.querySelector('#results .glassmorphism.rounded-3xl.p-8');
    if (overallScoreCard) {
        overallScoreCard.className = `glassmorphism rounded-3xl p-8 md:p-12 mb-12 border-2 ${borderColor} relative overflow-hidden`;
    }
    
    const warningBadgeEl = document.querySelector('.absolute.top-6.right-6');
    if (warningBadgeEl) {
        warningBadgeEl.className = `absolute top-6 right-6 ${warningBgColor} text-white px-4 py-2 rounded-full text-sm font-bold`;
        warningBadgeEl.textContent = warningBadge;
    }
    
    const statusHeading = document.querySelector('#results h3');
    if (statusHeading) {
        statusHeading.innerHTML = `Ihre Website Performance: ${statusText}`;
    }
    
    const overallScoreSpan = document.getElementById('overallScore');
    if (overallScoreSpan) {
        overallScoreSpan.className = `text-transparent bg-clip-text bg-gradient-to-r ${statusColor}`;
    }
}

function trackFormSubmission(data) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'visibility_check_submit', {
            'industry': data.industry,
            'has_website': !!data.website,
            'event_category': 'Lead Generation',
            'event_label': 'Digital Dominanz Score'
        });
    }
    
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: 'Visibility Check',
            content_category: data.industry
        });
    }
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            event: 'visibility_check_submit',
            industry: data.industry,
            hasWebsite: !!data.website
        });
    }
}

function copyReportLink() {
    const url = window.location.href;
    const btnText = document.getElementById('copyBtnText');
    const originalText = btnText.textContent;
    
    navigator.clipboard.writeText(url).then(() => {
        btnText.textContent = '✓ Kopiert!';
        setTimeout(() => {
            btnText.textContent = originalText;
        }, 2000);
    }).catch(() => {
        alert('Link: ' + url);
    });
}

// Expose function globally
window.copyReportLink = copyReportLink;
