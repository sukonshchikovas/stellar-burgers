/// <reference types="cypress" />
import userData from '../../fixtures/user.json';
import orderData from '../../fixtures/order.json';

describe('Burger Constructor - Интеграционные тесты', () => {
  const SELECTORS = {
    orderModal: '[data-cy="order-modal"]',
    ingredientModal: '[data-cy="ingredient-modal"]',
    ingredientModalClose: '[data-cy="ingredient-modal-close"]',

    burgerIngredient: '[data-cy="burger-ingredient"]',
    addIngredientBtn: '[data-cy="add-ingredient-btn"]',

    constructorIngredientsList: '[data-cy="constructor-ingredients-list"]',
    constructorIngredient: '[data-cy="constructor-ingredient"]',
    constructorTotalPrice: '[data-cy="constructor-total-price"]',
    constructorBunTop: '[data-cy="constructor-bun-top"]',
    constructorBunBottom: '[data-cy="constructor-bun-bottom"]',
    constructorNoBunTop: '[data-cy="constructor-no-bun-top"]',
    constructorNoBunBottom: '[data-cy="constructor-no-bun-bottom"]',
    orderButton: '[data-cy="order-button"]'
  } as const;

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

    cy.visit('http://localhost:4000');
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

      cy.get(`${SELECTORS.burgerIngredient}[data-id="${bun._id}"]`)
        .find(SELECTORS.addIngredientBtn)
        .click();
      cy.get(`${SELECTORS.burgerIngredient}[data-id="${main._id}"]`)
        .find(SELECTORS.addIngredientBtn)
        .click();

      cy.get(SELECTORS.orderButton).click();

      cy.wait('@createOrder').then((interception) => {
        expect(interception.request.body).to.deep.equal({
          ingredients: [bun._id, main._id, bun._id]
        });
      });

      cy.get(SELECTORS.orderModal).should('be.visible');
      cy.get(SELECTORS.orderModal).within(() => {
        cy.contains(orderData.order.number.toString()).should('be.visible');
      });

      cy.get(SELECTORS.ingredientModalClose).click();
      cy.get(SELECTORS.orderModal).should('not.exist');

      cy.get(SELECTORS.constructorNoBunTop).should('contain', 'Выберите булки');

      cy.get(SELECTORS.constructorNoBunBottom).should(
        'contain',
        'Выберите булки'
      );

      cy.get(SELECTORS.constructorIngredientsList).should(
        'contain',
        'Выберите начинку'
      );

      cy.get(SELECTORS.constructorTotalPrice).should('contain', '0');
    });
  });

  describe('Добавление ингредиентов в конструктор', () => {
    it('Добавление начинки', () => {
      const main = mains[0];

      cy.get(`${SELECTORS.burgerIngredient}[data-id="${main._id}"]`)
        .find(SELECTORS.addIngredientBtn)
        .click();

      cy.get(SELECTORS.constructorIngredientsList)
        .find(`${SELECTORS.constructorIngredient}[data-id="${main._id}"]`)
        .should('exist');

      cy.get(SELECTORS.constructorTotalPrice).should(
        'contain',
        main.price.toString()
      );
    });
    it('добавление булок и начинок', () => {
      const bun = buns[0];
      const main = mains[0];
      const sauce = sauces[0];

      cy.get(`${SELECTORS.burgerIngredient}[data-id="${bun._id}"]`)
        .find(SELECTORS.addIngredientBtn)
        .click();

      cy.get(SELECTORS.constructorBunTop).should('contain', bun.name);

      cy.get(SELECTORS.constructorBunBottom).should('contain', bun.name);

      cy.get(`${SELECTORS.burgerIngredient}[data-id="${main._id}"]`)
        .find(SELECTORS.addIngredientBtn)
        .click();

      cy.get(SELECTORS.constructorIngredientsList)
        .find(`${SELECTORS.constructorIngredient}[data-id="${main._id}"]`)
        .should('exist');

      cy.get(`${SELECTORS.burgerIngredient}[data-id="${sauce._id}"]`)
        .find(SELECTORS.addIngredientBtn)
        .click();

      cy.get(SELECTORS.constructorIngredientsList)
        .find(`${SELECTORS.constructorIngredient}[data-id="${sauce._id}"]`)
        .should('exist');

      const expectedPrice = bun.price * 2 + main.price + sauce.price;
      cy.get(SELECTORS.constructorTotalPrice).should(
        'contain',
        expectedPrice.toString()
      );
    });
  });

  describe('Работа модальных окон ингредиентов', () => {
    it('Открытие модального окна ингредиента', () => {
      const ingredient = mains[0];

      cy.get(
        `${SELECTORS.burgerIngredient}[data-id="${ingredient._id}"]`
      ).click();

      cy.get(SELECTORS.ingredientModal)
        .should('be.visible')
        .should('contain', ingredient.name);

      cy.get(SELECTORS.ingredientModal).should('contain', ingredient.name);
    });

    it('Закрытие модального окна по клику на крестик', () => {
      const ingredient = sauces[0];

      cy.get(
        `${SELECTORS.burgerIngredient}[data-id="${ingredient._id}"]`
      ).click();

      cy.get(SELECTORS.ingredientModal).should('be.visible');

      cy.get(SELECTORS.ingredientModalClose).first().click();

      cy.get(SELECTORS.ingredientModal).should('not.exist');
    });

    it('В модалке отображаются данные выбранного ингредиента', () => {
      const ingredient = sauces[0];
      cy.get(
        `${SELECTORS.burgerIngredient}[data-id="${ingredient._id}"]`
      ).click();

      cy.contains(ingredient.name).should('be.visible');
      cy.contains(ingredient.price.toString()).should('be.visible');
      cy.get('img[src*="' + ingredient.image + '"]').should('be.visible');
    });
  });
});
