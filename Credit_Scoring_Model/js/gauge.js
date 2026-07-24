/**
 * FinTech Credit Gauge Module
 * Renders an interactive, animated radial arc SVG gauge with score needle
 */

class CreditGauge {
  constructor(containerId, initialScore = null) {
    this.container = document.getElementById(containerId);
    this.score = initialScore;
    this.minScore = 300;
    this.maxScore = 850;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.renderSVG();
    if (this.score !== null) {
      this.updateScore(this.score);
    } else {
      this.setPlaceholderState();
    }
  }

  renderSVG() {
    this.container.innerHTML = `
      <svg viewBox="0 0 300 170" width="100%" height="170" style="overflow: visible;">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ef4444" />
            <stop offset="35%" stop-color="#f59e0b" />
            <stop offset="70%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#10b981" />
          </linearGradient>
          <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Background Track -->
        <path d="M 40 140 A 110 110 0 0 1 260 140" 
              fill="none" 
              stroke="var(--border-subtle)" 
              stroke-width="18" 
              stroke-linecap="round" />

        <!-- Gradient Active Score Track -->
        <path id="gaugeArc" 
              d="M 40 140 A 110 110 0 0 1 260 140" 
              fill="none" 
              stroke="url(#gaugeGradient)" 
              stroke-width="18" 
              stroke-linecap="round"
              stroke-dasharray="345.5" 
              stroke-dashoffset="0" />

        <!-- Scale Ticks -->
        <text x="30" y="162" fill="var(--text-muted)" font-size="10" font-weight="600">300</text>
        <text x="85" y="65" fill="var(--text-muted)" font-size="10" font-weight="600">580</text>
        <text x="150" y="38" fill="var(--text-muted)" font-size="10" font-weight="600">670</text>
        <text x="210" y="65" fill="var(--text-muted)" font-size="10" font-weight="600">740</text>
        <text x="260" y="162" fill="var(--text-muted)" font-size="10" font-weight="600">850</text>

        <!-- Animated Needle Group -->
        <g id="gaugeNeedleGroup" transform="rotate(-90 150 140)" style="transition: transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);">
          <!-- Needle Shaft -->
          <line x1="150" y1="140" x2="150" y2="45" 
                stroke="var(--text-main)" 
                stroke-width="3.5" 
                stroke-linecap="round" 
                filter="url(#needleGlow)" />
          <!-- Needle Pivot Center -->
          <circle cx="150" cy="140" r="9" fill="var(--primary)" stroke="#ffffff" stroke-width="3" />
        </g>
      </svg>
    `;
  }

  setPlaceholderState() {
    const needleGroup = document.getElementById('gaugeNeedleGroup');
    if (needleGroup) {
      needleGroup.setAttribute('transform', `rotate(-90 150 140)`);
    }

    const numberElem = document.getElementById('gaugeScoreNumber');
    const ratingElem = document.getElementById('gaugeScoreRating');

    if (numberElem) numberElem.innerText = '--';
    if (ratingElem) {
      ratingElem.innerText = 'Pending Check';
      ratingElem.className = 'score-rating badge-warning';
    }
  }

  updateScore(score) {
    if (score === null || isNaN(score)) {
      this.setPlaceholderState();
      return;
    }

    this.score = Math.max(this.minScore, Math.min(this.maxScore, score));
    
    // Map score 300..850 to angle -90deg..+90deg
    const percentage = (this.score - this.minScore) / (this.maxScore - this.minScore);
    const angle = -90 + (percentage * 180);

    const needleGroup = document.getElementById('gaugeNeedleGroup');
    if (needleGroup) {
      needleGroup.setAttribute('transform', `rotate(${angle} 150 140)`);
    }

    let rating = 'Poor';
    let ratingClass = 'badge-danger';
    if (this.score >= 740) {
      rating = 'Excellent';
      ratingClass = 'badge-success';
    } else if (this.score >= 670) {
      rating = 'Good';
      ratingClass = 'badge-primary';
    } else if (this.score >= 580) {
      rating = 'Fair';
      ratingClass = 'badge-warning';
    }

    const numberElem = document.getElementById('gaugeScoreNumber');
    const ratingElem = document.getElementById('gaugeScoreRating');

    if (numberElem) {
      this.animateNumber(numberElem, parseInt(numberElem.innerText) || 300, this.score, 1200);
    }
    if (ratingElem) {
      ratingElem.innerText = rating;
      ratingElem.className = `score-rating ${ratingClass}`;
    }
  }

  animateNumber(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      element.innerText = current;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
}

window.CreditGauge = CreditGauge;
