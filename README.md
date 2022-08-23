- `mkdir pulumi-aws-lmabda` && `cd pulumi-aws-lmabda` - root folder for the project
- `mkdir apis` && `cd apis` - create a folder dedicated to the apis (will be backed by lambda behind api gateway)
- `pulumi new aws-typescript` - init pulumi using aws-typescript template
- A minimalistic structure will be generated

:warning: typescript is added as part of dev dependencies to make the tsc run better while compiling the lambda function's code.

- starting at the root folder level of project - which is inside `pulumi-aws-lmabda`
- `mkdir global-infra` && `cd global-infra` - create a folder dedicated to the global infra (like cert and route 53 DNS, public zone was manually created, it is referred through domain, but we may also generate that programmatically)
- `pulumi new aws-typescript` - init pulumi using aws-typescript template
- the config for the cert domain(wildcard cert) and the hosted zone domain - are made part of the config

:warning: For all the submodules(infra, apis, etc.) the AWS_PROFILE env variable was present, and only then the pulumi up command used to work - otherwise there will be a runtime error