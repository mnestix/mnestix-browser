import resolutions from '../fixtures/resolutions';
import thumbnailAasMockData from '../fixtures/cypress_e2e/ThumbnailFileMockData/thumbnailAasMockData.json';

describe('Thumbnail image as a file test', function () {
    before(function () {
        cy.postTestThumbnailAas();
        cy.uploadThumbnailToAas(thumbnailAasMockData.id);
    });

    resolutions.forEach((res) => {
        it('should load thumbnail from file and visualize it in detail view (Resolution: ' + res + ')', function () {
            cy.setResolution(res);
            cy.visitViewer(thumbnailAasMockData.id).wait(2000);
            cy.getByTestId('default-thumbnail-image-with-fallback', { timeout: 1000 }).should('not.exist');
            cy.getByTestId('image-with-fallback', { timeout: 1000 })
                .should('exist')
                .should('be.visible')
                .and((img) => {
                    expect(img[0].naturalWidth).to.be.greaterThan(0);
                    expect(img[0].naturalHeight).to.be.greaterThan(0);
                });
        });
        it.skip('should load thumbnail from file and visualize it in list view (Resolution: ' + res + ')', function () {
            cy.visit('/list');
        });
    });

    after(function () {
        cy.deleteThumbnailFromAas(thumbnailAasMockData.id);
        cy.deleteTestThumbnailAas();
    });
});
