// app.js
document.addEventListener('DOMContentLoaded', () => {
    const incrementSlider = document.getElementById('in-increment');
    const incrementLabel = document.getElementById('label-increment');

    // Fix: Dynamic update for the slider
    incrementSlider.addEventListener('input', (e) => {
        incrementLabel.textContent = `${e.target.value}%`;
    });

    // Strategy slider dynamic update
    const strategySlider = document.getElementById('in-strategy');
    const strategyLabels = document.querySelectorAll('.slider-labels span');
    strategySlider.addEventListener('input', (e) => {
        strategyLabels.forEach(label => label.classList.remove('active'));
        strategyLabels[e.target.value].classList.add('active');
    });
});
