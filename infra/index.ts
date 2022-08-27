import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import {ConfigData} from "./interfaces";
import {RecordType} from "@pulumi/aws/route53";
import * as domain from "domain";
import {Output} from "@pulumi/pulumi";

const stack: string = pulumi.getStack();
const pulumiConfig = new pulumi.Config();
const configData = pulumiConfig.requireObject<ConfigData>("data");

const globalInfra = new pulumi.StackReference(`${configData.org}/global-infra/default`);

// app ones not being used initially, will be used later for the website may be. ?!
const appZoneId = globalInfra.requireOutput("appZoneId");
const appCertArn = globalInfra.requireOutput("appCertArn");
const appDomain = globalInfra.requireOutput("appDomain");

const apiZoneId = globalInfra.requireOutput("apiZoneId");
const apiCertArn = globalInfra.requireOutput("apiCertArn");
const apiDomain = pulumi.interpolate `${configData.custom_api_sub_domain}.${globalInfra.requireOutput("apiDomain")}`;

function GetValue<T>(output: Output<T>) {
    return new Promise<T>((resolve, reject)=>{
        output.apply(value=>{
            resolve(value);
        });
    });
}

// no custom domain for lower environments - may be the ones specific to the devs individually
if (configData.custom_api_domain) {

    (async()=>{
        const domainName = await GetValue(apiDomain);

        const domain = new aws.apigatewayv2.DomainName(domainName, {
            domainName: domainName,
            domainNameConfiguration: {
                endpointType: 'REGIONAL',
                securityPolicy: 'TLS_1_2',
                certificateArn: apiCertArn
            }
        });

        const A_Record = new aws.route53.Record(domainName+"-A-record", {
            type: RecordType.A,
            name: domainName,
            zoneId: apiZoneId,
            aliases: [{
                zoneId: domain.domainNameConfiguration.hostedZoneId,
                name: domain.domainNameConfiguration.targetDomainName,
                evaluateTargetHealth: false
            }]
        });

        const AAAA_Record = new aws.route53.Record(domainName+"-AAAA-record", {
            type: RecordType.AAAA,
            name: domainName,
            zoneId: apiZoneId,
            aliases: [{
                zoneId: domain.domainNameConfiguration.hostedZoneId,
                name: domain.domainNameConfiguration.targetDomainName,
                evaluateTargetHealth: false
            }]
        });

    })();

}

export const customApiDomainName = apiDomain;