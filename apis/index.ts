import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const stack = pulumi.getStack();

const lambdaRole = new aws.iam.Role("Role-Lambda-Test-Apis", {
    assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [
            {
                Action: "sts:AssumeRole",
                Principal: {
                    Service: "lambda.amazonaws.com",
                },
                Effect: "Allow",
                Sid: "",
            },
        ],
    },
});

const lambdaRoleAttachment = new aws.iam.RolePolicyAttachment("Role-Attachment-Test-Apis", {
    role: lambdaRole,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});

const lambda = new aws.lambda.Function("Lambda-Function", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app"),
    }),
    runtime: "nodejs16.x",
    role: lambdaRole.arn,
    handler: "index.handler",
});

const apigw = new aws.apigatewayv2.Api("Http-Api-Gateway", {
    protocolType: "HTTP"
});

const lambdaPermission = new aws.lambda.Permission("Lambda-Permission-Test-Apis", {
    action: "lambda:InvokeFunction",
    principal: "apigateway.amazonaws.com",
    function: lambda,
    sourceArn: pulumi.interpolate`${apigw.executionArn}/*/*`,
}, {dependsOn: [apigw, lambda]});

const integration = new aws.apigatewayv2.Integration("Lambda-Integration-Test-Apis", {
    apiId: apigw.id,
    integrationType: "AWS_PROXY",
    integrationUri: lambda.arn,
    integrationMethod: "POST",
    payloadFormatVersion: "2.0",
    passthroughBehavior: "WHEN_NO_MATCH"
});

const route = new aws.apigatewayv2.Route("API-Route-Test-Apis", {
    apiId: apigw.id,
    routeKey: "$default",
    target: pulumi.interpolate`integrations/${integration.id}`
});

const stage = new aws.apigatewayv2.Stage("API-Stage-Test-Apis", {
    apiId: apigw.id,
    name: stack,
    routeSettings: [
        {
            routeKey: route.routeKey,
            throttlingBurstLimit: 5000,
            throttlingRateLimit: 10000,
        },
    ],
    autoDeploy: true,
}, {dependsOn: [route]});

export const endpoint = pulumi.interpolate`${apigw.apiEndpoint}/${stage.name}`;
