// /// <reference types="cypress" />
// // ***********************************************
// Cypress.Commands.add('mockIngredients', () => {
//   cy.fixture('ingrediens').then((ingredients) => {
//     cy.intercept('GET', '/api/ingredietns', {
//       statusCode: 200,
//       body: {
//         success: true,
//         data: ingredients
//       }
//     }).as('getIngredients');
//   });
// });

// Cypress.Commands.add('mockUser', () => {
//   cy.fixture('user').then((user) => {
//     cy.intercept('GET', '/api/auth/user', {
//       statusCode: 200,
//       body: user
//     }).as('getUser');
//   });
// });

// // Мокаем создание заказа
// Cypress.Commands.add('mockCreateOrder', () => {
//   cy.fixture('order').then((order) => {
//     cy.intercept('POST', '/api/orders', {
//       statusCode: 200,
//       body: order
//     }).as('createOrder');
//   });
// });

// // Добавляем токен авторизации в localStorage
// Cypress.Commands.add('loginWithToken', (token: string = 'mock-jwt-token') => {
//   window.localStorage.setItem('accessToken', token);
//   // Для refreshToken при необходимости:
//   // window.localStorage.setItem('refreshToken', 'mock-refresh-token');
// });

// // Helper: добавление ингредиента в конструктор
// Cypress.Commands.add('addIngredientToConstructor', (ingredientId: string) => {
//   cy.get(`[data-cy="ingredient-${ingredientId}"]`)
//     .find('[data-cy="add-button"]')
//     .click();
// });

// // Helper: получение элемента конструктора по ID
// Cypress.Commands.add('getConstructorItem', (ingredientId: string) =>
//   cy.get(`[data-cy="constructor-item-${ingredientId}"]`)
// );
// beforeEach(() => {
//   cy.intercept('GET', '**/api/ingredients', {
//     statusCode: 200,
//     body: ingredientsData
//   }).as('getIngredients');
//   cy.visit('http://localhost:4000/');
// });
