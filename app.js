// app.js

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Binding & State ---
    let goalsData = [];
    const strategyMap = { 0: 'conservative', 1: 'realistic', 2: 'optimistic' };

    const DOM = {
        incrementSlider: document.getElementById('in-increment'),
        incrementLabel: document.getElementById('label-increment'),
        strategySlider: document.getElementById('in-strategy'),
        strategyLabels: document.querySelectorAll('.slider-labels span'),
        goalList: document.getElementById('goal-list'),
        btnAddGoal: document.getElementById('btn-add-goal'),
        btnCalculate: document.getElementById('btn-calculate'),
        
        // Output Nodes
        outWealth: document.getElementById('out-total-wealth'),
        outContrib: document.getElementById('out-total-contributions'),
        outCompound: document.getElementById('out-total-compounding'),
        tbodySummary: document.getElementById('tbody-summary'),
        tbodyYoy: document.getElementById('tbody-yoy')
    };

    // --- Static Event Listeners ---
    DOM.incrementSlider.addEventListener('input', (e) => {
        DOM.incrementLabel.textContent = `${e.target.value}%`;
    });

    DOM.strategySlider.addEventListener('input', (e) => {
        DOM.strategyLabels.forEach(label => label.classList.remove('active'));
        DOM.strategyLabels[e.target.value].classList.add('active');
    });

    // --- Dynamic Goal Management ---
    function renderGoals() {
        DOM.goalList.innerHTML = '';
        goalsData.forEach((goal, index) => {
            const goalHtml = `
                <div class="card" style="margin-bottom: 12px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <input type="text" placeholder="Goal Name" value="${goal.name}" 
                            onchange="updateGoal(${index}, 'name', this.value)" 
                            style="width: 60%; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: white; padding: 6px; border-radius: 6px;">
                        <button onclick="removeGoal(${index})" style="width: auto; padding: 6px 10px; background: transparent; border: 1px solid #ff453a; color: #ff453a; font-size: 12px;">Remove</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                        <div>
                            <label style="font-size: 11px;">Target Amount</label>
                            <input type="number" value="${goal.amount}" onchange="updateGoal(${index}, 'amount', this.value)" style="width: 100%; padding: 6px; font-size: 14px;">
                        </div>
                        <div>
                            <label style="font-size: 11px;">Years</label>
                            <input type="number" value="${goal.years}" onchange="updateGoal(${index}, 'years', this.value)" style="width: 100%; padding: 6px; font-size: 14px;">
                        </div>
                        <div>
                            <label style="font-size: 11px;">Priority (1=High)</label>
                            <input type="number" value="${goal.priority}" onchange="updateGoal(${index}, 'priority', this.value)" style="width: 100%; padding: 6px; font-size: 14px;">
                        </div>
                    </div>
                </div>
            `;
            DOM.goalList.insertAdjacentHTML('beforeend', goalHtml);
        });
    }

    window.updateGoal = (index, field, value) => {
        goalsData[index][field] = field === 'name' ? value : Number(value);
    };

    window.removeGoal = (index) => {
        goalsData.splice(index, 1);
        renderGoals();
    };

    DOM.btnAddGoal.addEventListener('click', () => {
        goalsData.push({ name: `Goal ${goalsData.length + 1}`, amount: 1000000, years: 10, priority: goalsData.length + 1 });
        renderGoals();
    });

    // --- Execution Pipeline ---
    const formatCurrency = (num) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(num);

    DOM.btnCalculate.addEventListener('click', () => {
        const inputs = {
            currentSavable: Number(document.getElementById('in-savable').value),
            currentSavings: Number(document.getElementById('in-savings').value),
            initialInvested: Number(document.getElementById('in-invested').value),
            increment: Number(DOM.incrementSlider.value) / 100,
            strategy: strategyMap[DOM.strategySlider.value]
        };

        const engine = new WealthEngine(inputs);
        goalsData.forEach(g => engine.addGoal(g.name, g.amount, g.years, g.priority));
        
        engine.calculate();
        const results = engine.getResults();

        // Update Overview Node Data
        DOM.outWealth.textContent = formatCurrency(results.totalProjectedWealth);
        DOM.outContrib.textContent = formatCurrency(results.totalContributions);
        DOM.outCompound.textContent = formatCurrency(results.totalCompounding);

        // Update Goal Summary Table
        DOM.tbodySummary.innerHTML = results.goalStatus.map(g => `
            <tr>
                <td>${g.name}</td>
                <td>${g.priority}</td>
                <td>${formatCurrency(g.amount)}</td>
                <td>--</td>
                <td>${g.projectedOutcome}</td>
            </tr>
        `).join('');

        // Update YoY Allocation Table
        DOM.tbodyYoy.innerHTML = results.yearlyPlan.map(y => `
            <tr>
                <td>Year ${y.year}</td>
                <td>${formatCurrency(y.monthlySavings)}</td>
                <td style="font-size: 12px; color: var(--text-secondary);">${y.reallocationNotes || 'Standard Allocation'}</td>
            </tr>
        `).join('');
    });

    // Initialize Default State
    DOM.btnAddGoal.click();
    DOM.btnCalculate.click();
});
