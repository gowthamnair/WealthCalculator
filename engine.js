// engine.js
class WealthEngine {
    constructor(inputs) {
        this.inputs = inputs; // currentSavable, totalIncome, currentSavings, initialInvested, increment, strategy
        this.goals = [];      // Array of {name, amount, years, priority}
        this.results = {
            totalProjectedWealth: 0,
            totalContributions: 0,
            totalCompounding: 0,
            goalStatus: [], // {name, priority, percentAchieved, status}
            yearlyPlan: []   // {year, monthlySavings, reallocationNotes}
        };
    }

    addGoal(name, amount, years, priority) {
        this.goals.push({ name, amount, years, priority });
        // Always keep goals sorted by priority (1 is highest)
        this.goals.sort((a, b) => a.priority - b.priority);
    }

    calculate() {
        const totalYears = Math.max(...this.goals.map(g => g.years), 0);
        if (totalYears === 0) return;

        let currentInvestedBalance = this.inputs.initialInvested;
        let currentCashBalance = this.inputs.currentSavings - this.inputs.initialInvested;
        let monthlySavable = this.inputs.currentSavable;
        const growthRate = WEALTH_CONFIG.growthRates[this.inputs.strategy];

        // Tracker for each goal's progress
        const goalTrackers = this.goals.map(g => ({
            ...g,
            savedSoFar: 0,
            isAchieved: false,
            achievedYear: null
        }));

        this.results.totalContributions = currentInvestedBalance;
        let runningTotalCompounding = 0;

        // --- Core Loop: Calculate year by year ---
        for (let year = 1; year <= totalYears; year++) {
            let annualSavingsContributed = 0;
            let reallocationNotes = "";

            // 1. Calculate growth on initial invested capital
            const investmentGrowth = currentInvestedBalance * growthRate;
            runningTotalCompounding += investmentGrowth;
            currentInvestedBalance += investmentGrowth;

            // 2. Allocate current year's savings pool to goals based on PRIORITY
            let savingsPoolRemaining = monthlySavable * 12;

            for (let tracker of goalTrackers) {
                if (tracker.years >= year && !tracker.isAchieved) {
                    const needed = tracker.amount - tracker.savedSoFar;
                    const contribution = Math.min(savingsPoolRemaining, needed);

                    tracker.savedSoFar += contribution;
                    savingsPoolRemaining -= contribution;
                    annualSavingsContributed += contribution;

                    // Goal achieved early!
                    if (tracker.savedSoFar >= tracker.amount) {
                        tracker.isAchieved = true;
                        tracker.achievedYear = year;
                        reallocationNotes += `Goal '${tracker.name}' achieved. Money reallocated. `;
                    }
                }
            }

            // 3. Add allocated savings to the invested balance (assuming immediate investment)
            currentInvestedBalance += annualSavingsContributed;
            this.results.totalContributions += annualSavingsContributed;

            // 4. Handle remaining savings pool (Capital Reallocation)
            // If money is left after highest priority goals are funded, it overflows to lower priority.
            // If *all* goals funded for this year, put excess back into general investment growth.
            if (savingsPoolRemaining > 0) {
                currentInvestedBalance += savingsPoolRemaining;
                this.results.totalContributions += savingsPoolRemaining;
                if (!reallocationNotes) reallocationNotes = "Excess savings reinvested.";
            }

            // 5. Store Yearly Breakdown
            this.results.yearlyPlan.push({
                year: year,
                monthlySavings: monthlySavable,
                reallocationNotes: reallocationNotes.trim()
            });

            // 6. Apply Annual Increment to Monthly Savable Income for NEXT year
            monthlySavable *= (1 + this.inputs.increment);
        }

        // --- Finalize Summary Data ---
        this.results.totalProjectedWealth = currentInvestedBalance;
        this.results.totalCompounding = runningTotalCompounding;
        this.results.goalStatus = goalTrackers.map(g => ({
            name: g.name,
            amount: g.amount,
            priority: g.priority,
            percentAchieved: Math.min(100, (g.savedSoFar / g.amount) * 100).toFixed(1),
            projectedOutcome: g.isAchieved ? `Achieved Year ${g.achievedYear}` : `${g.percentAchieved}% Funded`
        }));
    }

    getResults() {
        return this.results;
    }
}
