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

// Generate swagger spec
const swaggerSpec = swaggerJSDoc(options);

// Export swagger setup function
module.exports = (app) => {
  const { verifyAnyToken } = require("./middleware/verifyAnyTokens");
  const checkRoles = require("./middleware/checkRoles");

  // Raw JSON
  app.get("/docs.json", (req, res) => res.json(swaggerSpec));

  // Public docs (optional)
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Protected admin docs
  app.use(
    "/admin/docs",
    verifyAnyToken,
    checkRoles("admin"),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );
};

// export spec if needed
module.exports.swaggerSpec = swaggerSpec;
