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

// Generate spec
const swaggerSpec = swaggerJSDoc(options);

// Export a function that receives `app`
module.exports = (app) => {
  const { verifyAnyToken } = require("./middleware/verifyAnyTokens");
  const checkRoles = require("./middleware/checkRoles");

  // ✔ Raw JSON
  app.get("/docs.json", (req, res) => {
    res.json(swaggerSpec);
  });

  // ✔ Public Swagger UI (optional: remove if not needed)
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true })
  );

  // ✔ Protected Swagger UI for admins only
  app.use(
    "/admin/docs",
    verifyAnyToken,
    checkRoles("admin"),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true })
  );
};

// Also export the spec if needed elsewhere
module.exports.swaggerSpec = swaggerSpec;
