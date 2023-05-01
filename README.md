# IDS721-Teamproject

IDS721 Cloud Computing - Team Project

## 0.1 Introduction 

In this project, we build a web application that allows users to enter a prompt, then return a generated image by ***OpenAI DALLE API***. This project aims to provide inspiration to people mentioned in section 0.2. Users can specify the height-width ratio of the returning image.

### 0.2. User Groups
The web application is intended for use by individuals and organizations who require high-quality generated images for various purposes. This includes artists, graphic designers, web developers, and more.

### 0.3. Applications
The generated images can be used for a variety of applications, including but not limited to:
- Art and design projects
- Marketing and advertising campaigns
- Website and social media graphics
- E-commerce product images
- Education and research projects
- And much more!

### 1. OpenAI API Key
You have to obtain your OpenAI API Key to request image generations, variations, or edits. 


## 2. Demo
### 2.1 Video Demo
Video is submitted to teams

## 3. Getting Started

This project is built into Docker image, but if your want to deploy it locally, here's the guide:

First, install ```node.js``` by ```brew``` on Mac platform:

```bash
brew update
brew install node
```
Then, check your node version by:

```bash
node -v
```
<!-- You must have ```19.0.0 >= node >= 12.0.0``` (some libraries do not support the latest 20.0 version).  -->

Next, install the required packages:
```bash
npm install
```
Add API key to ```environment.env``` in root folder
```bash
# Obtain from OpenAI!
OPENAI_API_KEY="" 
```
start app
```
npm run dev
```

## 4. Publish to AWS ECR and AppRunner

### 4.1. Build Docker Image

```bash
docker build -t ids721-dalle . 
docker run -it --rm -p 8080:8080 ids721-dalle
```

### 4.2. Push to AWS ECR

Create a new blank ECR image in your AWS dashboard: [AWS ECR](https://us-east-1.console.aws.amazon.com/ecr).

Create a new access key in your AWS IAM dashboard: [AWS IAM](https://us-east-1.console.aws.amazon.com/iamv2).

Install AWS CLI:
```bash
sudo apt-get install awscli
```

Configure your local credentials:
```bash
aws configure
# enter your access key and secrets, select default region: us-east-1
```

Retrieve an authentication token and authenticate your Docker client to your registry.
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_ID.dkr.ecr.us-east-1.amazonaws.com
# replace YOUR_ECR_ID with your image url
```

Run the following command to push this image to your newly created AWS repository:
```bash
docker push YOUR_ECR_ID.dkr.ecr.us-east-1.amazonaws.com/hugoweather:latest
# replace YOUR_ECR_ID with your image url
```


### 4.3. Publish to AWS AppRunner

Create a new AppRunner service: [AWS APPRunner](https://us-east-1.console.aws.amazon.com/apprunner) 

Select the image you built, and choose **Auto Deploy**.

Wait until health check is automatically completed.

## 4.4 Contributors

- [Arthur Chen](https://github.com/ArthurChenCoding)
- [Hugo Hu](https://github.com/0HugoHu)
- [Minghui Zhu](https://github.com/zhuminghui17)
- [Enze Shi](https://github.com/casnz1601)

## 5. License
This project is under the MIT License.


