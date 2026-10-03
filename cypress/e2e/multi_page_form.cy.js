describe('Multi-Step Registration Form', () => {
    beforeEach(() => {
        // Intercept API call for registration
        cy.intercept('POST', '/api/register', {
            statusCode: 200,
            body: {
                message: 'Registration successful',
                insertedUserId: 'USER-12345'
            }
        }).as('registerUser');

        // Visit the local server or file path
        cy.visit('index.html');
    });

    it('should complete the entire multi-step form successfully (Happy Path)', () => {
        // --- STEP 1: Personal Information ---
        cy.get('[data-cy="page-title-1"]').should('be.visible');
        cy.get('[data-cy="input-first-name"]').type('John');
        cy.get('[data-cy="input-middle-name"]').type('A.');
        cy.get('[data-cy="input-last-name"]').type('Doe');
        cy.get('[data-cy="input-email"]').type('john.doe@example.com');
        cy.get('[data-cy="input-phone"]').type('+1234567890');
        cy.get('[data-cy="input-dob"]').type('1995-05-15');
        cy.get('[data-cy="input-gender-male"]').check();
        cy.get('[data-cy="select-nationality"]').select('US');
        cy.get('[data-cy="input-national-id"]').type('NAT-998877');
        cy.get('[data-cy="btn-next-1"]').click();

        // --- STEP 2: Account Credentials ---
        cy.get('[data-cy="page-title-2"]').should('be.visible');
        cy.get('[data-cy="input-username"]').type('johndoe95');
        cy.get('[data-cy="input-password"]').type('SecretPass123!');
        cy.get('[data-cy="input-confirm-password"]').type('SecretPass123!');
        cy.get('[data-cy="select-security-question"]').select('pet');
        cy.get('[data-cy="input-security-answer"]').type('Fluffy');
        cy.get('[data-cy="checkbox-2fa"]').check();
        cy.get('[data-cy="btn-next-2"]').click();

        // --- STEP 3: Address Details ---
        cy.get('[data-cy="page-title-3"]').should('be.visible');
        cy.get('[data-cy="input-street1"]').type('123 Main Street');
        cy.get('[data-cy="input-city"]').type('New York');
        cy.get('[data-cy="input-state"]').type('NY');
        cy.get('[data-cy="input-postal-code"]').type('10001');
        cy.get('[data-cy="select-country"]').select('US');
        cy.get('[data-cy="btn-next-3"]').click();

        // --- STEP 4: Preferences & Profile ---
        cy.get('[data-cy="page-title-4"]').should('be.visible');
        cy.get('[data-cy="input-occupation"]').type('Developer');
        cy.get('[data-cy="input-company"]').type('Tech Corp');
        cy.get('[data-cy="input-experience"]').type('5');
        cy.get('[data-cy="input-annual-income"]').type('85000');
        cy.get('[data-cy="select-currency"]').select('USD');
        cy.get('[data-cy="textarea-bio"]').type('Full-stack JavaScript developer.');
        cy.get('[data-cy="checkbox-terms"]').check();
        cy.get('[data-cy="btn-next-4"]').click();

        // --- STEP 5: Review & Submit ---
        cy.get('[data-cy="page-title-5"]').should('be.visible');

        // Verify summary details match input
        cy.get('[data-cy="summary-first-name"]').should('have.text', 'John');
        cy.get('[data-cy="summary-email"]').should('have.text', 'john.doe@example.com');
        cy.get('[data-cy="summary-2fa"]').should('have.text', 'Yes');

        // Submit form
        cy.get('[data-cy="btn-submit-final"]').click();

        // Wait for mocked API call and check status message
        cy.wait('@registerUser');
        cy.get('[data-cy="api-result-box"]')
            .should('be.visible')
            .and('have.class', 'success')
            .and('contain.text', 'Registration successful (User ID: USER-12345)');
    });

    it('should show validation errors when required fields are missing', () => {
        // Navigate to step 5 directly
        cy.get('[data-cy="btn-next-1"]').click();
        cy.get('[data-cy="btn-next-2"]').click();
        cy.get('[data-cy="btn-next-3"]').click();
        cy.get('[data-cy="btn-next-4"]').click();

        // Submit blank form
        cy.get('[data-cy="btn-submit-final"]').click();

        // Verify failure message box
        cy.get('[data-cy="api-result-box"]')
            .should('be.visible')
            .and('have.class', 'failure')
            .and('contain.text', 'Validation Error');

        // Should auto-redirect back to Step 1 because first name/last name are missing
        cy.get('[data-cy="page-title-1"]').should('be.visible');
        cy.get('[data-cy="err-first-name"]').should('be.visible');
        cy.get('[data-cy="err-last-name"]').should('be.visible');
        cy.get('[data-cy="err-email"]').should('be.visible');
    });

    it('should validate password matching', () => {
        // Step 1
        cy.get('[data-cy="input-first-name"]').type('Alice');
        cy.get('[data-cy="input-last-name"]').type('Smith');
        cy.get('[data-cy="input-email"]').type('alice@example.com');
        cy.get('[data-cy="btn-next-1"]').click();

        // Step 2 with mismatched passwords
        cy.get('[data-cy="input-password"]').type('Password123');
        cy.get('[data-cy="input-confirm-password"]').type('WrongPassword');
        cy.get('[data-cy="btn-next-2"]').click();
        cy.get('[data-cy="btn-next-3"]').click();
        cy.get('[data-cy="checkbox-terms"]').check();
        cy.get('[data-cy="btn-next-4"]').click();

        cy.get('[data-cy="btn-submit-final"]').click();

        // Should redirect back to Step 2 for password mismatch
        cy.get('[data-cy="page-title-2"]').should('be.visible');
        cy.get('[data-cy="err-confirm-password"]').should('be.visible');
    });
});