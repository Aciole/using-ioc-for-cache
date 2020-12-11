Um pequeno exemplo, implementado cache em consulta aplicando dois conceitos do acrônimo SOLID, "ISP" e "DIP".

## Princípio da segregação de Interface (ISP)

> "muitas interfaces de clientes específicas, são melhores do que uma para todos propósitos."

Em outras palavras "Seja coeso na criação de interfaces para que não seja necessario fazer implementação desnecessaria em classes especializadas"(quanto maus enxuta melhor).

Trabalharemos em cima da interface **ICustomerReadRepository** que possui o método
**getById**:

```ts
import { CustomerModel } from '../models/customer.model';

export interface ICustomerReadRepository {
	getById(id: string): Promise<CustomerModel>;
}
```

A implementação que seguirá logo abaixo tem um [Decorator](https://www.typescriptlang.org/docs/handbook/decorators.html) **@injectable** que indica para a biblioteção de ioc, que essa classe pode ser "Injetada", como veremos no próximo tópico;

```ts
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

	async getById(id: string): Promise<CustomerModel> {
		let customerResult: CustomerModel;

		const result = this.dbMySql.find((data) => data.id == id);
		if (result != null) {
			customerResult = result;
			console.log('customer found in mysql:', result);
			return await new Promise((resolve) => resolve(customerResult));
		}

		return await new Promise((resolve) => resolve(customerResult));
	}
}
```

## Princípio da inversão de dependência (DIP)

> "deve-se depender de abstrações, não de objetos concretos."

Para fazer a inversão de controle estou usando a biblioteca [inversify](https://inversify.io/)

A implementação dela é bastante simples:

```ts
import 'reflect-metadata';
import { Container } from 'inversify';

import { ICustomerReadRepository } from '../repository/customer.read.repository';
import { CustomerReadMySqlRepository } from '../repository/impl/customer.read.mysql.repository';

const ioc = new Container();

ioc
	.bind<ICustomerReadRepository>('CustomerReadRepository>')
	.to(CustomerReadMySqlRepository);

export { ioc };
```

Como resolver esse injeção manualmente:

```ts
import { ioc } from './config/ioc.config';
import { ICustomerReadRepository } from './repository/customer.read.repository';
import { CustomerModel } from './models/customer.model';

const main = async (id: string): Promise<CustomerModel> => {
	const repository = ioc.get<ICustomerReadRepository>('CustomerReadRepository');

	return await repository.getById(id);
};

console.log('result', await main('1'));
```

Com decorator (fica mais sexy, não é?):

```ts
...
class CustomerControler {
	constructor(
		@inject('CustomerReadRepository')
		private customerReadRepository: ICustomerReadRepository
		) {
	}

	async getById(id: string): Promise<CustomerModel> {
		return await this.customerReadRepository.getById(id);
	}
}

```

## Getting Started

First, run the development server:

```bash
npm run start
# or
yarn start

```

Open [http://localhost:3000/api-docs/swagger/](http://localhost:3000/api-docs/swagger/) with your browser to see the result.
