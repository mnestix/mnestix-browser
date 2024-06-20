import resolutions from '../fixtures/resolutions';
const loginButtonText = 'Login';
const pagesThatRequireAuth = ['/settings', '/templates'];

describe('Testing the Login Redirection via the burger menu', function () {
    resolutions.forEach((res) => {
        it(
            'should find the login button and check for the microsoft login popup (Resolution: ' + res + ')',
            function () {
                cy.setResolution(res);
                interceptAndVisit('/');

                cy.getByTestId('header-burgermenu').click();
                cy.getByTestId('sidebar-button').contains(loginButtonText, { matchCase: false }).as('LoginButton');
                cy.get('@LoginButton').click();
                cy.wait('@loginIntercept');
            },
        );
    });
});

describe('Testing the Login Redirection via the Authentication page', function () {
    pagesThatRequireAuth.forEach((p) => {
        describe('tests the ' + p + ' page Login', function () {
            resolutions.forEach((res) => {
                it(
                    'should click the login button and check for the microsoft login popup (Resolution: ' + res + ')',
                    function () {
                        cy.setResolution(res);
                        interceptAndVisit(p);
                        cy.getByTestId('sign-in-button').click();
                        cy.wait('@loginIntercept');
                    },
                );
            });
        });
    });
});

function interceptAndVisit(urlToVisit) {
    cy.intercept('GET', 'https://login.microsoftonline.com/**', {}).as('loginIntercept');
    cy.visit(urlToVisit);
}
