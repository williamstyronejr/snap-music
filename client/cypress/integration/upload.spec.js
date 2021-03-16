function generateRandomString(len, append = '') {
  return (
    Math.random().toString(36).substring(2, 4) +
    Math.random().toString(36).substring(2, 4) +
    append
  );
}

let username;

// Create a new user account for each test
beforeEach(() => {
  cy.visit('/');
  cy.get('[data-cy=signup]').click();

  username = generateRandomString(8);
  const email = generateRandomString(8, '@email.com');
  const password = generateRandomString(8);

  cy.get('[data-cy=email]').type(email);
  cy.get('[data-cy=username]').type(username);
  cy.get('[data-cy=password]').type(password);
  cy.get('[data-cy=confirm]').type(password);
  cy.get('[data-cy=submit]').click();

  cy.location('pathname').should('eq', '/chart');
});

describe('Upload page', () => {
  beforeEach(() => {
    cy.visit('/upload');
  });

  it('Attempting to upload without a track will spawn error message', () => {
    const title = 'test';
    const tags = 'tags';

    cy.get('[name=title]').type(title);
    cy.get('[name=tags]').type(tags).type('{enter}');
    cy.get('[name=genre]').select('rap');

    cy.get('[data-cy=submit]').click();

    cy.get('[data-cy=error]').its('length').should('be.gte', 1);
  });

  it('Attempting to upload without a track information will spawn error messages', () => {
    const trackName = 'music.mp3'; // Must be in fixture

    cy.log('Next test changes the view.');
    cy.get('input[name=track]').invoke('removeAttr', 'class');
    cy.get('input[name=track]').attachFile(trackName, { force: true });

    cy.get('[data-cy=submit]').click();

    cy.get('[data-cy=error]').its('length').should('be.gte', 1);
  });

  // it('Successfully request should redirect to user profile page', () => {
  //   const trackName = 'music.mp3'; // Must be in fixture
  //   const tags = 'tags';
  //   const title = 'test';
  //   cy.intercept('POST', '**/upload/track').as('upload');

  //   cy.log('Next test changes the view.');

  //   // Enter input fields
  //   cy.get('input[name=track]').attachFile(trackName, { force: true });

  //   cy.get('[name=title]').type(title);
  //   cy.get('[name=tags]').type(tags).type('{enter}');
  //   cy.get('[name=genre]').select('rap');
  //   cy.get('input[name=track]').invoke('removeAttr', 'class');

  //   cy.get('[data-cy=submit]').click();
  //   cy.wait('@upload', { timeout: 20000 }); // Wait for upload to occur

  //   cy.location('pathname').should('eq', `/user/${username}`);
  // });
});
