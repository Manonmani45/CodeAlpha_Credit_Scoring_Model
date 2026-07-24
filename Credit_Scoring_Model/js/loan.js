/**
 * Loan Eligibility & EMI Calculator Module (INR Currency)
 */

class LoanCalculator {
  constructor() {
    this.amountSlider = document.getElementById('loanAmountSlider');
    this.tenureSlider = document.getElementById('loanTenureSlider');
    this.rateSlider = document.getElementById('loanRateSlider');
    this.init();
  }

  init() {
    if (!this.amountSlider || !this.tenureSlider || !this.rateSlider) return;

    const updateCalc = () => this.calculateEMI();

    this.amountSlider.addEventListener('input', updateCalc);
    this.tenureSlider.addEventListener('input', updateCalc);
    this.rateSlider.addEventListener('input', updateCalc);

    this.calculateEMI();

    document.querySelectorAll('.apply-offer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.currentTarget.getAttribute('data-title') || 'Personal Loan';
        this.openApplyModal(title);
      });
    });
  }

  calculateEMI() {
    const P = parseFloat(this.amountSlider.value);
    const months = parseInt(this.tenureSlider.value);
    const annualRate = parseFloat(this.rateSlider.value);

    // Update labels using INR format
    document.getElementById('loanAmountVal').innerText = window.formatINR(P);
    document.getElementById('loanTenureVal').innerText = `${months} Months`;
    document.getElementById('loanRateVal').innerText = `${annualRate}%`;

    const r = (annualRate / 12) / 100;
    const emi = (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - P;

    const emiElem = document.getElementById('calcEmiVal');
    const interestElem = document.getElementById('calcInterestVal');
    const totalElem = document.getElementById('calcTotalVal');

    if (emiElem) emiElem.innerText = `${window.formatINR(Math.round(emi))}/mo`;
    if (interestElem) interestElem.innerText = window.formatINR(Math.round(totalInterest));
    if (totalElem) totalElem.innerText = window.formatINR(Math.round(totalPayment));

    // Update Eligibility Meter
    const score = (window.app && window.app.predictedMetrics) ? window.app.predictedMetrics.credit_score : 750;
    const maxAffordableEMI = (score / 850) * 150000;
    const ratio = Math.min(100, Math.round((maxAffordableEMI / emi) * 75));
    const meterElem = document.getElementById('loanEligibilityMeter');
    const badgeElem = document.getElementById('loanEligibilityBadge');

    if (meterElem) meterElem.style.width = `${Math.min(100, ratio)}%`;
    if (badgeElem) {
      if (ratio >= 80) {
        badgeElem.innerText = 'High Approval Probability (98%)';
        badgeElem.className = 'badge badge-success';
      } else if (ratio >= 50) {
        badgeElem.innerText = 'Moderate Approval Probability (75%)';
        badgeElem.className = 'badge badge-primary';
      } else {
        badgeElem.innerText = 'High Risk - Co-signer Required';
        badgeElem.className = 'badge badge-danger';
      }
    }
  }

  openApplyModal(loanTitle) {
    if (window.app) {
      window.app.showToast(`Application submitted for ${loanTitle}! An advisor will contact ${window.app.user.name} shortly.`, 'success');
    }
  }
}

window.LoanCalculator = LoanCalculator;
