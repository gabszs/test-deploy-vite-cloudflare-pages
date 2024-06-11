/// <reference types="cypress" />
export interface EtherealCreds {
  email: string
  pass: string
}

declare global {
  namespace Cypress {
    interface Chainable {
      getWithAttr(attr: string): Cypress.Chainable<JQuery<HTMLElement>>
      fillAuthCreds(email: string, password: string): void
      fillSignUp(name: string, email: string, password: string): void
      checkTotals(streams: number, assets: number, uniques: number): void
      waitForStream(): void
    }
  }
}

Cypress.Commands.add(
  "checkTotals",
  (streams: number, assets: number, uniques: number) => {
    cy.contains(`Streams: ${streams}`)
    cy.contains(`Assets: ${assets}`)
    cy.contains(`Unique assets: ${uniques}`)
  }
)

Cypress.Commands.add(
  "fillSignUp",
  (name: string, email: string, password: string) => {
    cy.getWithAttr("name").type(name)
    cy.fillAuthCreds(email, password)
  }
)

Cypress.Commands.add("waitForStream", () => {
  cy.intercept("POST", "/streams").as("newStream")
  cy.getWithAttr("submitBtn").click()
  cy.wait("@newStream")
})
Cypress.Commands.add("getWithAttr", (attr: string) => {
  return cy.get(`[data-cy=${attr}]`)
})

Cypress.Commands.add("fillAuthCreds", (email: string, password: string) => {
  cy.getWithAttr("email").type(email)
  cy.getWithAttr("password").type(password)
  cy.getWithAttr("submitForm").click()
})
