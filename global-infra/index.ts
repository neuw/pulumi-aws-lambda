import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const app_cert_domain_name = config.require("app_cert_domain_name")
const app_base_domain_name = config.require("app_base_domain_name")
const api_cert_domain_name = config.require("api_cert_domain_name")
const api_base_domain_name = config.require("api_base_domain_name")


// refer based on existing - was created through console
const app_zone = aws.route53.getZoneOutput({
    name: app_base_domain_name
});

// otherwise may create it as below
const api_zone = new aws.route53.Zone(api_base_domain_name, {
    name: api_base_domain_name,
    comment: "dedicated to the api routes"
});

// aws wildcard cert for apps
const app_cert: aws.acm.Certificate = new aws.acm.Certificate(app_cert_domain_name, {
    domainName: app_base_domain_name,
    validationMethod: 'DNS',
    subjectAlternativeNames: [app_cert_domain_name]
}, {
    retainOnDelete: true
});

app_cert.domainValidationOptions.apply(opts => {
    let i = 0;
    let app_records: aws.route53.Record[] = [];
    for (const option of opts) {
        i++;
        let record = new aws.route53.Record(`app-dns-validation-record-${i}`, {
            type: option.resourceRecordType,
            zoneId: app_zone.zoneId,
            name: option.resourceRecordName,
            ttl: 600,
            records: [option.resourceRecordValue],
            allowOverwrite: false
        });
        pulumi.log.info(`created ${i} record ${JSON.stringify(option)}`);
        app_records.push(record);
    }
});

// aws wildcard cert for apis
const api_cert: aws.acm.Certificate = new aws.acm.Certificate(api_cert_domain_name, {
    domainName: api_base_domain_name,
    validationMethod: 'DNS',
    subjectAlternativeNames: [api_cert_domain_name]
}, {
    retainOnDelete: true
});

api_cert.domainValidationOptions.apply(opts => {
    let i = 0;
    let api_records: aws.route53.Record[] = [];
    for (const option of opts) {
        i++;
        let record = new aws.route53.Record(`api-dns-validation-record-${i}`, {
            type: option.resourceRecordType,
            zoneId: api_zone.zoneId,
            name: option.resourceRecordName,
            ttl: 600,
            records: [option.resourceRecordValue],
            allowOverwrite: false
        });
        pulumi.log.info(`created ${i} record ${JSON.stringify(option)}`);
        api_records.push(record);
    }
});

export const appZoneId = app_zone.zoneId;
export const appCertArn = app_cert.arn;
export const api_dns_nameservers = api_zone.nameServers; // helpful for configuring this to your domain provider - specially when it is non AWS.
export const apiZoneId = api_zone.zoneId;
export const apiCertArn = api_cert.arn;
export const apiDomain = api_base_domain_name;
export const appDomain = app_base_domain_name;
