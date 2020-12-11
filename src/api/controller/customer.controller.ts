import {
	interfaces,
	controller,
	httpGet,
	request,
	response,
	requestParam,
} from 'inversify-express-utils';

import 'reflect-metadata';
import {
	ApiOperationGet,
	ApiPath,
	SwaggerDefinitionConstant,
} from 'swagger-express-ts';
import '../../models/customer.model';

import * as express from 'express';
import { inject } from 'inversify';
import { ICustomerReadRepository } from '../../repository/customer.read.repository';

@ApiPath({
	name: 'customer',
	path: '/customer',
})
@controller('/customer')
export class CustomerController implements interfaces.Controller {
	/**
	 *
	 */
	constructor(
		@inject('CustomerReadRepository')
		private customerReadRepository: ICustomerReadRepository
	) {}

	@ApiOperationGet({
		path: '/{id}',
		parameters: {
			path: {
				id: {
					required: true,
					type: SwaggerDefinitionConstant.Parameter.Type.STRING,
				},
			},
		},
		responses: {
			200: {
				model: 'Customer',
			},
			404: {},
			500: {},
		},
	})
	@httpGet('/:id')
	private async getById(
		@requestParam('id') id: string,
		@request() request: express.Request,
		@response() response: express.Response
	) {
		const result = await this.customerReadRepository.getById(id);

		if (result == null) {
			return response.status(404).json({ message: 'customer not found' });
		}

		return response.status(200).json(result);
	}
}
