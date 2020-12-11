import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
	description: 'Customer',
	name: 'Customer',
})
export class CustomerModel {
	@ApiModelProperty()
	public id: string;

	@ApiModelProperty()
	public name: string;

	constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}
}
