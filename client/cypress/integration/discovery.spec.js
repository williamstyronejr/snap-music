function generateRandomString(len, append = '') {
  return (
    Math.random().toString(36).substring(2, 4) +
    Math.random().toString(36).substring(2, 4) +
    append
  );
}

describe('Interactions with the discovery menu', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Discovery').click();
  });

  it('Clicking a genre should link to new page with media player', () => {
    cy.get('main').within(() => {
      cy.get('a').its('length').should('gte', 1);
      cy.get('a').first().click();
      cy.url().should('include', '/discovery/');
    });

    cy.intercept(
      {
        method: 'GET',
        url: '/discovery/Latin/tracks',
      },
      {
        statusCode: 200,
        body: [
          {
            rating: 0,
            title: 'latinExample1',
            artist: 'username2',
            artistId: '5fe10b5179be5568dd18055h',
            fileUrl:
              'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            genre: 'latin',
            coverArt: '/img/default_cover.png',
            likes: [],
            id: '5fe10b5279be5568dd18056f',
          },
          {
            rating: 0,
            title: 'latinExample2',
            artist: 'username2',
            artistId: '5fe117201eba856fc7040a2g',
            fileUrl:
              'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            genre: 'latin',
            coverArt: '/img/default_cover.png',
            likes: [],
            id: '5fe117271eba856fc9040a33',
          },
        ],
      }
    );

    cy.get('[data-cy=media-player]').should('exist');
  });

  it('Changing genres should load a different track', () => {
    let firstTrackTitle;

    cy.intercept(
      {
        method: 'GET',
        url: '/discovery/Latin/tracks',
      },
      {
        statusCode: 200,
        body: [
          {
            rating: 0,
            title: 'latinExample1',
            artist: 'username2',
            artistId: '5fe10b5179be5568dd18055h',
            fileUrl:
              'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            genre: 'latin',
            coverArt: '/img/default_cover.png',
            likes: [],
            id: '5fe10b5279be5568dd18056f',
          },
          {
            rating: 0,
            title: 'latinExample2',
            artist: 'username2',
            artistId: '5fe117201eba856fc7040a2g',
            fileUrl:
              'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            genre: 'latin',
            coverArt: '/img/default_cover.png',
            likes: [],
            id: '5fe117271eba856fc9040a33',
          },
        ],
      }
    );

    cy.get('main').within(() => {
      cy.get('a').its('length').should('gte', 1);
      cy.get('a').first().click();
      cy.url().should('include', '/discovery/');
    });

    firstTrackTitle = cy.get('[data-cy=title]').invoke('text');

    // Click a different genre
    cy.contains('Discovery').click();

    cy.get('main').within(() => {
      cy.get('a').last().click();
      cy.url().should('include', '/discovery/');
    });

    cy.get('[data-cy=title]').invoke('text').should('not.eq', firstTrackTitle);
  });
});

describe('Interactions with the discovery media player page', () => {
  beforeEach(() => {
    cy.visit('/');

    cy.intercept(
      {
        method: 'GET',
        url: '/discovery/Latin/tracks',
      },
      {
        statusCode: 200,
        body: [
          {
            rating: 0,
            title: 'latinExample1',
            artist: 'username2',
            artistId: '5fe10b5179be5568dd18055h',
            fileUrl:
              'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            genre: 'latin',
            coverArt: '/img/default_cover.png',
            likes: [],
            id: '5fe10b5279be5568dd18056f',
          },
          {
            rating: 0,
            title: 'latinExample2',
            artist: 'username2',
            artistId: '5fe117201eba856fc7040a2g',
            fileUrl:
              'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            genre: 'latin',
            coverArt: '/img/default_cover.png',
            likes: [],
            id: '5fe117271eba856fc9040a33',
          },
        ],
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: '/discovery/Hip%20Hop/tracks',
      },
      {
        statusCode: 200,
        body: [
          {
            rating: 0,
            title: 'title new',
            artist: 'username2',
            artistId: '5fe10b5179be5568dd180558',
            fileUrl:
              'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            genre: 'hip hop',
            coverArt: '/img/default_cover.png',
            likes: [],
            id: '5fe10b5279be5568dd18055f',
          },
          {
            rating: 0,
            title: 'title new',
            artist: 'username2',
            artistId: '5fe117201eba856fc7040a2c',
            fileUrl:
              'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            genre: 'hip hop',
            coverArt: '/img/default_cover.png',
            likes: [],
            id: '5fe117271eba856fc7040a33',
          },
        ],
      }
    );

    cy.contains('Discovery').click();
    cy.get('main').within(() => {
      cy.get('a').its('length').should('gte', 1);
      cy.get('a').first().click();
      cy.url().should('include', '/discovery/');
    });

    cy.get('[data-cy=media-player]').should('exist');
    cy.get('[data-cy=play]').children('.fa-pause');
  });

  it('Pausing and playing track should stop timelaspe', () => {
    cy.get('[data-cy=play]').click();

    cy.get('[data-cy=current-time]')
      .invoke('text')
      .then((recordedTime) => {
        cy.wait(1000); // Wait to allow time to change if still playing
        cy.get('[data-cy=current-time]').should('have.text', recordedTime);
      });
  });

  it('Setting repeat and skipping track should turn repeat off', () => {
    cy.get('[data-cy=play]').click();
    cy.get('[data-cy=repeat]').click();
    cy.get('[data-cy=repeat]').children('.player__control--highlight');

    cy.get('[data-cy=forward]').click();
    cy.get('[data-cy=repeat]')
      .children('.player__control--highlight')
      .should('not.exist');
  });

  it('Liking a track should toggle like button', () => {
    const email = generateRandomString(8, '@email.com');
    const username = generateRandomString(8);
    const password = generateRandomString(8);
    cy.typeLogin({ email, username, password });

    cy.contains('Discovery').click();
    cy.get('main').within(() => {
      cy.get('a').its('length').should('gte', 1);
      cy.get('a').first().click();
      cy.url().should('include', '/discovery/');
    });

    cy.get('[data-cy=media-player]').should('exist');
    cy.get('[data-cy=play]').children('.fa-pause');

    cy.intercept('/track/**/vote').as('dataGetFirst');
    cy.get('[data-cy=like]').click();

    cy.wait('@dataGetFirst');

    cy.get('[data-cy=like]')
      .children()
      .then(($div) => {
        const className = $div[0].className;

        expect(className).to.contain('fas');
      });
  });
});
