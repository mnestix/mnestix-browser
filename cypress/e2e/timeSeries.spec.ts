import resolutions from '../fixtures/resolutions.json';
import testAAS from '../fixtures/cypress_e2e/cypressTestAas.json';
import testInternalLinkedSub from '../fixtures/cypress_e2e/Submodels/cyTimeSeries_Internal_and_Linked.json';
import testInternalLinkedSubRef from '../fixtures/cypress_e2e/Submodels/cyTimeSeries_Internal_Linked_SubmodelReference.json';

describe('Test the internal TimeSeries', function () {
    before(function () {
        const encodedAasId = btoa(testAAS.id).replace(/=+$/g, '');
        cy.repoRequest('POST', '/shells', testAAS);
        cy.postSubmodelToAas(encodedAasId, testInternalLinkedSub, testInternalLinkedSubRef);
    });
    resolutions.forEach((res) => {
        describe('test on resolution: ' + res, function () {
            beforeEach(function () {
                cy.setResolution(res as [number, number] | Cypress.ViewportPreset);

                if (res === 'iphone-6') {
                    cy.visit('/viewer/' + btoa(testAAS.id).replace(/=+$/g, ''));
                } else {
                    cy.visitViewer(testAAS.id);
                }
            });

            it('Test for the internal timeseries submodel', function () {
                cy.getByTestId('submodel-tab').wait(10000).contains('TimeSeries').click();

                const wrapper = cy.getByTestId('timeseries-internal-wrapper')
                wrapper.should('exist');
                const lineChart = wrapper.getByTestId('timeseries-line-chart')
                lineChart.should('exist');

                // six points
                lineChart.find('.recharts-dot').should('have.length', 6);
            });
        });
    });
    after(function () {
        const encodedAasId = btoa(testAAS.id).replace(/=+$/g, '');
        cy.repoRequest('DELETE', '/shells/' + encodedAasId, null);
        const encodedTestInternalLinkedSub = btoa(testInternalLinkedSub.id).replace(/=+$/g, '');
        cy.repoRequest('DELETE', '/submodels/' + encodedTestInternalLinkedSub, null);
    });
});

describe('Test the linked TimeSeries', function () {
    describe('test linked submodel', function () {
        it('Test for the linked timeseries submodel', function () {

            const encodedAasId = btoa(testAAS.id).replace(/=+$/g, '');
            cy.repoRequest('POST', '/shells', testAAS)
            cy.postSubmodelToAas(encodedAasId, testInternalLinkedSub, testInternalLinkedSubRef)

            cy.intercept('POST', 'http://localhost:8086/api/v2/***', {}).as('influxIntercept');
            cy.visitViewer(testAAS.id);

            cy.wait('@influxIntercept', { timeout: 10000 });
        });
    });

    after(function () {
        const encodedAasId = btoa(testAAS.id).replace(/=+$/g, '');
        cy.repoRequest('DELETE', '/shells/' + encodedAasId, null);
        const encodedTestInternalLinkedSub = btoa(testInternalLinkedSub.id).replace(/=+$/g, '');
        cy.repoRequest('DELETE', '/submodels/' + encodedTestInternalLinkedSub, null);
    });
});
