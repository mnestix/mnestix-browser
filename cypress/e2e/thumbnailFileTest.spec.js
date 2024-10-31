import resolutions from '../fixtures/resolutions';
import thumbnailAasMockData from '../fixtures/cypress_e2e/ThumbnailFileMockData/thumbnailAasMockData.json';

describe('Thumbnail image as a file loaded test', function () {
    before(function () {
        cy.postTestThumbnailAas();
        cy.uploadThumbnailToAas(thumbnailAasMockData.id);
    });

    resolutions.forEach((res) => {
        it('should load thumbnail from file and visualize it in detail view (Resolution: ' + res + ')', function () {
            cy.setResolution(res);
            cy.visitViewer(thumbnailAasMockData.id);
            cy.getByTestId('aas-loading-skeleton').should('not.exist');
            cy.getByTestId('default-thumbnail-image-with-fallback', { timeout: 1000 }).should('not.exist');
            cy.getByTestId('image-with-fallback', { timeout: 1000 })
                .should('exist')
                .should('be.visible')
                .and((img) => {
                    expect(img[0].naturalWidth).to.be.greaterThan(0);
                    expect(img[0].naturalHeight).to.be.greaterThan(0);
                });
        });
        it('should load thumbnail from file and visualize it in list view (Resolution: ' + res + ')', function () {
            cy.setResolution(res);
            cy.visit('/list').wait(2000);
            cy.get('[data-testid="list-row-https://mnestix.io/aas/thumbnail_1"]').as('testAas');
            cy.get('@testAas')
                .findByTestId('image-with-fallback')
                .should('exist')
                .should('be.visible')
                .and((img) => {
                    expect(img[0].naturalWidth).to.be.greaterThan(0);
                    expect(img[0].naturalHeight).to.be.greaterThan(0);
                });
            cy.get('@testAas').findByTestId('default-thumbnail-image-with-fallback').should('not.exist');
        });
    });

    it(
        'should load thumbnail from file and visualize it in compare view (Resolution: ' + resolutions[0] + ')',
        function () {
            cy.visitViewer(thumbnailAasMockData.id);
            cy.getByTestId('detail-compare-button').click();
            cy.getByTestId('compare-aas-0')
                .findByTestId('image-with-fallback')
                .wait(2000)
                .should('exist')
                .should('be.visible')
                .and((img) => {
                    expect(img[0].naturalWidth).to.be.greaterThan(0);
                    expect(img[0].naturalHeight).to.be.greaterThan(0);
                });
            cy.getByTestId('compare-aas-0').findByTestId('default-thumbnail-image-with-fallback').should('not.exist');
        },
    );

    after(function () {
        cy.deleteThumbnailFromAas(thumbnailAasMockData.id);
        cy.deleteTestThumbnailAas();
    });
});

describe('Thumbnail image as a file not loaded test', function () {
    before(function () {
        cy.postTestThumbnailAas();
    });

    resolutions.forEach((res) => {
        it(
            'should not load thumbnail from file and show default image in detail view (Resolution: ' + res + ')',
            function () {
                cy.setResolution(res);
                cy.visitViewer(thumbnailAasMockData.id);
                cy.getByTestId('aas-loading-skeleton').should('not.exist');
                cy.getByTestId('default-thumbnail-image-with-fallback', { timeout: 1000 }).should('exist');
                cy.getByTestId('image-with-fallback', { timeout: 1000 }).should('not.exist');
            },
        );
        it(
            'should not load thumbnail from file and show default image in list view (Resolution: ' + res + ')',
            function () {
                cy.setResolution(res);
                cy.visit('/list').wait(2000);
                cy.get('[data-testid="list-row-https://mnestix.io/aas/thumbnail_1"]').as('testAas');
                cy.get('@testAas').findByTestId('image-with-fallback').should('not.exist');
                cy.get('@testAas').findByTestId('default-thumbnail-image-with-fallback').should('exist');
            },
        );
    });

    it(
        'should not load thumbnail from file and show default image in compare view (Resolution: ' +
            resolutions[0] +
            ')',
        function () {
            cy.visitViewer(thumbnailAasMockData.id);
            cy.getByTestId('detail-compare-button').click();
            cy.getByTestId('compare-aas-0').findByTestId('image-with-fallback').wait(2000).should('not.exist');
            cy.getByTestId('compare-aas-0').findByTestId('default-thumbnail-image-with-fallback').should('exist');
        },
    );

    after(function () {
        cy.deleteTestThumbnailAas();
    });
});
