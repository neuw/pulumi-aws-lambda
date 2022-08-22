- `mkdir pulumi-aws-lmabda` && `cd pulumi-aws-lmabda` - root folder for the project
- `mkdir apis` && `cd apis` - create a folder dedicated to the apis (will be backed by lambda behind api gateway)
- `pulumi new aws-typescript` - init pulumi using aws-typescript template
- A minimalistic structure will be generated

:warning: typescript is added as part of dev dependencies to make the tsc run better while compiling the lambda function's code.