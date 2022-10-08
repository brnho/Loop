	describe('Cypress', () => {
	it('Creates 10 posts, then deletes them all', () => {
		cy.visit('http://localhost:8000/');

		/* Sign in */
		cy.contains('Sign in').click();
		cy.get('[data-cy=email]').type('example1@hotmail.com');
		cy.get('[data-cy=password]').type('hello1');
		cy.get('[data-cy=submit]').click();

		/* Create posts */
		for (let i = 0; i < 10; i++) {
			cy.get('[data-cy=open-post-modal]').click();
			cy.get('[data-cy=post-textarea]').type(`${i} Hello everybody. How are you doing?`);
			cy.get('[data-cy=post-submit]').click();
		}

		/* Check if posts were successfully created */
		for (let i = 0; i < 10; i++) {
			cy.get('[data-cy=newsfeed]').should('contain', `${i} Hello everybody. How are you doing?`);
		}

		/* Delete posts */
		for (let i = 0; i < 10; i++) {
			cy.get('[data-cy=newsfeed] [data-cy=post] :contains(Garry1)').parent().first().then(($post) => {
				let text = Cypress.$($post).find('[data-cy=post-text]').text(); 
				cy.wrap($post).find('[data-cy=dropdown]').click();
				cy.wrap($post).find('[data-cy=delete]').click();
				cy.wrap($post).contains(text).should('not.exist'); //wait for the post to be deleted
			});
		}		
	});
});


