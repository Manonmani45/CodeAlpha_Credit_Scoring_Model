/**
 * FinTech Charts Module
 * Renders interactive Chart.js line and doughnut charts for Dashboard analytics
 */

class AnalyticsCharts {
  constructor() {
    this.trendChart = null;
    this.breakdownChart = null;
    this.init();
  }

  init() {
    // Wait for Chart.js CDN to load if needed
    if (typeof Chart === 'undefined') {
      setTimeout(() => this.init(), 100);
      return;
    }

    this.renderTrendChart();
    this.renderBreakdownChart();
  }

  renderTrendChart() {
    const ctx = document.getElementById('creditTrendChart');
    if (!ctx) return;

    if (this.trendChart) this.trendChart.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.35)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Credit Score',
          data: [710, 725, 740, 755, 770, 785],
          borderColor: '#2563eb',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#7c3aed',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            titleColor: isDark ? '#f8fafc' : '#0f172a',
            bodyColor: isDark ? '#94a3b8' : '#64748b',
            borderColor: 'rgba(37, 99, 235, 0.2)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          },
          y: {
            min: 650,
            max: 850,
            grid: { color: gridColor },
            ticks: { color: textColor, stepSize: 50, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          }
        }
      }
    });
  }

  renderBreakdownChart() {
    const ctx = document.getElementById('factorBreakdownChart');
    if (!ctx) return;

    if (this.breakdownChart) this.breakdownChart.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#f8fafc' : '#0f172a';

    this.breakdownChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Payment History', 'Amounts Owed', 'Credit Age', 'New Credit', 'Credit Mix'],
        datasets: [{
          data: [35, 30, 15, 10, 10],
          backgroundColor: [
            '#2563eb',
            '#7c3aed',
            '#06b6d4',
            '#10b981',
            '#f59e0b'
          ],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: textColor,
              font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw}% impact`
            }
          }
        }
      }
    });
  }

  updateTheme() {
    this.renderTrendChart();
    this.renderBreakdownChart();
  }
}

window.AnalyticsCharts = AnalyticsCharts;
