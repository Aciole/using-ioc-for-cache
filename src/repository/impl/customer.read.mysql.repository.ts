import { injectable } from 'inversify';

import { CustomerModel } from '../../models/customer.model';
import { ICustomerReadRepository } from '../customer.read.repository';

@injectable()
export class CustomerReadMySqlRepository implements ICustomerReadRepository {
	private dbMySql: CustomerModel[] = [
		{
			id: '2',
			name: 'martin fowler',
		},
		{
			id: '3',
			name: 'vernon vaughn',
		},
	];

	async getById(id: string): Promise<CustomerModel | undefined> {
		let customerResult: CustomerModel | undefined;

		const result = this.dbMySql.find((data) => data.id == id);
		if (result != null) {
			customerResult = result;
			console.log('customer found in mysql:', result);
			return await new Promise((resolve) => resolve(customerResult));
		}

		return await new Promise((resolve) => resolve(customerResult));
	}
}
