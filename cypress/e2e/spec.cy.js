describe('template spec', () => {
    it('passes', () => {
        cy.visit('https://example.cypress.io')
    })
})

// cypress/e2e/multi_page_form.cy.js
describe('30-Field Multi-Page Registration Flow', () => {

    beforeEach(() => {
        cy.visit('/');
    });

    it('Fills out all 30 fields across 4 pages and verifies step 5 dashboard', () => {

        // Intercept Mock API Endpoint
        cy.intercept('POST', '/api/v1/register', {
            statusCode: 200,
            body: { status: 'SUCCESS', message: 'Registration Recorded!' }
        }).as('postRegister');

        // PAGE 1
        cy.get('[data-cy="page-title-1"]').should('be.visible');
        cy.get('[data-cy="input-first-name"]').type('Sarah');
        cy.get('[data-cy="input-middle-name"]').type('Louise');
        cy.get('[data-cy="input-last-name"]').type('Connor');
        cy.get('[data-cy="input-email"]').type('sarah.connor@cyberdyne.com');
        cy.get('[data-cy="input-phone"]').type('+15550192834');
        cy.get('[data-cy="input-dob"]').type('1990-05-12');
        cy.get('[data-cy="input-gender-female"]').check();
        cy.get('[data-cy="select-nationality"]').select('US');
        cy.get('[data-cy="input-national-id"]').type('ID-8839201');
        cy.get('[data-cy="btn-next-1"]').click();

        // PAGE 2
        cy.get('[data-cy="page-title-2"]').should('be.visible');
        cy.get('[data-cy="input-username"]').type('sconnor90');
        cy.get('[data-cy="input-password"]').type('Skynet2029!');
        cy.get('[data-cy="input-confirm-password"]').type('Skynet2029!');
        cy.get('[data-cy="select-security-question"]').select('pet');
        cy.get('[data-cy="input-security-answer"]').type('Max');
        cy.get('[data-cy="checkbox-2fa"]').check();
        cy.get('[data-cy="btn-next-2"]').click();

        // PAGE 3
        cy.get('[data-cy="page-title-3"]').should('be.visible');
        cy.get('[data-cy="input-street1"]').type('742 Evergreen Terrace');
        cy.get('[data-cy="input-stareet2"]').type('Apt 4B');
        cy.get('[data-cy="input-city"]').type('Springfield');
        cy.get('[data-cy="input-state"]').type('OR');
        cy.get('[data-cy="input-postal-code"]').type('97477');
        cy.get('[data-cy="select-country"]').select('US');
        cy.get('[data-cy="btn-next-3"]').click();

        // PAGE 4
        cy.get('[data-cy="page-title-4"]').should('be.visible');
        cy.get('[data-cy="input-occupation"]').type('Security Specialist');
        cy.get('[data-cy="input-company"]').type('Resistance Inc');
        cy.get('[data-cy="input-experience"]').type('10');
        cy.get('[data-cy="input-annual-income"]').type('120000');
        cy.get('[data-cy="select-currency"]').select('USD');
        cy.get('[data-cy="input-range-skill"]').invoke('val', 9).trigger('change');
        cy.get('[data-cy="textarea-bio"]').type('Preparing automated Cypress test cases.');
        cy.get('[data-cy="checkbox-terms"]').check();
        cy.get('[data-cy="btn-next-4"]').click();

        // PAGE 5 SUMMARY & SUBMISSION
        cy.get('[data-cy="page-title-5"]').should('be.visible');
        cy.get('[data-cy="summary-first-name"]').should('contain', 'Sarah');
        cy.get('[data-cy="summary-email"]').should('contain', 'sarah.connor@cyberdyne.com');
        cy.get('[data-cy="summary-2fa"]').should('contain', 'Yes');

        // Click Final Submit
        cy.get('[data-cy="btn-submit-final"]').click();

        // Verify Intercepted Network Payload
        cy.wait('@postRegister').then((interception) => {
            expect(interception.request.body.username).to.equal('sconnor90');
            expect(interception.request.body.country).to.equal('US');
        });

        cy.get('[data-cy="api-result-box"]').should('contain', 'Registration Recorded!');
    });
});