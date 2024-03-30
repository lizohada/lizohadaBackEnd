from typing import Union
from fastapi import FastAPI
import boto3
from boto3.dynamodb.conditions import Key, Attr

app = FastAPI()

# Get the service resource.
dynamodb = boto3.resource('dynamodb')
# 테이블 접속
table = dynamodb.Table('keyword_blog_contents') # 스크랩한 블로그 글

@app.get("/")
def read_root():
  # keyword가 같은 쿼리와 같은 요소를 전부 가져온다.
  response = table.query(
      KeyConditionExpression=Key('keyword').eq('광주 여행')
  )
  items = response['Items']
  print(items)
  print(len(items))
  return {"result": items}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.get("/keyword/query")
def get_query():
    return {}

@app.get("/model/keywords")
def recommend_region():
    return {}

@app.post("/model/params")
def train_model():
    return {}