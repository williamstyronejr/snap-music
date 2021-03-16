function generateRandomString(len, append = '') {
  return (
    Math.random().toString(36).substring(2, 4) +
    Math.random().toString(36).substring(2, 4) +
    append
  );
}

const email = generateRandomString(8, '@email.com');
const username = generateRandomString(8);
const password = generateRandomString(8);

describe('User Signup', () => {
  beforeEach(() => {
    // Go to signup page via nav bar
    cy.visit('/');
    cy.get('[data-cy=signup]').click();
  });

  it('Invalid auth parameters displays error messages', () => {
    const invalidUsername = 'u';
    const invalidPassword = 'u';
    const invalidEmail = 'u';

    cy.get('[data-cy=email]').type(invalidEmail);
    cy.get('[data-cy=username]').type(invalidUsername);
    cy.get('[data-cy=password]').type(invalidPassword);
    cy.get('[data-cy=confirm]').type(`${invalidPassword}1`);
    cy.get('[data-cy=submit]').click();

    cy.get('[data-cy=error]').should('have.length', 4);
  });

  it('Valid auth info should redirect to chart page', () => {
    cy.get('[data-cy=email]').type(email);
    cy.get('[data-cy=username]').type(username);
    cy.get('[data-cy=password]').type(password);
    cy.get('[data-cy=confirm]').type(password);
    cy.get('[data-cy=submit]').click();

    cy.location('pathname').should('eq', '/chart');
  });
});

describe('User Signin', () => {
  beforeEach(() => {
    // Visit signin page through nav
    cy.visit('/');
    cy.get('[data-cy=signin]').click();
  });

  it('Invalid username/password show error message', () => {
    const invalidUsername = 'j';
    const invalidPassword = 'f';

    cy.get('[data-cy=user]').type(invalidUsername);
    cy.get('[data-cy=password]').type(invalidPassword);

    cy.get('[data-cy=submit]').click();

    cy.get('p').contains('Invalid');
  });

  it('Valid auth info should redirect to chart page', () => {
    cy.get('[data-cy=user]').type(username);
    cy.get('[data-cy=password]').type(password);

    cy.get('[data-cy=submit]').click();

    cy.location('pathname').should('eq', '/chart');
  });

  it('Signout should redirect to home page', () => {
    cy.get('[data-cy=user]').type(username);
    cy.get('[data-cy=password]').type(password);
    cy.get('[data-cy=submit]').click();

    cy.get('[data-cy=user-menu]').click();
    cy.contains('Signout').click();

    cy.location('pathname').should('eq', '/');
  });
});
