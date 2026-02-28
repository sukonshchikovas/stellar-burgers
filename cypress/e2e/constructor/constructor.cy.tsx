/// <reference types="cypress" />
import userData from '../../fixtures/user.json';
import orderData from '../../fixtures/order.json';

describe('Burger Constructor - Интеграционные тесты', () => {
  const mockIngredients = require('../../fixtures/ingredients.json');

  const buns = mockIngredients.data.filter(
    (i: { type: string }) => i.type === 'bun'
  );
  const mains = mockIngredients.data.filter(
    (i: { type: string }) => i.type === 'main'
  );
  const sauces = mockIngredients.data.filter(
    (i: { type: string }) => i.type === 'sauce'
  );

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        'accessToken',
        'Bearer mock-jwt-token-for-testing'
      );
      win.localStorage.setItem('refreshToken', 'mock-refresh-token');
    });

    cy.setCookie('accessToken', 'mock-jwt-token');

    cy.intercept('GET', '**/api/ingredients', {
      statusCode: 200,
      body: require('../../fixtures/ingredients.json')
    }).as('getIngredients');

    cy.intercept('GET', '**/api/auth/user', {
      statusCode: 200,
      body: { success: true, user: userData.user }
    }).as('getUser');

    cy.intercept('POST', '**/api/orders', {
      statusCode: 200,
      body: require('../../fixtures/order.json')
    }).as('createOrder');

    cy.visit('/');
    cy.wait('@getIngredients');
  });

  afterEach(() =>
    cy
      .window()
      .then((win) => {
        win.localStorage.removeItem('accessToken');
        win.localStorage.removeItem('refreshToken');
      })
      .then(() => {
        cy.clearCookie('accessToken');
        cy.clearCookie('refreshToken');
      })
  );

  describe('Создание заказа', () => {
    it('Процесс создания заказа', () => {
      const bun = buns[0];
      const main = mains[0];

      cy.get(`[data-cy="burger-ingredient"][data-id="${bun._id}"]`)
        .find('[data-cy="add-ingredient-btn"]')
        .click();
      cy.get(`[data-cy="burger-ingredient"][data-id="${main._id}"]`)
        .find('[data-cy="add-ingredient-btn"]')
        .click();

      cy.get('[data-cy="order-button"]').click();

      cy.wait('@createOrder').then((interception) => {
        expect(interception.request.body).to.deep.equal({
          ingredients: [bun._id, main._id, bun._id]
        });
      });

      cy.get('[data-cy="order-modal"]').should('be.visible');
      cy.get('[data-cy="order-modal"]').within(() => {
        cy.contains(orderData.order.number.toString()).should('be.visible');
      });

      cy.get('[data-cy="ingredient-modal-close"]').click();
      cy.get('[data-cy="order-modal"]').should('not.exist');

      cy.get('[data-cy="constructor-no-bun-top"]').should(
        'contain',
        'Выберите булки'
      );

      cy.get('[data-cy="constructor-no-bun-bottom"]').should(
        'contain',
        'Выберите булки'
      );

      cy.get('[data-cy="constructor-ingredients-list"]').should(
        'contain',
        'Выберите начинку'
      );

      cy.get('[data-cy="constructor-total-price"]').should('contain', '0');
    });
  });

  describe('Добавление ингредиентов в конструктор', () => {
    it('Добавление начинки', () => {
      const main = mains[0];

      cy.get(`[data-cy="burger-ingredient"][data-id="${main._id}"]`)
        .find('[data-cy="add-ingredient-btn"]')
        .click();

      cy.get('[data-cy="constructor-ingredients-list"]')
        .find(`[data-cy="constructor-ingredient"][data-id="${main._id}"]`)
        .should('exist');

      cy.get('[data-cy="constructor-total-price"]').should(
        'contain',
        main.price.toString()
      );
    });
    it('добавление булок и начинок', () => {
      const bun = buns[0];
      const main = mains[0];
      const sauce = sauces[0];

      cy.get(`[data-cy="burger-ingredient"][data-id="${bun._id}"]`)
        .find('[data-cy="add-ingredient-btn"]')
        .click();

      cy.get('[data-cy="constructor-bun-top"]').should('contain', bun.name);

      cy.get('[data-cy="constructor-bun-bottom"]').should('contain', bun.name);

      cy.get(`[data-cy="burger-ingredient"][data-id="${main._id}"]`)
        .find('[data-cy="add-ingredient-btn"]')
        .click();

      cy.get('[data-cy="constructor-ingredients-list"]')
        .find(`[data-cy="constructor-ingredient"][data-id="${main._id}"]`)
        .should('exist');

      cy.get(`[data-cy="burger-ingredient"][data-id="${sauce._id}"]`)
        .find('[data-cy="add-ingredient-btn"]')
        .click();

      cy.get('[data-cy="constructor-ingredients-list"]')
        .find(`[data-cy="constructor-ingredient"][data-id="${sauce._id}"]`)
        .should('exist');

      const expectedPrice = bun.price * 2 + main.price + sauce.price;
      cy.get('[data-cy="constructor-total-price"]').should(
        'contain',
        expectedPrice.toString()
      );
    });
  });

  describe('Работа модальных окон ингредиентов', () => {
    it('Открытие модального окна ингредиента', () => {
      const ingredient = mains[0];

      cy.get(
        `[data-cy="burger-ingredient"][data-id="${ingredient._id}"]`
      ).click();

      cy.get('[data-cy="ingredient-modal"]')
        .should('be.visible')
        .should('contain', ingredient.name);

      cy.get('[data-cy="ingredient-modal"]').should('contain', ingredient.name);
    });

    it('Закрытие модального окна по клику на крестик', () => {
      const ingredient = sauces[0];

      cy.get(
        `[data-cy="burger-ingredient"][data-id="${ingredient._id}"]`
      ).click();

      cy.get('[data-cy="ingredient-modal"]').should('be.visible');

      cy.get('[data-cy="ingredient-modal-close"]').first().click();

      cy.get('[data-cy="ingredient-modal"]').should('not.exist');
    });

    it('В модалке отображаются данные выбранного ингредиента', () => {
      const ingredient = sauces[0];
      cy.get(
        `[data-cy="burger-ingredient"][data-id="${ingredient._id}"]`
      ).click();

      cy.contains(ingredient.name).should('be.visible');
      cy.contains(ingredient.price.toString()).should('be.visible');
      cy.get('img[src*="' + ingredient.image + '"]').should('be.visible');
    });
  });
});
