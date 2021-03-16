describe('Interactions with tracks on chart list', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Charts').click();
  });

  it('Clicking a track should toggle the footer media player', () => {
    cy.get('[data-cy=media-player]').should('not.exist');
    cy.get('[data-cy=track]').first().click();

    cy.get('[data-cy=media-player]');
  });

  it('Clicking a username should link back to user profile', () => {
    cy.get('[data-cy=media-player]').should('not.exist');
    cy.get('[data-cy=track]').first().find('a').click();

    cy.url().should('include', '/user');
  });
});
