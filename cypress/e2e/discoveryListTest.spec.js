import resolutions from '../fixtures/resolutions';
import testAAS from '../fixtures/cypress_e2e/cypressTestAas.json';

describe('Test the discovery list', function () {
    before(function () {
        cy.postTestAas();

        // Add another repository in settings twice
        cy.visit('/settings');
        cy.getByTestId('submodel-tab').contains('Data sources').click();
        cy.getByTestId('edit-button').click();
        cy.getByTestId('add-more-button').first().click();
        cy.getByTestId('repository-input-field').last().click().type(Cypress.env('AAS_REPO_API_URL'));
        cy.getByTestId('add-more-button').first().click();
        cy.getByTestId('repository-input-field').last().click().type(Cypress.env('AAS_REPO_API_URL'));
        cy.getByTestId('submit-button').click();
    });
    it('navigate to discovery list with asset id and select aas (Resolution: ' + resolutions[0] + ')', function () {
        cy.setResolution(resolutions[0]);
        cy.visit(`/viewer/discovery?assetId=${testAAS.assetInformation.globalAssetId}`);
        cy.getByTestId('list-row').should('exist');
        cy.getByTestId('navigation-button').first().click();
        cy.url().should('contain', '/viewer/' + btoa(testAAS.id).replace(new RegExp('=*$', 'g'), ''));
    });
    it('navigate to discovery list with aas id and select aas (Resolution: ' + resolutions[0] + ')', function () {
        cy.setResolution(resolutions[0]);
        cy.visit(`/viewer/discovery?aasId=${testAAS.id}`);
        cy.getByTestId('list-row').should('have.length.at.least', 2);
        cy.getByTestId('navigation-button').first().click();
        cy.url().should('contain', '/viewer/' + btoa(testAAS.id).replace(new RegExp('=*$', 'g'), ''));
        cy.url().should('contain', `?repoUrl=${encodeURIComponent(Cypress.env('AAS_REPO_API_URL'))}`);
    });
    after(function () {
        cy.deleteTestAas();

        // Remove both duplicated repositories from settings
        cy.visit('/settings');
        cy.getByTestId('submodel-tab').contains('Data sources').click();
        cy.getByTestId('edit-button').click();
        cy.getByTestId('remove-repository-button').last().click();
        cy.getByTestId('remove-repository-button').last().click();
        cy.getByTestId('submit-button').click();
    });
});
