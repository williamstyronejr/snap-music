function generateRandomString(len, append = '') {
  return (
    Math.random().toString(36).substring(2, 4) +
    Math.random().toString(36).substring(2, 4) +
    append
  );
}

const password = 'dmasikl';
let username;
let email;

// Sign up a user with each request (Slows down testing)
beforeEach(() => {
  username = generateRandomString(8);
  email = generateRandomString(8, '@email.com');

  cy.visit('/');
  cy.get('[data-cy=signup]').click();

  cy.get('[data-cy=email]').type(email);
  cy.get('[data-cy=username]').type(username);
  cy.get('[data-cy=password]').type(password);
  cy.get('[data-cy=confirm]').type(password);
  cy.get('[data-cy=submit]').click();

  cy.location('pathname').should('eq', '/chart');
});

describe('UI Settings - Night mode', () => {
  it('Toggling night mode', () => {
    cy.get('.layout').should(($div) => {
      const className = $div[0].className;
      expect(className).to.not.match(/layout-night/);
    });

    cy.get('[data-cy=user-menu]').click();
    cy.get('[data-cy=night-mode]').click();

    cy.get('.layout').should(($div) => {
      const className = $div[0].className;
      expect(className).to.match(/layout-night/);
    });
  });
});

describe('User settings  - Account', () => {
  beforeEach(() => {
    cy.visit('/settings/account');
  });

  // it('Updating with invalid parameters spawns error messages', () => {
  //   const invalidEmail = 'test';
  //   const invalidUsername = 't';

  //   cy.get('[data-cy=email]').type(invalidEmail);
  //   cy.get('[data-cy=username]').type(invalidUsername);
  //   cy.get('button:visible[type="submit"]').click();

  //   cy.get('span:visible[data-cy="field-error"]')
  //     .should('have.length', 2)
  //     .each(($el, index, $list) => {
  //       expect($el.text()).to.have.length.greaterThan(0);
  //     });
  // });

  // it('Changing username, bio, and  email', () => {
  //   const newEmail = generateRandomString(8, '@email.com');
  //   const newUsername = generateRandomString(8);
  //   const newBio = generateRandomString();

  //   cy.get('[data-cy=email]').type(newEmail);
  //   cy.get('[data-cy=username]').type(newUsername);
  //   cy.get('[data-cy=bio]').type(newBio);
  //   cy.get('button:visible[type="submit"]').click();

  //   // Username on page should change
  //   cy.get('[data-cy="name-display"]').should('have.text', newUsername);
  // });

  it('Deleting user account should unauth user locally and unable to signin', () => {
    cy.get('[data-cy=delete]').click();
    cy.get('[data-cy=confirm]').click();

    // Attempt to login as user who was just deleted.
    cy.get('[data-cy=signin]').click();

    cy.get('[data-cy=user]').type(username);
    cy.get('[data-cy=password]').type(password);
    cy.get('[data-cy=submit]').click();

    cy.get('[data-cy=formError');
  });
});

describe('User settings - Password', () => {
  beforeEach(() => {
    cy.get('[data-cy=user-menu]').click();
    cy.get('[data-cy=settings]').click();
    cy.get('a').contains('Password').click();
  });

  it('Invalid inputs will spawn error messages', () => {
    const oldPassword = '1';
    const newPassword = '2';

    cy.get('[data-cy=oldPassword]').type(oldPassword);
    cy.get('[data-cy=newPassword]').type(newPassword);
    cy.get('[data-cy=confirmPassword]').type(newPassword);
    cy.get('button:visible[type=submit]').click();

    cy.get('span:visible[data-cy=error]').its('length').should('be.gte', 1);
  });

  it('Invalid confirm password will 1 spawn error message', () => {
    const newPassword = generateRandomString(8);

    cy.get('[data-cy=oldPassword]').type(password);
    cy.get('[data-cy=newPassword]').type(newPassword);
    cy.get('[data-cy=confirmPassword]').type(`${newPassword}0`);
    cy.get('button:visible[type=submit]').click();

    cy.get('span:visible[data-cy=error]').its('length').should('eq', 1);
  });

  it('Successfully password update should spawn a notification', () => {
    const newPassword = generateRandomString(8);

    cy.get('[data-cy=oldPassword]').type(password);
    cy.get('[data-cy=newPassword]').type(newPassword);
    cy.get('[data-cy=confirmPassword]').type(newPassword);
    cy.get('button:visible[type=submit]').click();

    cy.get('[data-cy=notification]')
      .contains('Password updated')
      .its('length')
      .should('eq', 1);
  });
});
