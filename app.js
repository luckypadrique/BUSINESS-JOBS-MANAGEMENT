import {
    collection,
    getDocs,
    setDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

(function () {
    'use strict';

    // ==========================================
    // 1. DATA STORE / INITIAL SEED DATA
    // ==========================================

    const DEFAULT_PROFILE = {
        name: 'Acme Corporation',
        ownerName: 'Lucky Gonzales',
        email: 'luckyjgonzales09@gmail.com',
        contactNumber: '+1 (555) 019-2834',
        address: '123 Enterprise Way, Suite 400, Tech City, CA 94016'
    };

    window.addEventListener("load", function () {
        const emailInput = document.getElementById("login-email");
        const passwordInput = document.getElementById("login-password");

        if (emailInput) emailInput.value = "";
        if (passwordInput) passwordInput.value = "";
    });

    const DEFAULT_JOBS = [
        {
            id: 'job-1',
            title: 'Pattern Maker',
            description: 'Creates and adjusts clothing patterns based on garment designs and measurements. Ensures patterns are accurate and suitable for production.',
            location: 'Philippines',
            salary: '₱25,000–₱35,000/month',
            employmentType: 'Full-time',
            requirements: '2–5 years experience',
            status: 'Active',
            datePosted: '2026-09-21'
        },
        {
            id: 'job-2',
            title: 'Sewing Machine Operator',
            description: 'Operates industrial sewing machines and assembles garments while maintaining accurate and high-quality stitching.',
            location: 'Philippines',
            salary: '₱18,000–₱25,000/month',
            employmentType: 'Full-time',
            requirements: '2–5 years experience',
            status: 'Active',
            datePosted: '2026-09-21'
        },
        {
            id: 'job-3',
            title: 'Cutting Machine Operator',
            description: 'Cuts fabric accurately according to patterns, measurements, and production specifications while minimizing fabric waste.',
            location: 'Philippines',
            salary: '₱20,000–₱28,000/month',
            employmentType: 'Full-time',
            requirements: '2–5 years experience',
            status: 'Active',
            datePosted: '2026-09-21'
        },
        {
            id: 'job-4',
            title: 'Quality Control Inspector',
            description: 'Checks garments for defects, incorrect measurements, stitching problems, fabric issues, and overall quality before shipment.',
            location: 'Philippines',
            salary: '₱22,000–₱30,000/month',
            employmentType: 'Full-time',
            requirements: '2–5 years experience',
            status: 'Active',
            datePosted: '2026-09-21'
        },
        {
            id: 'job-5',
            title: 'Production Supervisor',
            description: 'Supervises production workers, monitors daily output, manages schedules, and ensures production targets and quality standards are achieved.',
            location: 'Philippines',
            salary: '₱30,000–₱45,000/month',
            employmentType: 'Full-time',
            requirements: '3–7 years experience',
            status: 'Active',
            datePosted: '2026-09-21'
        }
    ];

    const DB = {
        init() {
            if (!localStorage.getItem('biz_profile')) {
                localStorage.setItem('biz_profile', JSON.stringify(DEFAULT_PROFILE));
            }
            if (!localStorage.getItem('biz_jobs')) {
                localStorage.setItem('biz_jobs', JSON.stringify(DEFAULT_JOBS));
            }

            let storedApplicants = JSON.parse(localStorage.getItem('biz_applicants'));
            if (!storedApplicants || !Array.isArray(storedApplicants)) {
                storedApplicants = [];
            }
            localStorage.setItem('biz_applicants', JSON.stringify(storedApplicants));

            let storedAccounts = JSON.parse(localStorage.getItem('biz_applicant_accounts'));
            if (!storedAccounts || !Array.isArray(storedAccounts)) {
                storedAccounts = [];
            }
            localStorage.setItem('biz_applicant_accounts', JSON.stringify(storedAccounts));

            if (!localStorage.getItem('biz_auth')) {
                localStorage.setItem('biz_auth', JSON.stringify({ isLoggedIn: false, currentUser: null, role: 'owner' }));
            }
        },
        getProfile() {
            return JSON.parse(localStorage.getItem('biz_profile')) || DEFAULT_PROFILE;
        },
        saveProfile(profile) {
            localStorage.setItem('biz_profile', JSON.stringify(profile));
        },
        getJobs() {
            return JSON.parse(localStorage.getItem('biz_jobs')) || DEFAULT_JOBS;
        },
        saveJobs(jobs) {
            localStorage.setItem('biz_jobs', JSON.stringify(jobs));
        },
        getApplicants() {
            const saved = localStorage.getItem('biz_applicants');
            return saved ? JSON.parse(saved) : [];
        },
        saveApplicants(applicants) {
            localStorage.setItem('biz_applicants', JSON.stringify(applicants));
        },
        getApplicantAccounts() {
            const list = JSON.parse(localStorage.getItem('biz_applicant_accounts')) || [];
            return list.map(acc => ({
                ...acc,
                workExperience: acc.workExperience || [],
                education: acc.education || [],
                resumeFile: acc.resumeFile || null,
                diplomaFile: acc.diplomaFile || null,
                address: acc.address || '',
                dateOfBirth: acc.dateOfBirth || '',
                professionalSummary: acc.professionalSummary || '',
                yearsOfExperience: acc.yearsOfExperience || 0
            }));
        },
        saveApplicantAccounts(accounts) {
            localStorage.setItem('biz_applicant_accounts', JSON.stringify(accounts));
        },
        getAuth() {
            return JSON.parse(localStorage.getItem('biz_auth')) || { isLoggedIn: false, currentUser: null, role: 'owner' };
        },
        saveAuth(auth) {
            localStorage.setItem('biz_auth', JSON.stringify(auth));
        }
    };

    DB.init();

    // ==========================================
    // FIREBASE REAL-TIME CLOUD SYNC
    // ==========================================
    function listenToApplicantsRealtime() {
        try {
            if (!window.firebaseDB) return;

            onSnapshot(collection(window.firebaseDB, 'applicants'), (snapshot) => {
                const cloudApplicants = [];
                snapshot.forEach((item) => {
                    cloudApplicants.push(item.data());
                });

                if (cloudApplicants.length > 0) {
                    localStorage.setItem('biz_applicants', JSON.stringify(cloudApplicants));
                    applicants = DB.getApplicants();

                    if (typeof renderDashboard === 'function') renderDashboard();
                    if (typeof renderApplicants === 'function') renderApplicants();
                }
            });

            onSnapshot(collection(window.firebaseDB, 'applicantAccounts'), (snapshot) => {
                const cloudAccounts = [];
                snapshot.forEach((item) => {
                    cloudAccounts.push(item.data());
                });

                if (cloudAccounts.length > 0) {
                    localStorage.setItem('biz_applicant_accounts', JSON.stringify(cloudAccounts));
                }
            });
        } catch (error) {
            console.error('Firebase realtime listener error:', error);
        }
    }

    listenToApplicantsRealtime();

    async function saveApplicantsToFirebase(applicantsList) {
        try {
            if (!window.firebaseDB) return;
            for (const applicant of applicantsList) {
                if (!applicant.id) continue;
                await setDoc(doc(window.firebaseDB, 'applicants', applicant.id), applicant);
            }
        } catch (error) {
            console.error('Firebase applicant save error:', error);
        }
    }

    async function saveApplicantAccountsToFirebase(accountsList) {
        try {
            if (!window.firebaseDB) return;
            for (const account of accountsList) {
                if (!account.id) continue;
                await setDoc(doc(window.firebaseDB, 'applicantAccounts', account.id), account);
            }
        } catch (error) {
            console.error('Firebase account save error:', error);
        }
    }

    // ==========================================
    // 2. STATE VARIABLES
    // ==========================================
    let authState = DB.getAuth();
    let jobs = DB.getJobs();
    let applicants = DB.getApplicants();
    let profile = DB.getProfile();

    let activeView = 'dashboard';
    let deleteJobId = null;

    let uploadedRegisterResume = null;
    let uploadedRegisterDiploma = null;
    let uploadedMyResume = null;
    let uploadedMyDiploma = null;

    // ==========================================
    // 3. UI ELEMENT REFERENCES
    // ==========================================
    const el = {
        loginView: document.getElementById('view-login'),
        dashboardContainer: document.getElementById('dashboard-container'),
        viewDashboard: document.getElementById('view-dashboard'),
        viewJobList: document.getElementById('view-job-list'),
        viewApplicants: document.getElementById('view-applicants'),
        viewProfile: document.getElementById('view-profile'),
        viewTitle: document.getElementById('view-title'),

        navItems: document.querySelectorAll('.nav-item'),
        sidebar: document.getElementById('app-sidebar'),
        sidebarBackdrop: document.getElementById('sidebar-backdrop'),
        btnSidebarToggle: document.getElementById('btn-sidebar-toggle'),
        sidebarProfileName: document.getElementById('sidebar-profile-name'),
        sidebarAvatarInitials: document.getElementById('sidebar-avatar-initials'),
        headerBusinessName: document.getElementById('header-business-name'),
        headerOwnerName: document.getElementById('header-owner-name'),

        loginForm: document.getElementById('login-form'),
        loginEmail: document.getElementById('login-email'),
        loginPassword: document.getElementById('login-password'),
        loginErrorContainer: document.getElementById('login-error-container'),
        loginErrorText: document.getElementById('login-error-text'),
        errLoginEmail: document.getElementById('err-login-email'),
        errLoginPassword: document.getElementById('err-login-password'),

        metricTotalJobs: document.getElementById('metric-total-jobs'),
        metricActiveJobs: document.getElementById('metric-active-jobs'),
        metricCompletedJobs: document.getElementById('metric-completed-jobs'),
        metricTotalApplicants: document.getElementById('metric-total-applicants'),
        dashboardApplicantsList: document.getElementById('dashboard-applicants-list'),
        chartPercentageText: document.getElementById('chart-percentage-text'),
        chartPercentageFill: document.getElementById('chart-percentage-fill'),
        breakdownActive: document.getElementById('breakdown-active'),
        breakdownCompleted: document.getElementById('breakdown-completed'),

        btnPostJobTrigger: document.getElementById('btn-post-job-trigger'),
        jobsGrid: document.getElementById('jobs-grid-container'),
        jobSearchInput: document.getElementById('job-search-input'),
        filterJobStatus: document.getElementById('filter-job-status'),
        filterJobType: document.getElementById('filter-job-type'),

        modalJobFormBackdrop: document.getElementById('modal-job-form-backdrop'),
        jobForm: document.getElementById('job-form'),
        jobFormId: document.getElementById('job-form-id'),
        jobModalTitle: document.getElementById('job-modal-title'),
        jobTitle: document.getElementById('job-title'),
        jobLocation: document.getElementById('job-location'),
        jobSalary: document.getElementById('job-salary'),
        jobType: document.getElementById('job-type'),
        jobStatus: document.getElementById('job-status'),
        jobDescription: document.getElementById('job-description'),
        jobRequirements: document.getElementById('job-requirements'),
        btnSubmitJobForm: document.getElementById('btn-submit-job-form'),
        btnCancelJobModal: document.getElementById('btn-cancel-job-modal'),
        btnCloseJobModal: document.getElementById('btn-close-job-modal'),

        modalJobDetailBackdrop: document.getElementById('modal-job-detail-backdrop'),
        detailJobTitle: document.getElementById('detail-job-title'),
        detailJobStatus: document.getElementById('detail-job-status'),
        detailJobType: document.getElementById('detail-job-type'),
        detailJobLocation: document.getElementById('detail-job-location'),
        detailJobSalary: document.getElementById('detail-job-salary'),
        detailJobDate: document.getElementById('detail-job-date'),
        detailJobDescription: document.getElementById('detail-job-description'),
        detailJobRequirements: document.getElementById('detail-job-requirements'),
        btnCloseDetailModal: document.getElementById('btn-close-detail-modal'),
        btnCloseDetailModalFooter: document.getElementById('btn-close-detail-modal-footer'),

        modalDeleteConfirmBackdrop: document.getElementById('modal-delete-confirm-backdrop'),
        deleteConfirmJobTitle: document.getElementById('delete-confirm-job-title'),
        btnDeleteConfirm: document.getElementById('btn-delete-confirm'),
        btnDeleteCancel: document.getElementById('btn-delete-cancel'),

        applicantsList: document.getElementById('applicants-list'),
        applicantSearchInput: document.getElementById('applicant-search-input'),
        filterApplicantJob: document.getElementById('filter-applicant-job'),

        profileForm: document.getElementById('profile-form'),
        profileBizName: document.getElementById('profile-biz-name'),
        profileOwnerName: document.getElementById('profile-owner-name'),
        profileEmail: document.getElementById('profile-email'),
        profilePhone: document.getElementById('profile-phone'),
        profileAddress: document.getElementById('profile-address'),
        btnSaveProfile: document.getElementById('btn-save-profile'),

        toastContainer: document.getElementById('toast-container')
    };

    function showToast(message, type = 'success') {
        if (!el.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icon = type === 'success'
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

        toast.innerHTML = `${icon}<span>${escapeHTML(message)}</span>`;
        el.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s reverse forwards';
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function getInitials(name) {
        if (!name) return 'OB';
        return name.split(' ').map(part => part.charAt(0)).slice(0, 2).join('').toUpperCase();
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    function switchView(viewName) {
        if (viewName === 'logout') {
            handleLogout();
            return;
        }

        activeView = viewName;
        document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));

        let displayTitle = 'Dashboard';
        if (viewName === 'dashboard') {
            renderDashboard();
            if (el.viewDashboard) el.viewDashboard.classList.add('active');
            displayTitle = 'Dashboard Analytics';
        } else if (viewName === 'job-list') {
            renderJobList();
            if (el.viewJobList) el.viewJobList.classList.add('active');
            displayTitle = 'Job Openings';
        } else if (viewName === 'applicants') {
            renderApplicants();
            if (el.viewApplicants) el.viewApplicants.classList.add('active');
            displayTitle = 'Applicant Management';
        } else if (viewName === 'profile') {
            populateProfileForm();
            if (el.viewProfile) el.viewProfile.classList.add('active');
            displayTitle = 'Business Profile';
        } else if (viewName === 'my-resume') {
            const viewMyResume = document.getElementById('view-my-resume');
            if (viewMyResume) {
                renderMyResumeView();
                viewMyResume.classList.add('active');
                displayTitle = 'My Resume & Profile';
            }
        }

        if (el.viewTitle) el.viewTitle.textContent = displayTitle;

        el.navItems.forEach(item => {
            if (item.getAttribute('data-target') === viewName) item.classList.add('active');
            else item.classList.remove('active');
        });

        if (el.sidebar) el.sidebar.classList.remove('mobile-open');
        if (el.sidebarBackdrop) el.sidebarBackdrop.classList.remove('show');
    }

    el.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(item.getAttribute('data-target'));
        });
    });

    if (el.btnSidebarToggle) {
        el.btnSidebarToggle.addEventListener('click', () => {
            if (el.sidebar) el.sidebar.classList.toggle('mobile-open');
            if (el.sidebarBackdrop) el.sidebarBackdrop.classList.toggle('show');
        });
    }

    if (el.sidebarBackdrop) {
        el.sidebarBackdrop.addEventListener('click', () => {
            if (el.sidebar) el.sidebar.classList.remove('mobile-open');
            if (el.sidebarBackdrop) el.sidebarBackdrop.classList.remove('show');
        });
    }

    async function hashPassword(password) {
        if (window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            hash = ((hash << 5) - hash) + password.charCodeAt(i);
            hash |= 0;
        }
        return 'h_' + Math.abs(hash).toString(16);
    }

    window.showBusinessLogin = function () {
        const cardBiz = document.getElementById('card-business-login');
        const cardAppLogin = document.getElementById('card-applicant-login');
        const cardAppRegister = document.getElementById('card-applicant-register');
        if (cardBiz) cardBiz.style.display = 'block';
        if (cardAppLogin) cardAppLogin.style.display = 'none';
        if (cardAppRegister) cardAppRegister.style.display = 'none';
        clearLoginForm();
    };

    window.showApplicantLogin = function (prefillEmail = '') {
        const cardBiz = document.getElementById('card-business-login');
        const cardAppLogin = document.getElementById('card-applicant-login');
        const cardAppRegister = document.getElementById('card-applicant-register');
        if (cardBiz) cardBiz.style.display = 'none';
        if (cardAppLogin) cardAppLogin.style.display = 'block';
        if (cardAppRegister) cardAppRegister.style.display = 'none';

        if (prefillEmail && typeof prefillEmail === 'string') {
            const emailInput = document.getElementById('applicant-login-email');
            if (emailInput) emailInput.value = prefillEmail;
        }
    };

    window.showApplicantRegister = function () {
        const cardBiz = document.getElementById('card-business-login');
        const cardAppLogin = document.getElementById('card-applicant-login');
        const cardAppRegister = document.getElementById('card-applicant-register');
        if (cardBiz) cardBiz.style.display = 'none';
        if (cardAppLogin) cardAppLogin.style.display = 'none';
        if (cardAppRegister) cardAppRegister.style.display = 'block';
    };

    function checkAuthentication() {
        if (authState.isLoggedIn) {
            if (el.loginView) el.loginView.style.display = 'none';
            if (el.dashboardContainer) el.dashboardContainer.style.display = 'flex';

            updateBizHeaderInfo();
            switchView(activeView || 'dashboard');
        } else {
            if (el.dashboardContainer) el.dashboardContainer.style.display = 'none';
            if (el.loginView) {
                el.loginView.style.display = 'flex';
                el.loginView.classList.add('active');
            }
            clearLoginForm();
        }
    }

    function handleLogin(email, password) {
        const savedOwnerPassword = 'Lucky12345';
        if ((email === 'luckyjgonzales09@gmail.com' || email === 'owner@demo.com') && password === savedOwnerPassword) {
            authState = { isLoggedIn: true, currentUser: email, role: 'owner' };
            DB.saveAuth(authState);
            showToast('Logged in successfully!');
            checkAuthentication();
        } else {
            if (el.loginErrorContainer) el.loginErrorContainer.style.display = 'flex';
        }
    }

    function handleLogout() {
        authState = { isLoggedIn: false, currentUser: null, role: null };
        DB.saveAuth(authState);
        showToast('Logged out successfully.');
        checkAuthentication();
    }

    function clearLoginForm() {
        if (el.loginForm) el.loginForm.reset();
        if (el.loginErrorContainer) el.loginErrorContainer.style.display = 'none';
    }

    if (el.loginForm) {
        el.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin(el.loginEmail.value.trim(), el.loginPassword.value);
        });
    }

    function updateBizHeaderInfo() {
        if (el.sidebarProfileName) el.sidebarProfileName.textContent = profile.ownerName || 'Owner';
        if (el.sidebarAvatarInitials) el.sidebarAvatarInitials.textContent = getInitials(profile.ownerName);
        if (el.headerBusinessName) el.headerBusinessName.textContent = profile.name || 'Business';
        if (el.headerOwnerName) el.headerOwnerName.textContent = profile.ownerName || 'Owner';
    }

    function renderDashboard() {
        jobs = DB.getJobs();
        applicants = DB.getApplicants();

        if (el.metricTotalJobs) el.metricTotalJobs.textContent = jobs.length;
        if (el.metricActiveJobs) el.metricActiveJobs.textContent = jobs.filter(j => j.status === 'Active').length;
        if (el.metricCompletedJobs) el.metricCompletedJobs.textContent = jobs.filter(j => j.status === 'Completed').length;
        if (el.metricTotalApplicants) el.metricTotalApplicants.textContent = applicants.length;
    }

    function renderJobList() {
        jobs = DB.getJobs();
        if (!el.jobsGrid) return;

        el.jobsGrid.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h4>${escapeHTML(job.title)}</h4>
                <p>${escapeHTML(job.location)} - ${escapeHTML(job.salary)}</p>
                <span class="badge badge-success">${job.status}</span>
            </div>
        `).join('');
    }

    function renderApplicants() {
        applicants = DB.getApplicants();
        if (!el.applicantsList) return;

        el.applicantsList.innerHTML = applicants.map(app => `
            <tr>
                <td>${escapeHTML(app.name)}</td>
                <td>${escapeHTML(app.jobTitle)}</td>
                <td>${formatDate(app.dateApplied)}</td>
                <td><span class="badge badge-warning">${app.status}</span></td>
            </tr>
        `).join('');
    }

    function populateProfileForm() {
        profile = DB.getProfile();
        if (el.profileBizName) el.profileBizName.value = profile.name || '';
        if (el.profileOwnerName) el.profileOwnerName.value = profile.ownerName || '';
        if (el.profileEmail) el.profileEmail.value = profile.email || '';
        if (el.profilePhone) el.profilePhone.value = profile.contactNumber || '';
        if (el.profileAddress) el.profileAddress.value = profile.address || '';
    }

    function renderMyResumeView() { }

    function init() {
        checkAuthentication();
    }

    init();
})();