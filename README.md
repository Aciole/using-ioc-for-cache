Um pequeno exemplo, implementado cache em consulta aplicando dois conceitos do acrônimo SOLID, "OCP","ISP" e "DIP".

## Princípio da segregação de Interface (ISP)

> "Muitas interfaces de clientes específicas, são melhores do que uma para todos propósitos."

Em outras palavras "Seja coeso na criação de interfaces para que não seja necessario fazer implementação desnecessaria em classes especializadas"(quanto mais enxuta melhor).

Trabalharemos em cima da interface **ICustomerReadRepository** que possui o método
**getById**:

```ts
import { CustomerModel } from '../models/customer.model';

export interface ICustomerReadRepository {
	getById(id: string): Promise<CustomerModel | undefined>;
}
```

A implementação que seguirá logo abaixo tem um [Decorator](https://www.typescriptlang.org/docs/handbook/decorators.html) **@injectable** que indica para a biblioteção de ioc, que essa classe pode ser "Injetada", como veremos no próximo tópico;

```ts
import { injectable } from 'inversify';

import { CustomerModel } from '../../models/customer.model';
import { ICustomerReadRepository } from '../customer.read.repository';

@injectable()
export class CustomerReadMySqlRepository implements ICustomerReadRepository {
	...
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
```

## Princípio da inversão de dependência (DIP)

> "Deve-se depender de abstrações, não de objetos concretos."

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

const main = async (id: string) => {
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

	async getById(id: string)  {
		return await this.customerReadRepository.getById(id);
	}
}

```

## Ah beleza, e o cache de maneira elegante?

> Preciso adicionar cache em uma consulta respeitando o SOLID,
> onde primeiro faço uma consulta no cache, caso não exista, consulto na minha base,
> se retornar resultado, adicionar no cache e retorna o valor para o requisitor.

## Princípio do Aberto/Fechado (OCP)

> "Entidades de software devem ser abertas para extensão, mas fechadas para modificação."

Não quero modificar nada em relação a requisitor dessa consulta;

### Primeiro passo

Realizar a implementação da consulta do cache:

```ts
import { injectable, inject } from 'inversify';

import { CustomerModel } from '../../models/customer.model';
import { ICustomerReadRepository } from '../customer.read.repository';

@injectable()
export class CustomerReadRedisRepository implements ICustomerReadRepository {
	...
	async getById(id: string): Promise<CustomerModel | undefined>  {
		let customerResult: CustomerModel | undefined = this.dbRedis.find(
			(data) => data.id === id
		);

		if (customerResult != null) {
			console.log('customer found in cache');
			return await new Promise((resolve) => resolve(customerResult));
		}

		return customerResult;
	}

	private async setCache(customer: CustomerModel): Promise<void> {
		console.log('customer set in cache: ', customer);
		this.dbRedis.push(customer);
	}
```

### Segundo passo

Modifique a configuração do ioc, e adicionar essa nova classe para ser injetada:

```ts
import 'reflect-metadata';
import { Container } from 'inversify';

import { ICustomerReadRepository } from '../repository/customer.read.repository';
import { CustomerReadMySqlRepository } from '../repository/impl/customer.read.mysql.repository';
// não esquece de importar Pô
import { CustomerReadRedisRepository } from '../repository/impl/customer.read.redis.repository';

const ioc = new Container();

//troquei a chave que indica qual classe trocar
ioc.bind<ICustomerReadRepository>('MySQL').to(CustomerReadMySqlRepository);

// coloque a chave anterior no cache para ele ser o primeiro a ser inicializador
ioc
	.bind<ICustomerReadRepository>('CustomerReadRepository')
	.to(CustomerReadRedisRepository);

export { ioc };
```

### Terceiro passo

Agora vou adicionar a **magia**, adicione a injeção da consulta em base, na classe de cache (é ficou confuso essa frase, vamos ao código, que fica fácil de entender):

```ts
import { injectable, inject } from 'inversify';

import { CustomerModel } from '../../models/customer.model';
import { ICustomerReadRepository } from '../customer.read.repository';

@injectable()
export class CustomerReadRedisRepository implements ICustomerReadRepository {
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
		/// implementação
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
    ...

```

Fim, é algo bem simples, mas podeser usado atém em camadas anti-corrupção, enfim se tiver curiosidade/dúvida sobre configuração em uma api express, swagger, execute esse projeto, tem mais código hehe.

## Para Executar o Projeto

Executa no seu terminal/CMD:

```bash
npm install
# or
yarn

```

Depois inicie a aplicação

```bash
npm run start
# or
yarn start

```

Abrir no navegador [http://localhost:3000/api-docs/swagger/](http://localhost:3000/api-docs/swagger/)
