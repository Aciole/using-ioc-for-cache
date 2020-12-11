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

	constructor(@inject('MySQL') private inner: ICustomerReadRepository) {}

	async getById(id: string): Promise<CustomerModel> {
		const customerInCache = this.dbRedis.find((data) => data.id == id);

		if (customerInCache != null) {
			console.log('customer found in cache');
			return await new Promise((resolve) => resolve(customerInCache));
		}

		const resultCustomerSql = await this.inner.getById(id);

		if (resultCustomerSql != null) {
			this.setCache(resultCustomerSql);
		}

		return resultCustomerSql;
	}

	private async setCache(customer: CustomerModel): Promise<void> {
		console.log('customer set in cache: ', customer);
		this.dbRedis.push(customer);
	}
}
