import resolutions from '../fixtures/resolutions';

describe('Test the settings page', function () {
    beforeEach(function () {
        cy.visit('/');
        cy.getByTestId('header-burgermenu').click();
        cy.getByTestId('sidebar-button').contains('Settings').click();
    });
    it(
        'should navigate to the id settings, go into edit mode and change a value (Resolution: ' + resolutions[0] + ')',
        function () {
            cy.setResolution(resolutions[0]);
            cy.getByTestId('submodel-tab').contains('ID structure').click();
            cy.getByTestId('id-settings-entry-value').first().should('exist');
            cy.getByTestId('id-settings-entry-value')
                .first()
                .then(($entry) => {
                    const initialValue = $entry.text();

                    cy.getByTestId('edit-button').click();
                    cy.getByTestId('settings-input-field-0').click().type('{selectall}{backspace}').type('testValue');
                    cy.getByTestId('submit-button').click();
                    cy.getByTestId('id-settings-entry-value').first().contains('testValue').should('exist');

                    // Cleanup
                    cy.getByTestId('edit-button').click();
                    cy.getByTestId('settings-input-field-0').click().type('{selectall}{backspace}').type(initialValue);
                    cy.getByTestId('submit-button').click();
                });
        },
    );
    it(
        'should navigate to the data sources settings, add a repository and remove it again (Resolution: ' +
            resolutions[0] +
            ')',
        function () {
            cy.setResolution(resolutions[0]);
            cy.getByTestId('submodel-tab').contains('Data sources').click();
            cy.getByTestId('edit-button').click();
            cy.getByTestId('add-more-button').first().click();
            cy.getByTestId('repository-input-field').last().as('inputField').should('be.visible');
            cy.get('@inputField').click();
            cy.get('@inputField').type('testRepository');
            cy.getByTestId('submit-button').click();
            cy.getByTestId('repository-value').contains('testRepository').should('exist');
            cy.getByTestId('edit-button').click();
            cy.getByTestId('remove-repository-button').last().click();
            cy.getByTestId('submit-button').click();
            cy.getByTestId('repository-value').contains('testRepository').should('not.exist');
        },
    );
    it(
        'should navigate to the data sources settings, add a repository and press cancel (Resolution: ' +
            resolutions[0] +
            ')',
        function () {
            cy.setResolution(resolutions[0]);
            cy.getByTestId('submodel-tab').contains('Data sources').click();
            cy.getByTestId('edit-button').click();
            cy.getByTestId('add-more-button').first().click();
            cy.getByTestId('repository-input-field').last().as('inputField').should('be.visible');
            cy.get('@inputField').click();
            cy.get('@inputField').type('testRepository');
            cy.getByTestId('cancel-button').click();
            cy.getByTestId('repository-value').contains('testRepository').should('not.exist');
        },
    );
});
