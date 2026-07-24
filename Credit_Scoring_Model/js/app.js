/**
 * Main Application Orchestrator
 * Controls View Routing, Theme Toggle, Auth State, Toast Notifications, Currency Formatting, & Dynamic Metrics State
 */

// Global INR Currency Formatter Helper
window.formatINR = function(amount) {
  if (amount === null || amount === undefined || isNaN(amount) || amount === '') {
    return '--';
  }
  return '₹' + Number(amount).toLocaleString('en-IN');
};

class App {
  constructor() {
    this.currentView = 'auth';
    this.isLoggedIn = false;
    this.user = {
      name: 'Manonmani R',
      email: 'manonmani.r@example.com',
      initials: 'MR'
    };
    this.hasPrediction = false;
    this.predictedMetrics = null;

    this.gauge = null;
    this.charts = null;
    this.predictor = null;
    this.loanCalc = null;
    this.init();
  }

  init() {
    this.setupTheme();
    this.setupNavigation();
    this.setupAuth();
    this.setupProfileSettings();

    document.addEventListener('DOMContentLoaded', () => {
      this.initModules();
      this.checkInitialAuthState();
    });
  }

  initModules() {
    if (window.CreditGauge) {
      this.gauge = new CreditGauge('gaugeContainer', null); // Initial null score
    }
    if (window.AnalyticsCharts) {
      this.charts = new AnalyticsCharts();
    }
    if (window.CreditPredictor) {
      this.predictor = new CreditPredictor();
    }
    if (window.LoanCalculator) {
      this.loanCalc = new LoanCalculator();
    }
  }

  checkInitialAuthState() {
    // Force start on Auth view if not logged in
    if (!this.isLoggedIn) {
      this.lockAppToAuth();
    } else {
      this.unlockApp();
      this.switchView('dashboard');
    }
    this.updateUserUI();
    this.renderDashboardPlaceholders();
  }

  lockAppToAuth() {
    const sidebar = document.getElementById('sidebarNav');
    const navbar = document.querySelector('.top-navbar');
    
    if (sidebar) sidebar.style.display = 'none';
    if (navbar) navbar.style.display = 'none';
    
    document.querySelector('.main-wrapper').style.marginLeft = '0';
    this.switchView('auth', true);
  }

  unlockApp() {
    const sidebar = document.getElementById('sidebarNav');
    const navbar = document.querySelector('.top-navbar');

    if (sidebar) sidebar.style.display = 'flex';
    if (navbar) navbar.style.display = 'flex';

    if (window.innerWidth > 768) {
      document.querySelector('.main-wrapper').style.marginLeft = 'var(--sidebar-width)';
    }
  }

  getInitials(name) {
    if (!name) return 'MR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  updateUserUI() {
    const name = this.user.name;
    const firstName = name.split(' ')[0];
    const initials = this.getInitials(name);

    // Hero Greeting
    const heroTitle = document.getElementById('heroGreetingTitle');
    if (heroTitle) {
      heroTitle.innerText = `Welcome, ${firstName}! 👋`;
    }

    // Avatar circles
    document.querySelectorAll('.avatar-circle').forEach(el => {
      el.innerText = initials;
    });

    // Profile names & emails
    document.querySelectorAll('.user-name').forEach(el => {
      el.innerText = name;
    });
    document.querySelectorAll('.user-email').forEach(el => {
      el.innerText = this.user.email;
    });

    const profileTitleName = document.getElementById('profileHeaderName');
    if (profileTitleName) {
      profileTitleName.innerText = name;
    }
  }

  setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButtons(savedTheme);

    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    themeToggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = e.currentTarget.getAttribute('data-theme-val');
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeButtons(theme);
        if (this.charts) this.charts.updateTheme();
        this.showToast(`Switched to ${theme} theme mode`, 'info');
      });
    });
  }

  updateThemeButtons(theme) {
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      const val = btn.getAttribute('data-theme-val');
      if (val === theme) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-item-btn[data-view]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!this.isLoggedIn && e.currentTarget.getAttribute('data-view') !== 'auth') {
          this.showToast('Please login or register to access the dashboard', 'warning');
          return;
        }
        const view = e.currentTarget.getAttribute('data-view');
        this.switchView(view);
      });
    });

    const mobileToggle = document.getElementById('mobileNavToggle');
    const sidebar = document.getElementById('sidebarNav');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Attach Logout triggers
    document.querySelectorAll('.logout-trigger-btn').forEach(btn => {
      btn.addEventListener('click', () => this.logout());
    });
  }

  switchView(viewId, force = false) {
    if (!this.isLoggedIn && viewId !== 'auth' && !force) {
      this.switchView('auth', true);
      return;
    }

    const views = document.querySelectorAll('.view-section');
    const navButtons = document.querySelectorAll('.nav-item-btn[data-view]');

    views.forEach(v => v.classList.remove('active'));
    navButtons.forEach(b => b.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewId}`);
    const targetNav = document.querySelector(`.nav-item-btn[data-view="${viewId}"]`);

    if (targetView) {
      targetView.classList.add('active');
      this.currentView = viewId;
    }
    if (targetNav) {
      targetNav.classList.add('active');
    }

    if (viewId === 'dashboard') {
      setTimeout(() => {
        if (this.gauge) {
          if (this.hasPrediction && this.predictedMetrics) {
            this.gauge.updateScore(this.predictedMetrics.credit_score);
          } else {
            this.gauge.setPlaceholderState();
          }
        }
        if (this.charts) this.charts.updateTheme();
      }, 50);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const sidebar = document.getElementById('sidebarNav');
    if (sidebar) sidebar.classList.remove('mobile-open');
  }

  setupAuth() {
    const authTabs = document.querySelectorAll('.auth-tab-btn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const linkToRegister = document.getElementById('authSwitchToRegister');
    const linkToLogin = document.getElementById('authSwitchToLogin');

    const switchAuthMode = (mode) => {
      authTabs.forEach(t => t.classList.remove('active'));
      const activeTab = document.querySelector(`.auth-tab-btn[data-auth-mode="${mode}"]`);
      if (activeTab) activeTab.classList.add('active');

      if (mode === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (signupForm) signupForm.style.display = 'none';
      } else {
        if (loginForm) loginForm.style.display = 'none';
        if (signupForm) signupForm.style.display = 'block';
      }
    };

    authTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const mode = e.currentTarget.getAttribute('data-auth-mode');
        switchAuthMode(mode);
      });
    });

    if (linkToRegister) {
      linkToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthMode('signup');
      });
    }

    if (linkToLogin) {
      linkToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthMode('login');
      });
    }

    // Handle Login Submit
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value || 'manonmani.r@example.com';
        const namePart = email.split('@')[0].replace('.', ' ');
        const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        
        this.login(name.includes('manonmani') ? 'Manonmani R' : name, email);
      });
    }

    // Handle Signup Submit
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName')?.value || 'Manonmani R';
        const email = document.getElementById('signupEmail')?.value || 'manonmani.r@example.com';
        const pass = document.getElementById('signupPassword')?.value;
        const confirmPass = document.getElementById('signupConfirmPassword')?.value;

        if (pass && confirmPass && pass !== confirmPass) {
          this.showToast('Passwords do not match!', 'danger');
          return;
        }

        this.login(name, email);
      });
    }

    // Quick Demo Login Button
    const demoBtn = document.getElementById('demoLoginBtn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        this.login('Manonmani R', 'manonmani.r@example.com');
      });
    }
  }

  login(name, email) {
    this.isLoggedIn = true;
    this.user = {
      name: name || 'Manonmani R',
      email: email || 'manonmani.r@example.com',
      initials: this.getInitials(name || 'Manonmani R')
    };

    this.updateUserUI();
    this.unlockApp();
    this.showToast(`Welcome, ${this.user.name}! Access granted.`, 'success');
    this.switchView('dashboard');
  }

  logout() {
    this.isLoggedIn = false;
    this.lockAppToAuth();
    this.showToast('Logged out successfully', 'info');
  }

  renderDashboardPlaceholders() {
    if (this.hasPrediction && this.predictedMetrics) return;

    // Set stat cards to placeholders
    const scoreVal = document.getElementById('dashScoreVal');
    const scoreMeta = document.getElementById('dashScoreMeta');
    const limitVal = document.getElementById('dashLimitVal');
    const limitMeta = document.getElementById('dashLimitMeta');
    const historyVal = document.getElementById('dashHistoryVal');
    const historyMeta = document.getElementById('dashHistoryMeta');
    const statusVal = document.getElementById('dashStatusVal');
    const statusMeta = document.getElementById('dashStatusMeta');

    if (scoreVal) scoreVal.innerHTML = `-- <span style="font-size: 1rem; color: var(--text-muted);">/ 850</span>`;
    if (scoreMeta) scoreMeta.innerHTML = `<span class="badge badge-warning"><i class="bx bx-time"></i> Pending Check</span> <span>No data available</span>`;

    if (limitVal) limitVal.innerText = `--`;
    if (limitMeta) limitMeta.innerHTML = `<span>0% Utilized</span> <span style="font-weight: 700;">₹0 used</span>`;

    if (historyVal) historyVal.innerText = `--`;
    if (historyMeta) historyMeta.innerHTML = `<span style="color: var(--text-muted);">No prediction data</span>`;

    if (statusVal) {
      statusVal.innerText = `--`;
      statusVal.style.color = 'var(--text-muted)';
    }
    if (statusMeta) statusMeta.innerHTML = `<span class="badge badge-warning">Pending Assessment</span>`;

    // Gauge placeholders
    if (this.gauge) this.gauge.setPlaceholderState();
  }

  updateDashboardMetrics(res) {
    this.hasPrediction = true;
    this.predictedMetrics = res;

    const isGood = res.prediction === 1;
    const limitINR = window.formatINR(res.max_loan_limit);

    // 1. Credit Score Card
    const scoreVal = document.getElementById('dashScoreVal');
    const scoreMeta = document.getElementById('dashScoreMeta');
    if (scoreVal) scoreVal.innerHTML = `${res.credit_score} <span style="font-size: 1rem; color: var(--text-muted);">/ 850</span>`;
    if (scoreMeta) {
      const badgeClass = isGood ? 'badge-success' : 'badge-danger';
      const icon = isGood ? 'bx-trending-up' : 'bx-trending-down';
      scoreMeta.innerHTML = `<span class="badge ${badgeClass}"><i class="bx ${icon}"></i> ${res.risk_label}</span> <span>Evaluated</span>`;
    }

    // 2. Credit Limit Card
    const limitVal = document.getElementById('dashLimitVal');
    const limitMeta = document.getElementById('dashLimitMeta');
    if (limitVal) limitVal.innerText = limitINR;
    if (limitMeta) {
      const usedINR = window.formatINR(res.max_loan_limit * 0.25);
      limitMeta.innerHTML = `<span>25% Utilized</span> <span style="font-weight: 700;">${usedINR} allocated</span>`;
      const fillBar = document.getElementById('dashLimitProgressFill');
      if (fillBar) fillBar.style.width = '25%';
    }

    // 3. Payment History Card
    const historyVal = document.getElementById('dashHistoryVal');
    const historyMeta = document.getElementById('dashHistoryMeta');
    if (historyVal) historyVal.innerText = `${Math.round(res.probability * 100)}%`;
    if (historyMeta) {
      const onTime = Math.round(res.probability * 35);
      historyMeta.innerHTML = `<span class="up">${onTime}/35 On-Time</span> <span>Confidence rating</span>`;
    }

    // 4. Loan Status Card
    const statusVal = document.getElementById('dashStatusVal');
    const statusMeta = document.getElementById('dashStatusMeta');
    if (statusVal) {
      statusVal.innerText = isGood ? 'Pre-Approved' : 'Needs Co-Signer';
      statusVal.style.color = isGood ? 'var(--emerald)' : 'var(--amber)';
    }
    if (statusMeta) {
      statusMeta.innerHTML = `<span class="badge badge-primary">${limitINR} Max Limit</span>`;
    }

    // Gauge
    if (this.gauge) {
      this.gauge.updateScore(res.credit_score);
    }

    // Recent Activity Table
    const tableBody = document.querySelector('.activity-table tbody');
    if (tableBody) {
      const todayStr = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>
          <div class="activity-item-flex">
            <div class="activity-icon" style="background: var(--primary-light); color: var(--primary);"><i class="bx bx-brain"></i></div>
            <div>
              <div style="font-weight: 700;">AI Credit Assessment</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">German Dataset Random Forest</div>
            </div>
          </div>
        </td>
        <td>${todayStr}</td>
        <td style="color: ${isGood ? 'var(--emerald)' : 'var(--rose)'}; font-weight: 700;">Score: ${res.credit_score}</td>
        <td><span class="badge ${isGood ? 'badge-success' : 'badge-danger'}">${res.risk_label}</span></td>
      `;
      tableBody.insertBefore(newRow, tableBody.firstChild);
    }

    // Update Loan Calculator baseline
    if (this.loanCalc && this.loanCalc.amountSlider) {
      this.loanCalc.amountSlider.value = Math.min(5000000, res.max_loan_limit);
      this.loanCalc.calculateEMI();
    }
  }

  setupProfileSettings() {
    const reportDownloadBtn = document.getElementById('downloadReportBtn');
    if (reportDownloadBtn) {
      reportDownloadBtn.addEventListener('click', () => {
        this.showToast(`Generating official Credit Report PDF for ${this.user.name}...`, 'info');
        setTimeout(() => {
          this.showToast('Credit Report downloaded successfully!', 'success');
        }, 1200);
      });
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'bx-info-circle';
    if (type === 'success') icon = 'bx-check-circle';
    if (type === 'warning') icon = 'bx-error-circle';
    if (type === 'danger') icon = 'bx-x-circle';

    toast.innerHTML = `
      <i class="bx ${icon}" style="font-size: 1.3rem;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

window.app = new App();
