import resolutions from '../fixtures/resolutions';
import testAAS from '../fixtures/testAAS.json';
import compareAAS from '../fixtures/cypress_e2e/CompareMockData/cy_compareAas.json';

describe('Use the QR Scanner', function () {
    before(function () {
        cy.postTestAas();
        cy.postCompareMockData();
    });

    resolutions.forEach((res) => {
        describe('test on resolution: ' + res, function() {

            beforeEach(function () {
                cy.setResolution(res);
            });
            
            it('should automatically be redirected to the right viewer page', () => {
                cy.visit('/');
                cy.getByTestId('scanner-start').click();
                cy.getByTestId('scanner-video').should('exist');
                cy.callScannerCallback(testAAS.aasId);
                cy.url().should('contain', '/viewer/' + btoa(testAAS.aasId).replace(new RegExp('=*$', 'g'), ''));
            });
            it('should close the QR scanner video and show the stopped state', () => {
                cy.visit('/');
                cy.getByTestId('scanner-start').click();
                cy.getByTestId('scanner-video').should('exist');
                cy.getByTestId('scanner-close-button').click();
                cy.getByTestId('scanner-video').should('not.exist');
                cy.getByTestId('scanner-start').should('exist');
            });
            it('should reshow the video on a wrong QR code', () => {
                cy.visit('/');
                cy.getByTestId('scanner-start').click();
                cy.getByTestId('scanner-video').should('exist');
                cy.callScannerCallback('wrongTestId');
                cy.getByTestId('scanner-video').should('not.exist');
                cy.isNotificationSent('No AAS with the given ID.');
                cy.getByTestId('scanner-video').should('exist');
            });
            it('should add AAS in comparison view', () => {
                cy.visit('/compare');
                cy.getByTestId('compare-aas-0').should('not.exist');
                cy.getByTestId('add-aas-to-compare-button').click();
                cy.getByTestId('scanner-start').click();
                cy.getByTestId('scanner-video').should('exist');
                cy.callScannerCallback(compareAAS[1].id);
                cy.getByTestId('scanner-video').should('not.exist');
                cy.getByTestId('compare-aas-aad-dialog').should('not.exist');
                cy.getByTestId('compare-aas-0').should('exist');
            });
            it('should show duplicate AAS error on same AAS QR code', () => {
                cy.visit('/compare?aasId=' + encodeURIComponent(compareAAS[0].id));
                cy.getByTestId('compare-aas-0').should('exist');
                cy.getByTestId('add-aas-to-compare-button').click();
                cy.getByTestId('scanner-start').click();
                cy.getByTestId('scanner-video').should('exist');
                cy.callScannerCallback(compareAAS[0].id);
                cy.getByTestId('scanner-video').should('not.exist');
                cy.isNotificationSent('AAS cannot be added more than once.');
                cy.getByTestId('scanner-video').should('exist');
                cy.getByTestId('compare-aas-1').should('not.exist');
            });
            it('should show multiple AAS error on multiple asset QR code', () => {
                cy.visit('/compare');
                cy.getByTestId('compare-aas-0').should('not.exist');
                cy.getByTestId('add-aas-to-compare-button').click();
                cy.getByTestId('scanner-start').click();
                cy.getByTestId('scanner-video').should('exist');
                cy.callScannerCallback(compareAAS[3].assetInformation.globalAssetId);
                cy.getByTestId('scanner-video').should('not.exist');
                cy.isNotificationSent('More than one AAS found in the discovery service');
                cy.getByTestId('scanner-video').should('exist');
                cy.getByTestId('compare-aas-0').should('not.exist');
            });
        });
    });

    after(function () {
        cy.deleteTestAas();
        cy.deleteCompareMockData();
    });
});
