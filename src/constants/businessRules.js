/**
 * Business Rules and Constants
 * 
 * Contains all hardcoded values and business logic parameters
 * used throughout the application.
 */

export const CAMPAIGN = {
    END_DATE: '2025-11-27',
    CBB_EXTRA_EARNINGS_THRESHOLD: 129,
    CBB_EXTRA_EARNINGS_AMOUNT: 200,
};

export const PRICING = {
    TELENOR_FAMILY_DISCOUNT: 50,
    CBB_BASE_EARNINGS: 100,
    CBB_MIX_EARNINGS: 100,
    DEFAULT_STREAMING_PRICE: 100,
};

export const OPTIMIZER = {
    DEFAULT_MAX_PLANS: 3,
    DEFAULT_MAX_LINES: 5,
    DEFAULT_MIN_SAVINGS: 500,

    // Earnings thresholds for additional cost allowance
    EARNINGS_HIGH_THRESHOLD: 2500,
    EARNINGS_MEDIUM_THRESHOLD: 1500,

    // Allowed additional cost based on earnings
    MAX_ADDITIONAL_COST_HIGH: 2000,
    MAX_ADDITIONAL_COST_MEDIUM: 1500,
    MAX_ADDITIONAL_COST_LOW: 1000,

    // Scoring
    INEFFICIENCY_PENALTY: 1000,
    WASTED_SLOT_PENALTY: 600,
    SAVINGS_PRIORITY_BONUS: 100000,
    FULL_COVERAGE_BONUS: 100,

    // Discount adjustment
    MAX_DISCOUNT_FROM_EARNINGS_PERCENT: 0.6,
    MAX_DISCOUNT_FROM_COST_PERCENT: 0.5,
    COST_THRESHOLD_FOR_DISCOUNT: 300,
};
