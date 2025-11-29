const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

const ssmClient = new SSMClient({ region: 'us-east-1' });

async function getSsmParameter(name) {
  if (process.env[name]) return process.env[name];

  const resp = await ssmClient.send(
    new GetParameterCommand({
      Name: name,
      WithDecryption: true,
    }),
  );

  return resp.Parameter.Value;
}

module.exports = { getSsmParameter };
