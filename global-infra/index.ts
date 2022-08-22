import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const cert_domain_name = config.require("cert_domain_name")
const base_domain_name = config.require("base_domain_name")

const zone = aws.route53.getZoneOutput({
    name: base_domain_name
});

const cert: aws.acm.Certificate = new aws.acm.Certificate(cert_domain_name, {
    domainName: cert_domain_name,
    validationMethod: 'DNS',
}, {
    retainOnDelete: true
});

cert.domainValidationOptions.apply(opts => {
    let i = 0;
    let records: aws.route53.Record[] = [];
    for (const option of opts) {
        let record = new aws.route53.Record(`validation-record-${i++}`, {
            type: option.resourceRecordType,
            zoneId: zone.zoneId,
            name: option.resourceRecordName,
            ttl: 600,
            records: [option.resourceRecordValue],
        });
        pulumi.log.info(`created ${i} record ${JSON.stringify(option)}`);
        records.push(record);
    }
});

export const defaultZoneId = zone.zoneId;
export const defaultCertArn = cert.arn;
