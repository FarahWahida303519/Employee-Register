describe('Registration Form Spec', () => {
    it('passes', () => {
        cy.visit('http://localhost:3000');
    });
});

describe('Registration Form Validation Spec', () => {

    beforeEach(() => {
        cy.visit('http://localhost:3000');
    });

    // TEST 1: Check if typing numbers in First Name shows an error
    it('should show an error if First Name contains numbers', () => {
        // 1. Type numbers into the First Name field
        cy.get('[data-cy="input-first-name"]').type('John123');

        // 2. Fill in other required fields
        cy.get('[data-cy="input-last-name"]').type('Doe');
        cy.get('[data-cy="input-email"]').type('john@example.com');

        // 3. Go to final step and click Submit Application
        cy.get('[data-cy="btn-next-1"]').click();
        cy.get('[data-cy="btn-next-2"]').click();
        cy.get('[data-cy="btn-next-3"]').click();
        cy.get('[data-cy="checkbox-terms"]').check();
        cy.get('[data-cy="btn-next-4"]').click();
        cy.get('[data-cy="btn-submit-final"]').click();

        // 4. Verify the system redirects back to Step 1 and shows the error message
        cy.get('[data-cy="page-title-1"]').should('be.visible');
        cy.get('[data-cy="err-first-name"]').should('be.visible');
    });

});