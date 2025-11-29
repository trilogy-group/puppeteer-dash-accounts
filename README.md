# Puppeteer Lambda Dash Accounts

**Test locally**
```bash
node --env-file=.env lambda/index.js
```

**Sync with Git**
```bash
git add .
git commit -m "Update automation logic"
git push
```

**Deployment**
```bash
sam build
sam deploy
```

**Links**
- [GitHub repository](https://github.com/trilogy-group/puppeteer-dash-accounts)
- [dash_create_admin_account](https://cs.cu-chulainn.csaiautomations.com/marketplace/skills/test/SKILL-19a06e2d-b339-4ddf-aa4d-42695f2b2f25) Cu Chulainn Skills
- [DashAdminAccountCreation](https://cs.cu-chulainn.csaiautomations.com/marketplace/packages/edit/PACKAGE-bd610b6b-69e9-4d4d-81d5-d3b3a9c2a9d8) Cu Chulainn Package
- [Lambda Function](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions/PuppeteerLambdaPuppeteerDashAccounts?subtab=url&tab=code)
- [CloudWatch Logs](https://us-east-1.console.aws.amazon.com/cloudwatch/home#logStream:group=/aws/lambda/PuppeteerLambdaPuppeteerDashAccounts)
- [/edu/dash/user_email](https://us-east-1.console.aws.amazon.com/systems-manager/parameters/%252Fedu%252Fdash%252Fuser_email/description?region=us-east-1&tab=Table#list_parameter_filters=Name:Contains:%2Fedu%2Fdash%2F) SSM parameters
- [/edu/dash/user_password](https://us-east-1.console.aws.amazon.com/systems-manager/parameters/%252Fedu%252Fdash%252Fuser_password/description?region=us-east-1&tab=Table#list_parameter_filters=Name:Contains:%2Fedu%2Fdash%2F) SSM parameters