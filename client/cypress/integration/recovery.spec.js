function generateRandomString(len, append = '') {
  return (
    Math.random().toString(36).substring(2, 4) +
    Math.random().toString(36).substring(2, 4) +
    append
  );
}

let username;
// Sign up a user and then sign them out
before(() => {
  username = generateRandomString(8);
  const email = generateRandomString(8, '@email.com');
  const password = 'dmasikl';

  cy.visit('/');
  cy.get('[data-cy=signup]').click();

  cy.get('[data-cy=email]').type(email);
  cy.get('[data-cy=username]').type(username);
  cy.get('[data-cy=password]').type(password);
  cy.get('[data-cy=confirm]').type(password);
  cy.get('[data-cy=submit]').click();

  cy.location('pathname').should('eq', '/chart');

  // Sign user out
  cy.get('[data-cy=user-menu]').click();
  cy.contains('Signout').click();
});

describe('Requesting a password reset', () => {
  beforeEach(() => {
    cy.get('[data-cy=signin]').click();
    cy.get('form > a').click();

    cy.location('pathname').should('eq', '/account/recovery');
  });

  it('Providing no username should spawn an error message', () => {
    cy.get('button[type=submit]').click();
    cy.get('[data-cy=form-error]').should('exist');
  });

  it('Providing a non-existing username should spawn a success message', () => {
    const nonExistingUsername = generateRandomString(8);
    cy.get('[data-cy=user]').type(nonExistingUsername);
    cy.get('button[type=submit]').click();
    cy.get('[data-cy=form-success]').should('exist');
  });

  it('Providing a valid username should spawn a success message', () => {
    cy.get('[data-cy=user]').type(username);
    cy.get('button[type=submit]').click();
    cy.get('[data-cy=form-success]').should('exist');
  });
});

describe('Password reset', () => {
  beforeEach(() => {
    const id = 'test';
    const token = 'test';

    cy.visit(`/account/reset?id=${id}&token=${token}`);
  });

  it('Providing no password should spawn an error message', () => {
    cy.get('button[type=submit]').click();
    cy.get('[data-cy=form-error]').should('exist');
  });

  it('Providing invalid password should spawn an error message', () => {
    const password = 't';
    cy.get('input').type(password);
    cy.get('button[type=submit]').click();
    cy.get('[data-cy=form-error]').should('exist');
  });

  it('Providing invalid token or id should spawn an error message', () => {
    const password = 'ttestnj';
    cy.get('input').type(password);
    cy.get('button[type=submit]').click();
    cy.get('[data-cy=form-error]').should('exist');
  });

  it('Valid request should spawn a success message', () => {
    // Request is stub since it diffcult to truly test E2E
    cy.intercept(
      {
        method: 'POST', // Route all GET requests
        url: '/account/reset', // that have a URL that matches '/users/*'
      },
      {
        statusCode: 200,
      }
    );

    const password = 'testing';
    cy.get('[data-cy=password]').type(password);
    cy.get('button[type=submit]').click();
    cy.get('[data-cy=form-success]').should('exist');
  });
});
