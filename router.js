// router.js - Session Management & Step Router for NexCorp Employee Portal

// ======================================================
// 1. AUTHENTICATION CHECK & SESSION STATE
// ======================================================

// Check session in both sessionStorage and localStorage
const currentUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');

// Global logout helper for navbars across all pages
window.logout = function () {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    window.location.replace('login.html');
};

// Check whether current page is an authenticated page
const isAuthPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html');

if (!isAuthPage && !currentUser) {
    // If not authenticated, redirect to login page
    window.location.replace('login.html');
}

// Update user info badge on navbar if present
function updateNavUserBadge() {
    const userBadge = document.getElementById('navUserDisplay');
    if (userBadge && currentUser) {
        userBadge.textContent = currentUser;
    }
}

// ======================================================
// 2. STEP NAVIGATION FOR EMPLOYEE REGISTRATION FORM
// ======================================================

function navigateToStep(stepNumber) {
    // 1. Hide all step containers
    const steps = document.querySelectorAll('.step-content');
    steps.forEach(function (step) {
        step.classList.remove('active');
    });

    // 2. Update step button active states if present
    const navButtons = document.querySelectorAll('.nav-buttons button');
    navButtons.forEach(function (btn) {
        btn.classList.remove('step-active');
        const target = parseInt(btn.getAttribute('data-step-target') || '0', 10);
        if (target === stepNumber) {
            btn.classList.add('step-active');
        }
    });

    // 3. Find and activate selected step
    const targetStep = document.getElementById(`step-${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
        window.location.hash = `step${stepNumber}`;

        // If user enters Step 5, update the review summary
        if (stepNumber === 5 && typeof window.updateStep5Summary === 'function') {
            window.updateStep5Summary();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error(`Step element #step-${stepNumber} not found.`);
    }
}

// Make navigateToStep available globally for inline onclick handlers
window.navigateToStep = navigateToStep;

// ======================================================
// 3. ROUTER INITIALIZATION
// ======================================================

document.addEventListener('DOMContentLoaded', function () {
    updateNavUserBadge();

    // Check if on registration form with steps
    if (document.getElementById('step-1')) {
        const currentHash = window.location.hash.replace('#step', '');
        let startStep = currentHash ? parseInt(currentHash, 10) : 1;

        if (isNaN(startStep) || startStep < 1 || startStep > 5) {
            startStep = 1;
        }

        navigateToStep(startStep);
    }
});