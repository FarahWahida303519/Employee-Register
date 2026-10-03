// cypress/e2e/error_detection.cy.js
// ==============================================================================
// ASSIGNMENT 1: COMPREHENSIVE ERROR DETECTION & VALIDATION TEST SUITE
// This test suite detects and asserts all client-side validation errors,
// security mismatches, mandatory compliance checks, and network submission failures.
// ==============================================================================

describe('Assignment 1: Comprehensive Error Detection & Validation Suite', () => {

    beforeEach(() => {
        // Authenticate session before accessing index.html so the auth guard allows entry
        window.sessionStorage.setItem('currentUser', 'hr.tester@nexcorp.com');
        window.localStorage.setItem('currentUser', 'hr.tester@nexcorp.com');
    });

    // ==========================================================================
    // 1. INPUT VALIDATION: NUMBERS IN NAME FIELDS
    // ==========================================================================

    it('TEST 1: Should detect error and redirect to Step 1 if First Name contains numbers', () => {
        cy.visit('http://localhost:3000/index.html');

        // Step 1: Intentionally type numbers into First Name
        cy.get('[data-cy="input-first-name"]').type('Sarah123'); // <-- INVALID (contains digits)
        cy.get('[data-cy="input-last-name"]').type('Connor');
        cy.get('[data-cy="input-email"]').type('sarah.connor@nexcorp.com');
        cy.get('[data-cy="btn-next-1"]').click();

        // Step 2: Valid credentials
        cy.get('[data-cy="input-password"]').type('SecurePass123!');
        cy.get('[data-cy="input-confirm-password"]').type('SecurePass123!');
        cy.get('[data-cy="btn-next-2"]').click();

        // Step 3: Address
        cy.get('[data-cy="input-street1"]').type('742 Evergreen Terrace');
        cy.get('[data-cy="btn-next-3"]').click();

        // Step 4: Role & Terms
        cy.get('[data-cy="checkbox-terms"]').check();
        cy.get('[data-cy="btn-next-4"]').click();

        // Step 5: Click Submit
        cy.get('[data-cy="btn-submit-final"]').click();

        // ASSERTIONS FOR ERROR DETECTION:
        // 1. System must block submission and redirect back to Step 1
        cy.get('[data-cy="page-title-1"]').should('be.visible');

        // 2. Specific First Name error message must become visible
        cy.get('[data-cy="err-first-name"]')
            .should('be.visible')
            .and('contain.text', 'First name is required and cannot contain numbers');

        // 3. Status box must indicate validation failure
        cy.get('[data-cy="api-result-box"]')
            .should('be.visible')
            .and('have.class', 'failure')
            .and('contain.text', 'Validation Error');
    });

    it('TEST 2: Should detect error if Last Name contains numbers', () => {
        cy.visit('http://localhost:3000/index.html');

        // Step 1: Valid first name, but Last Name has numbers
        cy.get('[data-cy="input-first-name"]').type('Sarah');
        cy.get('[data-cy="input-last-name"]').type('Connor99'); // <-- INVALID
        cy.get('[data-cy="input-email"]').type('sarah.connor@nexcorp.com');
        cy.get('[data-cy="btn-next-1"]').click();

        // Fill remaining steps
        cy.get('[data-cy="input-password"]').type('SecurePass123!');
        cy.get('[data-cy="input-confirm-password"]').type('SecurePass123!');
        cy.get('[data-cy="btn-next-2"]').click();
        cy.get('[data-cy="btn-next-3"]').click();
        cy.get('[data-cy="checkbox-terms"]').check();
        cy.get('[data-cy="btn-next-4"]').click();

        // Submit
        cy.get('[data-cy="btn-submit-final"]').click();

        // ASSERTIONS:
        cy.get('[data-cy="page-title-1"]').should('be.visible');
        cy.get('[data-cy="err-last-name"]')
            .should('be.visible')
            .and('contain.text', 'Last name is required and cannot contain numbers');
    });

    // ==========================================================================
    // 2. INPUT VALIDATION: INVALID EMAIL FORMAT
    // ==========================================================================

    it('TEST 3: Should detect error if Email format is missing "@"', () => {
        cy.visit('http://localhost:3000/index.html');

        // Step 1: Invalid email without @
        cy.get('[data-cy="input-first-name"]').type('Sarah');
        cy.get('[data-cy="input-last-name"]').type('Connor');
        cy.get('[data-cy="input-email"]').type('sarahconnor_at_nexcorp.com'); // <-- INVALID
        cy.get('[data-cy="btn-next-1"]').click();

        // Fill required credentials
        cy.get('[data-cy="input-password"]').type('SecurePass123!');
        cy.get('[data-cy="input-confirm-password"]').type('SecurePass123!');
        cy.get('[data-cy="btn-next-2"]').click();
        cy.get('[data-cy="btn-next-3"]').click();
        cy.get('[data-cy="checkbox-terms"]').check();
        cy.get('[data-cy="btn-next-4"]').click();

        // Submit
        cy.get('[data-cy="btn-submit-final"]').click();

        // ASSERTIONS:
        cy.get('[data-cy="page-title-1"]').should('be.visible');
        cy.get('[data-cy="err-email"]')
            .should('be.visible')
            .and('contain.text', 'Valid corporate email is required');
    });

    // ==========================================================================
    // 3. SECURITY VALIDATION: PASSWORD MISMATCH
    // ==========================================================================

    it('TEST 4: Should detect error and redirect to Step 2 if passwords do not match', () => {
        cy.visit('http://localhost:3000/index.html');

        // Step 1: Valid personal details
        cy.get('[data-cy="input-first-name"]').type('Sarah');
        cy.get('[data-cy="input-last-name"]').type('Connor');
        cy.get('[data-cy="input-email"]').type('sarah.connor@nexcorp.com');
        cy.get('[data-cy="btn-next-1"]').click();

        // Step 2: Mismatched passwords
        cy.get('[data-cy="input-password"]').type('CorrectPassword123!');
        cy.get('[data-cy="input-confirm-password"]').type('DifferentPassword999!'); // <-- MISMATCH
        cy.get('[data-cy="btn-next-2"]').click();

        // Advance to submit
        cy.get('[data-cy="btn-next-3"]').click();
        cy.get('[data-cy="checkbox-terms"]').check();
        cy.get('[data-cy="btn-next-4"]').click();

        // Submit
        cy.get('[data-cy="btn-submit-final"]').click();

        // ASSERTIONS:
        // 1. Should redirect user back to Step 2 (Account Credentials)
        cy.get('[data-cy="page-title-2"]').should('be.visible');

        // 2. Error message for password mismatch must be visible
        cy.get('[data-cy="err-confirm-password"]')
            .should('be.visible')
            .and('contain.text', 'Passwords must match and cannot be empty');
    });

    // ==========================================================================
    // 4. COMPLIANCE VALIDATION: TERMS & CONDITIONS UNCHECKED
    // ==========================================================================

    it('TEST 5: Should detect error and redirect to Step 4 if Terms & Conditions are not checked', () => {
        cy.visit('http://localhost:3000/index.html');

        // Fill Step 1
        cy.get('[data-cy="input-first-name"]').type('Sarah');
        cy.get('[data-cy="input-last-name"]').type('Connor');
        cy.get('[data-cy="input-email"]').type('sarah.connor@nexcorp.com');
        cy.get('[data-cy="btn-next-1"]').click();

        // Fill Step 2
        cy.get('[data-cy="input-password"]').type('SecurePass123!');
        cy.get('[data-cy="input-confirm-password"]').type('SecurePass123!');
        cy.get('[data-cy="btn-next-2"]').click();

        // Fill Step 3
        cy.get('[data-cy="btn-next-3"]').click();

        // Step 4: Leave terms unchecked!
        cy.get('[data-cy="checkbox-terms"]').should('not.be.checked');
        cy.get('[data-cy="btn-next-4"]').click();

        // Step 5: Submit
        cy.get('[data-cy="btn-submit-final"]').click();

        // ASSERTIONS:
        // 1. System must redirect back to Step 4 for missing terms
        cy.get('[data-cy="page-title-4"]').should('be.visible');

        // 2. Global status box displays validation failure
        cy.get('[data-cy="api-result-box"]')
            .should('be.visible')
            .and('have.class', 'failure')
            .and('contain.text', 'Validation Error');
    });

    // ==========================================================================
    // 5. NETWORK / SERVER SUBMISSION ERROR DETECTION ("Failed to fetch")
    // ==========================================================================

    it('TEST 6: Should detect submission network failure and display "Failed to fetch" error', () => {
        // Mock a network failure when submitting to the backend API
        cy.intercept('POST', '/api/register', { forceNetworkError: true }).as('networkCrash');

        cy.visit('http://localhost:3000/index.html');

        // Fill all required fields correctly
        cy.get('[data-cy="input-first-name"]').type('Sarah');
        cy.get('[data-cy="input-last-name"]').type('Connor');
        cy.get('[data-cy="input-email"]').type('sarah.connor@nexcorp.com');
        cy.get('[data-cy="btn-next-1"]').click();

        cy.get('[data-cy="input-password"]').type('SecurePass123!');
        cy.get('[data-cy="input-confirm-password"]').type('SecurePass123!');
        cy.get('[data-cy="btn-next-2"]').click();

        cy.get('[data-cy="btn-next-3"]').click();

        cy.get('[data-cy="checkbox-terms"]').check();
        cy.get('[data-cy="btn-next-4"]').click();

        // Click Final Submit
        cy.get('[data-cy="btn-submit-final"]').click();

        // ASSERTIONS:
        // 1. Verify the network intercept captured the failure
        cy.wait('@networkCrash');

        // 2. Result box must be visible with failure styling and exact error message
        cy.get('[data-cy="api-result-box"]')
            .should('be.visible')
            .and('have.class', 'failure')
            .and('contain.text', 'Submission failed: Failed to fetch');
    });

    // ==========================================================================
    // 6. LOGIN AUTHENTICATION ERROR DETECTION
    // ==========================================================================

    it('TEST 7: Should detect authentication errors on empty or invalid login credentials', () => {
        cy.visit('http://localhost:3000/login.html');

        // Scenario A: Click login with empty fields
        cy.get('[data-cy="btn-login"]').click();
        cy.get('[data-cy="login-message"]')
            .should('be.visible')
            .and('have.class', 'error')
            .and('contain.text', 'enter both corporate email and password');

        // Scenario B: Enter incorrect credentials
        cy.get('[data-cy="input-login-email"]').type('nonexistent.user@nexcorp.com');
        cy.get('[data-cy="input-login-password"]').type('WrongPassword999!');
        cy.get('[data-cy="btn-login"]').click();

        cy.get('[data-cy="login-message"]')
            .should('be.visible')
            .and('have.class', 'error')
            .and('contain.text', 'incorrect');
    });

});
