
exports.awsHelperfunction = async function helper(args,client,name){
const { ListUsersCommand } = require("@aws-sdk/client-cognito-identity-provider"); 

    const modulePath = '@aws-sdk/client-cognito-identity-provider';
    const dynamicModule = require(modulePath);

    const module = dynamicModule[name];

    const command = new module(args)
    const response = await client.send(command);

    return response
}