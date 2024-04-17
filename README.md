# 일조하다 백엔드 개발

## 외부 라이브러리 관리

외부 라이브러리를 추가적으로 설치해야한다면, `requirements.txt`에 꼭 작성하고 issue 발행하기!

## AWS 설정하기

**로그인 주소**
https://533267434404.signin.aws.amazon.com/console

**사용자 이름**
lizo1

비밀번호는 알아서 작성

## AWS CLI 설정

로컬 컴퓨터에 `aws configure`를 통해 액세스 키와 시크릿 키 작성

## 인프라 배포 방법

현재 CICD를 완전히 구축하진 못한 상황이다. 하지만, 앞으로 CICD를 구축하기 위해 지속적인 노력을 할 것이며 일단은 AWS 콘솔을 이용해야한다.

### 람다를 배포하는 방법

루트 디렉토리에는 `index.mjs` or `index.js` 가 존재해야함.
AWS Lambda 는 `index.mjs`를 실행시키는 것.

사용자가 작성한 모듈은 `common` 디렉토리에 저장, 라이브러리 같은 의존성은 `node_modules`에 저장

프로젝트 압축 라이브러리 설치
aws에서 만든 압축 라이브러리 `npm install aws-xray-sdk --save` 를 통해 설치

이 라이브러리는  `index.mjs` 와 그 하위 모듈은 `common` 디렉토리에 있는 모듈들이 의존하는 의존성까지 포함해서 zip 으로 압축

압축 실시!
 `zip -r my_deployment_package.zip . `

 `zip -r [압축 파일 이름].zip [index.mjs가 존재하는 위치]`
`aws s3 cp --recursive build s3://<<버킷이름>>`로 S3에 zip 파일을 넣고 
람다를 업데이트하면 `index.mjs`를 실행 가능!

### EC2를 배포하는 방법

`CodePipeLine` 과 `CodeDeploy`를 이용해서 배포할 수 있는데 아직 구축하진 못했다. (주말 간 만들 예정)
다만, `cloudFormation`을 이용해서 EC2 인프라 자체는 생성할 수 있다.

1. `/lizohada/Infrastructure/default-ec2.yaml`의 코드 수정
2. aws cloudformation 콘솔로 이동
3. 해당 파일을 통해 LizohadaStack을 업데이트 

### 로컬에서 FastAPI 서버 실행시키는 방법

1. `/EC2/requirements.txt`에 정의된 의존성을 설치 `pip install -r reuqirements.txt`
2. `python -m uvicorn main:app --reload` 이나 `uvicorn main:app --reload` 으로 FastAPI 서버 실행

추가적으로 FastAPI에서 사용하는 라이브러리가 있다면 `requirements.txt`에 작성하기

## 프로젝트 주요 기능

### 블로그 글 스크랩핑 (/Lambda/Blog Scrape) 

### 키워드 추출 (/EC2/Keyword Extraction)
TextRank 알고리즘을 사용하여 지역별 블로그 글 기반으로 상위 20개 단어를 키워드로 추출

[AWS DynamoDB python SDK 사용법](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/dynamodb.html)을 참고해서 간단한 FastAPI와 DynamoDB를 연동하는 예제를 작성한다.

### 모델 학습 (/EC2/Keyword Learning)

### 유저 취향 추론 (/EC2/Preference Inference)

## API 명세서

| Name | HTTP Method | URI | 예시 | 설명 |
| --- | --- | --- | --- | --- |
| getQuery | get  | /keyword/query | /keyword/query | 클라이언트에게 질문 키워드 전달 |
| recommendRegion | get | /model/keywords?key={keyword} | /model/keywords?key="바다"&key="힐링"&key="가족"&key="맛집"&key="밥” | 클라이언트가 선택한 키워드를 받아서 여행지 추천 |
| trainModel | post  | /model/params | /model/params | EC2의 추론에서 사용하는 모델 재학습 |

```java
// getQuery Response 형태
{
  "query" : [
	  ["바다", "밥"],
	  ["오름", "산"],
	  ["박물과", "해변"],
	  ["소나무", "서핑"],
	  ["배", "턱걸이"],
	  ["딸기축제", "낙엽"]
  ]
}

// recommendRegion Response 형태
{
  "region" : "전주"
}
```
