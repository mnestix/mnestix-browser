import resolutions from '../fixtures/resolutions';

describe('Test all Aas List features (Resolution 1920 x 1080)', function () {
    before(function () {
        cy.postListAasMockData();
    });

    beforeEach(function () {
        cy.setResolution(resolutions[0]);
        cy.visit('/list');
    });
    it('should redirect to aas list when pressing the aas list button on the homepage', function () {
        cy.visit('/');
        cy.getByTestId('aasList-Button-Home').click();
        cy.url().should('contain', '/list');
    });
    it('should redirect to the viewer page when clicking on an aas list entry', function () {
        cy.getByTestId('list-to-detailview-button').first().click();
        cy.wait(100);
        cy.url().should('contain', '/viewer/');
    });
    it('should show the selected aas in the comparison list and enable the button', function () {
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest1"]').findByTestId('list-checkbox').click();
        cy.get('[data-testid="selected-https://mnestix.io/aas/listTest1').should('exist');
        cy.getByTestId('compare-button').should('not.be.disabled');
    });
    it('should remove the aas from the comparison list when deselected and disable the button', function () {
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest1"]').findByTestId('list-checkbox').click();
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest1"]').findByTestId('list-checkbox').click();
        cy.get('[data-testid="selected-https://mnestix.io/aas/listTest1').should('not.exist');
        cy.getByTestId('compare-button').should('be.disabled');
    });
    it('should disable checkboxes and show a warning when the user tries to select more than 3 aas', function () {
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest1"]').findByTestId('list-checkbox').click();
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest2"]').findByTestId('list-checkbox').click();
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest3"]').findByTestId('list-checkbox').click();
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest4"]')
            .findByTestId('list-checkbox')
            .parent()
            .click();
        cy.get('.MuiAlert-root').should('exist');
    });
    it('should redirect to the comparison page when one aas is selected and button is pressed', function () {
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest1"]').findByTestId('list-checkbox').click();
        cy.getByTestId('compare-button').click();
        cy.wait(100);
        cy.url().should('contain', '/compare');
    });
    it('should filter the aas list when a product class is selected', function () {
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest1"]').findByTestId('list-checkbox');

        cy.getByTestId('product-class-select').click();
        cy.getByTestId('product-class-select-Actuator').click();

        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest1"]')
            .findByTestId('product-class-chip')
            .contains('Actuator');
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest2"]').should('not.exist');
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest3"]').should('not.exist');
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest4"]').should('not.exist');
    });
    it('should update the filtered aas list when another product class is selected', function () {
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest1"]').findByTestId('list-checkbox');

        cy.getByTestId('product-class-select').click();
        cy.getByTestId('product-class-select-Control-system').click();

        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest1"]').should('not.exist');
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest2"]').should('exist');
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest3"]').should('not.exist');
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest4"]').should('not.exist');
    });
    it('should show the full aas list when the product class is reset', function () {
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest1"]').findByTestId('list-checkbox');

        cy.getByTestId('product-class-select').click();
        cy.getByTestId('product-class-select-all').click();

        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest1"]').should('exist');
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest2"]').should('exist');
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest3"]').should('exist');
        cy.get('[data-testid="list-row-https://mnestix.io/aas/listTest4"]').should('exist');
    });

    after(function () {
        cy.deleteListAasMockData();
    });
});
