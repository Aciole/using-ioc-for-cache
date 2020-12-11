import 'reflect-metadata';
import { Container } from 'inversify';

import { ICustomerReadRepository } from '../repository/customer.read.repository';
import { CustomerReadMySqlRepository } from '../repository/impl/customer.read.mysql.repository';
import { CustomerReadRedisRepository } from '../repository/impl/customer.read.redis.repository';

const ioc = new Container();

ioc
	.bind<ICustomerReadRepository>('CustomerReadRepository')
	.to(CustomerReadRedisRepository);
ioc.bind<ICustomerReadRepository>('MySQL').to(CustomerReadMySqlRepository);

export { ioc };
