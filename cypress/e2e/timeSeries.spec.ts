import resolutions from '../fixtures/resolutions.json';
import testAAS from '../fixtures/cypress_e2e/cypressTestAas.json';
import testInternalSubRef from '../fixtures/cypress_e2e/Submodels/cyTimeSeries_Internal_SubmodelReference.json';
import testLinkedSubRef from '../fixtures/cypress_e2e/Submodels/cyTimeSeries_Linked_SubmodelReference.json';
import testLinkedSub from '../fixtures/cypress_e2e/Submodels/cyTimeSeries_Linked.json';
import testInternalSub from '../fixtures/cypress_e2e/Submodels/cyTimeSeries_Internal.json';

describe('Test the TimeSeries', function () {
    before(function () {
        const encodedAasId = btoa(testAAS.id).replace(/=+$/g, '');
        cy.repoRequest('POST', '/shells', testAAS);
        cy.postSubmodelToAas(encodedAasId, testLinkedSub, testLinkedSubRef);
        cy.postSubmodelToAas(encodedAasId, testInternalSub, testInternalSubRef);
    });
    resolutions.forEach((res) => {
        describe('test on resolution: ' + res, function () {
            beforeEach(function () {
                cy.setResolution(res as  [number, number] | Cypress.ViewportPreset);
                if (res === 'iphone-6') {
                    cy.visit('/viewer/' + btoa(testAAS.id).replace(/=+$/g, ''));
                } else {
                    cy.visitViewer(testAAS.id);
                }
                cy.getByTestId('submodel-tab').contains('TimeSeries').click();
            });

        it('Test for the timeseries submodel', function () {
            //close the popup
            cy.get('body').click(0, 0);
            cy.getByTestId('timeseries-detail-view').should('exist');
        });

        // TODO Test and revive the Influx Linked TimeSeries visualisation

    });
    });
    after(function () {
        const encodedAasId = btoa(testAAS.id);
        cy.repoRequest('DELETE', '/shells/' + encodedAasId, null);
        const encodedTestInternalSub = btoa(testInternalSub.id);
        cy.repoRequest('DELETE', '/submodels/' + encodedTestInternalSub, null);
        const encodedTestLinkedSub = btoa(testInternalSub.id);
        cy.repoRequest('DELETE', '/submodels/' + encodedTestLinkedSub, null);
    });
});
