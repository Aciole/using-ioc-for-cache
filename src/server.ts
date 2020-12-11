import 'reflect-metadata';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as swagger from 'swagger-express-ts';
import './api/controller/customer.controller';
import { InversifyExpressServer } from 'inversify-express-utils';

import { ioc } from './config/ioc.config';

let server = new InversifyExpressServer(ioc);

server.setConfig((app) => {
	app.use(
		bodyParser.urlencoded({
			extended: true,
		})
	);
	app.use(bodyParser.json());
	app.use('/api-docs/swagger', express.static('src/api/swagger'));
	app.use(
		'/api-docs/swagger/assets',
		express.static('node_modules/swagger-ui-dist')
	);

	app.use(
		swagger.express({
			definition: {
				info: {
					title: 'My api customer',
					version: '1.0',
				},
			},
		})
	);
});

server.setErrorConfig((app: any) => {
	app.use(
		(
			err: Error,
			request: express.Request,
			response: express.Response,
			next: express.NextFunction
		) => {
			console.error(err.stack);
			response.status(500).send('Something broke!');
		}
	);
});

let app = server.build();
app.listen(3000, () => {
	console.log('Listening on http://localhost:3000/api-docs/swagger/');
});
