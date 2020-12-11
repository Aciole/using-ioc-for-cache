import { CustomerModel } from '../models/customer.model';

export interface ICustomerReadRepository {
	getById(id: string): Promise<CustomerModel | undefined>;
}
