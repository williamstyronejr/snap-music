import 'cypress-file-upload';

Cypress.Commands.add('typeLogin', ({ email, username, password }) => {
  cy.visit('/signup');
  cy.get('[data-cy=email]').type(email);
  cy.get('[data-cy=username]').type(username);
  cy.get('[data-cy=password]').type(password);
  cy.get('[data-cy=confirm]').type(password);
  cy.get('[data-cy=submit]').click();

  cy.location('pathname').should('eq', '/chart');
});
