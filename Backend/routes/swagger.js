const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const express = require('express');
const router = express.Router();

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = router;
