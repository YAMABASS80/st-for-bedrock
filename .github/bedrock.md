# Supported Features

## Models Available in Amazon Bedrock

| Model Provider | Model Name | 
|:-----------:|:------------:|
|Anthropic||
|| Claude Sonnet 3.7 |
|| Claude Sonnet 3.5 v2  |
|| Claude Haiku 3.5 v2  |
|Amazon||
|| Nova Pro  |
|| Nova Lite  |
|| Nova Micro  |
|Amazon||
|| Nova Pro  |
|| Nova Lite  |
|| Nova Micro  |
|Cohere||
|| Command R+  |
|| Command R |
|Mistral AI||
|| Mistral Large 2 |
|| Mistral Large |
|| Mistral 8x7B instruct |
|Meta||
|| Llama 3.3 70B Instruct |
|| Llama 3.2 90B Vision Instruct |
|| Llama 3.2 11B Vision Instruct |
|| Llama 3.2 3B Instruct |
|| Llama 3.2 1B Instruct |
|| Llama 3.1 405B Instruct |
|| Llama 3.1 70B Instruct |
|| Llama 3.1 8B Instruct |
|| Llama 3 70B Instruct|
|| Llama 3 8B Instruct |
|Deepseek||
|| DeepSeek-R1 |


## Features Supported in SillyTavern
- Currently only Chat Completion is supported. Text Completion is not yet supported.


## Features Not Supported in SillyTavern
- Multimodal is not yet supported


# Setup Instructions

## Supported ST APIs
First, since only ST's Chat Completion is currently supported, please set the API to Chat Completion.
<img width="791" alt="image" src="https://github.com/user-attachments/assets/b2442ef0-2cd3-4e30-acae-77d5fa3f0bd4" />


## 1. IAM Setup

Since we're using Amazon Bedrock, you'll need IAM credentials to run it, but please follow AWS's [security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).

Create a policy with the minimum necessary permissions. These are the only policies needed to run this feature.
(Absolutely, under no circumstances, never use Administrator! I say again, never user Admin!)

```JSON
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream",
                "bedrock:GetFoundationModel"
            ],
            "Resource": "*"
        }
    ]
}
```


## 1a. When Running in Non-AWS Environments Like Desktop

Create an IAM user and attach the policy created in step 1.
The method for saving credentials is the same as [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html).

Note that CLI profiles are supported. Save the credentials you want to use with ST with a name.

```
[st-for-bedrck]
aws_access_key_id=AKIAI44QH8DHBEXAMPLE
aws_secret_access_key=je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY
```

In the setup screen, enter the profile name associated with your saved credentials in the "AWS CLI Profile" field.


<img width="812" alt="image" src="https://github.com/user-attachments/assets/7fbb3b44-63a4-4bc3-b61d-54127e1c7f2a" />

## 1b. When Using on AWS Environments Like Amazon EC2, EKS, or ECS

If you're using EC2 or containers with the policy created in step 1 attached, you don't need to configure anything.
(The AWS CLI profile field can be left empty.)


<img width="779" alt="image" src="https://github.com/user-attachments/assets/49752726-c03d-434f-94cd-9e4ee663e7ee" />


# Model Selection and Region Configuration
## Region Configuration
Amazon Bedrock is available in multiple regions. However, us-east-1 (N. Virginia) or us-west-2 (Oregon) are recommended.
These regions have the most models and are the easiest to use. When using other regions, please check if the model is supported.
https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html

<img width="779" alt="image" src="https://github.com/user-attachments/assets/c7a6575b-0ac2-464e-b766-b73adeeeddbb" />

## Model Configuration
Select the model from the dropdown menu.
<img width="759" alt="image" src="https://github.com/user-attachments/assets/108d789f-1da9-49c4-bb06-0f0a59b43e8a" />

However, this form doesn't check which models are supported in which regions, so please always verify that the model you selected is supported in your chosen region.

## Cross Region Inference

This might be a bit confusing, but some models only support Cross Region Inference. Notable examples include:
  
- Claude 3.7 Sonnet
- Amazon Nova
- Deepseek R1

When using such models, please turn on this checkbox.
image


# Connection Verification

After completing the settings, press the "Connect" button to verify the connection. If successful, you'll see a screen like this:

![image](https://github.com/user-attachments/assets/d80037d7-a6a5-481b-adec-6676ebbbb27c)

If you can't connect, check the response to the request sent to the "/status" path in your browser's developer mode. ST is designed to return error messages.
(I really couldn't figure out how to display error messages in the UI.)

# Inference Parameter Settings

Click the leftmost icon in the top menu bar and you'll see something like this.
As you can see, these are inference parameters. However, not all models support all of these parameters.

## Parameters Supported by All Models

- Context Size (tokens)
- Temperature
- Top P
- Stop Sequence

Other parameters like "Frequency Penalty" or "Presence Penalty" are ignored for models that don't support them.
(Currently, they only have an effect on Cohere Command R/R+)

<img width="445" alt="image" src="https://github.com/user-attachments/assets/df2061ae-ce56-4521-8403-fe0720d73323" />


## Reasoning

For models that support enabling/disabling Reasoning, toggling this checkbox will switch Reasoning on or off.
(Currently, only Claude 3.7 can do this...)

![image](https://github.com/user-attachments/assets/5ebaedb1-a1b1-4ad1-bd48-caaaca2bb944)

Also, even if you enable Reasoning, it's not yet displayed in the UI, so please be aware.
(Someone please create a rendering function)

By the way, while Deepseek R1 supports Reasoning, you can't toggle it on or off, so adjusting this setting won't have any effect.

--- 
# For Developers

## Contribution of Amazon Bedrock Converse API and ConverseStream API
Thanks to Amazon Bedrock's [Converse API](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/bedrock-runtime/command/ConverseCommand/) and [ConverseStream API](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/bedrock-runtime/command/ConverseStreamCommand/), we were able to support so many models at once. Supporting future models will also be much easier.

## Key Files

### Frontend
`public/index.html`  
All UI components are written here. Regarding Bedrock, the form is defined with the ID `bedrock_form`, so when you want to make changes, look for this and modify it.

`public/scripts/openai.js`  
While the code is quite complex, it essentially contains the requests from the frontend to ST endpoints (mainly `/generate` and `/status`) and the chat rendering functionality.

### Backend
For Chat Completion functionality:  
`src/endpoints/backends/chat-completions.js`

The `sendBedrockRequest()` function is where the actual request to Bedrock is sent.

Bedrock-specific logic is consolidated in `src/endpoints/bedrock.js`.
In particular, model-specific parameter processing is written here, so check this first when you want to extend functionality.

## Adding Models
When new models are released, you can configure them by adding options to the `bedrock_form` in index.html.
However, model-specific parameter processing must be added to `src/endpoints/bedrock.js`.

## SillyTavern
It's incredibly feature-rich, but the codebase is quite confusing. Making modifications other than adding models was quite challenging... (Someone please refactor it)
