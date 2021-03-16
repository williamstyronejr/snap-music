function generateRandomString(len, append = '') {
  return (
    Math.random().toString(36).substring(2, 4) +
    Math.random().toString(36).substring(2, 4) +
    append
  );
}

let username;

// Sign up a user with each request (Slows down testing)
beforeEach(() => {
  username = generateRandomString(8);
  const email = generateRandomString(8, '@email.com');
  const password = generateRandomString(8);

  cy.visit('/');
  cy.get('[data-cy=signup]').click();

  cy.get('[data-cy=email]').type(email);
  cy.get('[data-cy=username]').type(username);
  cy.get('[data-cy=password]').type(password);
  cy.get('[data-cy=confirm]').type(password);
  cy.get('[data-cy=submit]').click();

  cy.location('pathname').should('eq', '/chart');
});

describe('Profile page', () => {
  it('Auth user visiting another user profile should be able to report', () => {
    const username2 = generateRandomString(8);
    const email2 = generateRandomString(8, '@email.com');
    const password2 = generateRandomString(8);

    // Sign existing user out, and log in another user
    cy.get('[data-cy=user-menu]').click();
    cy.get('button[type=submit]').click();
    cy.get('[data-cy=signup]').click();
    cy.get('[data-cy=email]').type(email2);
    cy.get('[data-cy=username]').type(username2);
    cy.get('[data-cy=password]').type(password2);
    cy.get('[data-cy=confirm]').type(password2);
    cy.get('[data-cy=submit]').click();
    cy.location('pathname').should('eq', '/chart');

    cy.visit(`/user/${username}`);

    cy.get('[data-cy=profile-menu]').click();
    cy.get('[data-cy=report]').click();

    cy.get('[data-cy=profile]').click();
    cy.get('[data-cy=details]').type('Test');
    cy.get('[data-cy=submit]').click();

    cy.get('[data-cy=notification]').contains('Report sent');
  });

  it('Following user should increase following count and button', () => {
    const username2 = generateRandomString(8);
    const email2 = generateRandomString(8, '@email.com');
    const password2 = generateRandomString(8);

    // Sign existing user out, and log in another user
    cy.get('[data-cy=user-menu]').click();
    cy.get('button[type=submit]').click();
    cy.get('[data-cy=signup]').click();
    cy.get('[data-cy=email]').type(email2);
    cy.get('[data-cy=username]').type(username2);
    cy.get('[data-cy=password]').type(password2);
    cy.get('[data-cy=confirm]').type(password2);
    cy.get('[data-cy=submit]').click();
    cy.location('pathname').should('eq', '/chart');

    cy.visit(`/user/${username}`);

    cy.get('[data-cy=follow]').should('have.text', 'Follow').click();
    cy.get('[data-cy=follow]').should('have.text', 'Following');

    cy.get('[data-cy=follows]').should('have.text', '1 Follower');
  });
});
