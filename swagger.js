const swaggerJSDoc = require("swagger-jsdoc");

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
  // Scan your actual code; adjust if you want fewer files
  apis: ["./app.js", "./modules/**/*.js", "./middleware/**/*.js"],
};

module.exports = swaggerJSDoc(options);

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

// Serve raw spec
app.use("/docs.json", (req, res) => res.json(swaggerSpec));
// Serve UI (wrap with auth if you want admin-only)
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

const { verifyAnyToken } = require("./middleware/verifyAnyTokens");
const checkRoles = require("./middleware/checkRoles");

app.use(
  "/docs",
  verifyAnyToken,
  checkRoles("admin"),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);
