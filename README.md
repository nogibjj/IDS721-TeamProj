# IDS721-TeamProj

IDS721 Cloud Computing - Team Final Project

In this project, we build a web application that allows users to enter a prompt, then return a generated image by ***OpenAI DALLE API***. It also allows to edit the image by adding a movable and resizable mask, the selected area is then re-generated with the second prompt. Users can specify the height-width ratio of the returning image.

The application is built using ```Next.js```, a React framework , and run in ```Docker``` for production. The application is deployed on ```AWS ECR``` for Docker image storage, and ```AWS AppRunner``` a cloud platform for static sites and Serverless Functions for auto deployment. 

## 0. Architecture Diagram


## 1. Demo


## 2. Getting Started

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

You must have ```19.0.0 >= node >= 12.0.0``` (some libraries do not support the latest 20.0 version). 

Next, install the required packages:

```bash
npm install
```

Note: if you have problem installing the ```canvas```, please refer to this mannual compilation [guide](https://github.com/Automattic/node-canvas#compiling).

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the web page.



## 3. Publish to AWS ECR and AppRunner

### 3.1. Build Docker Image

```bash
docker build -t ids721-dalle . 
docker run -it --rm -p 8080:8080 ids721-dalle
```

### 3.2. Push to AWS ECR

Create a new blank ECR image in your AWS dashboard: [AWS ECR](https://us-east-1.console.aws.amazon.com/ecr).

Create a new access key in your AWS IAM dashboard: [AWS IAM](https://us-east-1.console.aws.amazon.com/iamv2).

You need also **grant sufficient permissions** to the key. See this article if you meet any problems: [help](https://www.freecodecamp.org/news/build-and-push-docker-images-to-aws-ecr/).

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

Tag your image so you can push the image to this repository.
```bash
docker tag hugoweather:latest YOUR_ECR_ID.dkr.ecr.us-east-1.amazonaws.com/hugoweather:latest
# replace YOUR_ECR_ID with your image url
```

Run the following command to push this image to your newly created AWS repository:
```bash
docker push YOUR_ECR_ID.dkr.ecr.us-east-1.amazonaws.com/hugoweather:latest
# replace YOUR_ECR_ID with your image url
```

### 3.3. Publish to AWS AppRunner

Create a new AppRunner service: [AWS APPRunner](https://us-east-1.console.aws.amazon.com/apprunner) 

Select the image you built, and choose **Auto Deploy**.

Wait until health check is automatically completed.

## 4. Contributors

- [Arthur Chen](https://github.com/ArthurChenCoding)
- [Hugo Hu](https://github.com/0HugoHu)
- [Minghui Zhu](https://github.com/zhuminghui17)
- [Shien Ze](https://github.com/casnz1601)


## 5. License
This project is under the MIT License.