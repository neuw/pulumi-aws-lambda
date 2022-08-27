import {
    APIGatewayEvent,
    APIGatewayEventRequestContext,
    APIGatewayProxyResultV2
} from "aws-lambda";

import { faker } from '@faker-js/faker';

exports.handler =  async function(event: APIGatewayEvent, context: APIGatewayEventRequestContext): Promise<APIGatewayProxyResultV2> {
    let name = event.queryStringParameters ? (event.queryStringParameters["name"] ? event.queryStringParameters["name"]: faker.name.fullName()) : faker.name.fullName();
    console.log("name --->", name)
    console.log("EVENT: \n" + JSON.stringify(event, null, 2))
    return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({message:"Hello to the world powered by Pulumi!", name})
    };
}