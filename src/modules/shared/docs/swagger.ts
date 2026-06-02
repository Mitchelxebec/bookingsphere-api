import swaggerJsDocs from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BookingSphere API",
      version: "1.0.0",
      description: "Hotel booking platform API",
    },
    servers: [
      {
        url: "/api/v1",
        description: "Current API version",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/modules/**/*.ts"],
};

export const swaggerSpec = swaggerJsDocs(options)
