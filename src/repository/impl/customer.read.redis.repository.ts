import { injectable, inject } from 'inversify';

import { CustomerModel } from '../../models/customer.model';
import { ICustomerReadRepository } from '../customer.read.repository';

@injectable()
export class CustomerReadRedisRepository implements ICustomerReadRepository {
	private dbRedis: CustomerModel[] = [
		{
			id: '1',
			name: 'Aciole',
		},
	];

	constructor(
		@inject('MySQL') private mysqlRepository: ICustomerReadRepository
	) {}

	async getById(id: string): Promise<CustomerModel | undefined> {
		let customerResult: CustomerModel | undefined = this.dbRedis.find(
			(data) => data.id === id
		);

		if (customerResult != null) {
			console.log('customer found in cache');
			return await new Promise((resolve) => resolve(customerResult));
		}

		customerResult = await this.mysqlRepository.getById(id);

		if (customerResult != null) {
			this.setCache(customerResult);
		}

		return customerResult;
	}

	private async setCache(customer: CustomerModel): Promise<void> {
		console.log('customer set in cache: ', customer);
		this.dbRedis.push(customer);
	}
}
