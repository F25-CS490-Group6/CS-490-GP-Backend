const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger options
const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "CS-490 GP API",
      version: "1.0.0",
      description: "StyGo backend API",
    },
    servers: [{ url: process.env.API_BASE_URL || "http://localhost:4000" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./app.js", "./modules/**/*.js", "./middleware/**/*.js"],
};

module.exports = swaggerJSDoc(options);
