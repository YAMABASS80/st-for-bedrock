# サーポートしている機能

## Amazon Bedrockで使えるモデル

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


## SillyTavernでサポートしている機能
- 今のところChat Completionだけ。Text Completionは未サポート。


## SillyTavernでサポート指定ない機能
- マルチモーダルは未サポート


# セットアップ方法

Amazon Bedrockを使うので、IAMクレデンシャルがないと動かないですがAWSの[セキュリティベストプラクティス](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)に従ってください。

## 1 IAMポリシーをセットアップ

必要最低限のポリシーを作成します。この機能を動かすのに必要なポリシーはこれだけ。
(絶対に、何があってもAdministratorとか使うな！！俺は言ったぞ？)

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

## 1a. デスクトップなどAWS外の環境で動かすとき

IAMユーザーを作成して、手順1で作成したポリシーをアタッチする。
クレデンシャルの保存方法は[AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html)と同じです。

ここで注目すべきは、CLIプロファイルをサポートしてることです。STで使いたいクレデンシャルに名前をつけて保存しておきます。

```
[st-for-bedrck]
aws_access_key_id=AKIAI44QH8DHBEXAMPLE
aws_secret_access_key=je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY
```




## 1b. Amazon EC2やEKS、ECSなどAWS環境上で使うとき

手順1で作ったポリシーがアタッチされたEC2、コンテナなら何も設定しなくていいです。