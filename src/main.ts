import { ICustomerReadRepository } from './repository/customer.read.repository';
import { ioc } from './config/ioc.config';

async function main() {
	console.log(
		await ioc
			.get<ICustomerReadRepository>('CustomerReadRepository')
			.getById('2')
	);
}

main();
