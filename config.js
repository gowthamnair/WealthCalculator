// config.js
const WEALTH_CONFIG = {
    // Defines the base growth rates for the 'General' strategy
    growthRates: {
        conservative: 0.040, // 4.0%
        realistic: 0.072,    // 7.2%
        optimistic: 0.100     // 10.0%
    },
    // Used for descriptive disclaimers, but not for inflation-adjusting the goals.
    assumedInflation: 0.025 // 2.5% reference
};
