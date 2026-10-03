describe('Employee Registration - Submission Error Test', () => {

    beforeEach(() => {
        // 1. Set the user login session so you don't get kicked to the login page
        window.sessionStorage.setItem('currentUser', 'test.student@example.com');
        window.localStorage.setItem('currentUser', 'test.student@example.com');

        // 2. Open the registration form running on localhost
        cy.visit('http://localhost:3000/index.html');
    });

    it('should detect when form submission fails and shows the error box', () => {
        // --- STEP 1: Personal Details ---
        cy.get('[data-cy="input-first-name"]').type('Sarah');
        cy.get('[data-cy="input-last-name"]').type('Connor');
        cy.get('[data-cy="input-email"]').type('sarah@example.com');
        cy.get('[data-cy="btn-next-1"]').click();

        // --- STEP 2: Security Credentials ---
        cy.get('[data-cy="input-password"]').type('Password123!');
        cy.get('[data-cy="input-confirm-password"]').type('Password123!');
        cy.get('[data-cy="btn-next-2"]').click();

        // --- STEP 3: Address ---
        cy.get('[data-cy="input-street1"]').type('123 Main Street');
        cy.get('[data-cy="btn-next-3"]').click();

        // --- STEP 4: Profile & Terms ---
        cy.get('[data-cy="checkbox-terms"]').check();
        cy.get('[data-cy="btn-next-4"]').click();

        // --- STEP 5: Review & Submit ---
        // Click the final submit button
        cy.get('[data-cy="btn-submit-final"]').click();

        // DETECT THE ERROR:
        // Assert that the result box is visible and displays the failure message
        cy.get('[data-cy="api-result-box"]')
            .should('be.visible')
            .and('have.class', 'failure')
            .and('contain.text', 'Submission failed');
    });

});