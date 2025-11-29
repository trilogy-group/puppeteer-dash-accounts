# Puppeteer Lambda Template

This template helps you to build Cu Chulainn skills that use Puppeteer browser automation.
It includes a Lambda layer with **Chromium 141.0.0** and **puppeteer-core 24.23.0**.

<br>
<br>

## 💻 Local Development

**Test your function locally and watch the progress in a Chromium window**
```bash
node --env-file=.env index.js
```

**5. Sync with Git regularly**
```bash
git add ..
git commit -m "Update automation logic"
git push
```

<br>
<br>

## 🧪 Sandbox Testing

**1. AWS setup (only once)** 
- You must belong to `RAM-AWS-CoreSupport-Admin` AD Group. If required, you can request this through this [ITOPS form](https://supportportal-df.atlassian.net/servicedesk/customer/portal/6/group/76/create/367)
- Create a service user for AWS CLI in [IAM Console](https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/users) 
- The service user must have write access to Lambda.
- Go to the **Security credentials** tab for the user and create a new **Access Key**.
- Configure AWS CLI locally from any terminal by running this command ```aws configure```
- Enter the generated **Access Key ID** and **Secret Access Key** when prompted.
- Use us-east-1 as the region

<br>

**2. Create SSM parameters for any credentials**
- Create a new parameter in [SSM](https://us-east-1.console.aws.amazon.com/systems-manager/parameters?region=us-east-1&tab=Table) 
- Use a name like `/your-product/your-app/password`
- Select **SecureString** as the type and paste your password as the value

<br>

**3. Deployment**
- Run these commands one by one to deploy your lambda function to AWS:
```bash
cd ..
sam build
sam deploy
```

<br>

**4. Locate your Lambda in AWS**
- Find your function in the [Lambda Console](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions)
- Search for `PuppeteerLambda` and select your new Lambda
- Go to **Configuration** > **Function URL** > **Create function URL**
- Select **NONE** for Auth type and click **Save**
- Copy the generated **Function URL**.

<br>

**5. Cu Chulainn Dev Skills(s)**
- Create your [Skill(s)](https://cs-dev.cu-chulainn.csaiautomations.com/marketplace/skills/add)
- Use your lambda function URL in the URL Endpoint field
- Skill authentication can be a random password that will be stored by Cu Chulainn
- Timeout should be adjusted if your skill will take longer than 30 seconds to execute
- Add input parameters if there are any variables that should be gathered from the ticket
- The output should generally be a string and the description should be something like "response message"
- Note: When testing this skill, you will not see the chromium window, but the output should match what is seen locally

<br>

**6. Cu Chulainn Dev Package**
- Create your [Package](https://cs-dev.cu-chulainn.csaiautomations.com/marketplace/packages/add)
- The workflow will describe what the agents should do on the ticket and tells it when to use your skill
- Use the KayakoAgent in the Helper Agents field
- Use your new Skill in the Active Skills field

<br>

**7. Kayako Sandbox**
- Create a ticket on the [Kayako sandbox environment](https://cs-sandbox.kayako.com/agent/conversations/)
- Add an internal note or PR that would mimic a real ticket
- Invoke your Cu Chulainn package using the Cu Chulainn Macro (This needs to be set up, but im not admin)

<br>

**8. Iterate**
- If you make any changes to the Package workflow, repeat the "Kayako Sandbox" steps again
- If you make any changes to the Code, repeat the "Deployment" and "Kayako Sandbox" steps again

<br>
<br>

## 🚀 Go Live

**1. Cu Chulainn Production**
- Duplicate your [Skill(s)](https://cs.cu-chulainn.csaiautomations.com/marketplace/skills/add) and Package to the CS Production environment
- Duplicate your [Package](https://cs.cu-chulainn.csaiautomations.com/marketplace/packages/add) to the CS Production environment

<br>

**2. Configure ATLAS Routing**
- Ask the product VP to set up Routes and Components in [ATS](https://atlas-ticket.csaiautomations.com/) to invoke the package on Kayako tickets

<br>

**3. Monitoring**
- You are responsible for the automation
- Fix any issues manually
- Update your Package or Skill to prevent future failures