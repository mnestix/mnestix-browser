import resolutions from '../fixtures/resolutions';
import testAAS from '../fixtures/cypress_e2e/cypressTestAas.json';

describe('Test the discovery list', function () {
    beforeEach(function () {
        cy.postTestAas();

        // Add another repository in settings
        cy.visit('/settings');
        cy.getByTestId('submodel-tab').contains('Data sources').click();
        cy.getByTestId('edit-button').click();
        cy.getByTestId('add-more-button').first().click();
        cy.getByTestId('repository-input-field').last().click().type('http://localhost:5064/repo');
        cy.getByTestId('submit-button').click();
    });
    it('navigate to discovery list with asset id and select aas (Resolution: ' + resolutions[0] + ')', function () {
        cy.setResolution(resolutions[0]);
        cy.visit(`/viewer/discovery?assetId=${testAAS.assetInformation.globalAssetId}`);
        //cy.getByTestId('list-row-' + testAAS.id).should('exist');
        cy.getByTestId('navigation-button').first().click();
        cy.url().should('contain', '/viewer/' + btoa(testAAS.id).replace(new RegExp('=*$', 'g'), ''));
    });
    it('navigate to discovery list with aas id and select aas (Resolution: ' + resolutions[0] + ')', function () {
        cy.setResolution(resolutions[0]);
        cy.visit(`/viewer/discovery?aasId=${testAAS.id}`);
        //cy.getByTestId('list-row-' + testAAS.id).should('exist');
        cy.getByTestId('navigation-button').first().click();
        cy.url().should('contain', '/viewer/' + btoa(testAAS.id).replace(new RegExp('=*$', 'g'), ''));
    });
    afterEach(function () {
        cy.deleteTestAas();

        // Remove duplicated repository from settings
        cy.visit('/settings');
        cy.getByTestId('submodel-tab').contains('Data sources').click();
        cy.getByTestId('edit-button').click();
        cy.getByTestId('remove-repository-button').last().click();
        cy.getByTestId('submit-button').click();
    });
});
