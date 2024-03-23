from gensim.models import Word2Vec
import boto3
import os
from dotenv import load_dotenv

load_dotenv()

FILE_NAME = os.environ.get('MODEL_FILE_NAME')
BUCKET_NAME = os.environ.get('BUCKET_NAME')
TABLE_NAME = os.environ.get('KEYWORD_TABLE_NAME')

def load_model():

    s3 = boto3.resource('s3')
    local_file_path = FILE_NAME
    s3_object_key = FILE_NAME
    s3.meta.client.download_file(BUCKET_NAME, s3_object_key, local_file_path)

    model = Word2Vec.load(FILE_NAME) # 모델 load
    os.remove(FILE_NAME)
    return model

def get_items_from_db(table_name:str):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name) # 스크랩한 블로그 글
    response = table.scan()
    items = response["Items"]
    return items

def get_keywords_by_region(items):
    """
    DB에서 가져온 항목들(list)를 region이 같은 것들끼리 묶어서 dictionary 형태로 변환하는 함수
    """
    keywords_by_region = {}
    for item in items:
        region = item['region']
        keyword = item['keyword']
        if region in keywords_by_region:
            keywords_by_region[region].append(keyword)
        else:
            keywords_by_region[region] = [keyword]
    return keywords_by_region

def inference(model, user_inputs, keywords_by_region: dict):
    # TODO 알고리즘 최적화
    max_score = 0
    recommended_region = None
    # 지역 수 * 지역 당 키워드 수 * 유저 인풋 수
    for region, keywords in keywords_by_region.items():
        score = 0
        for keyword in keywords:
            for user_input in user_inputs:
                # keyword, user_input이 없을 때 KeyError발생함.
                try:
                    score += model.wv.similarity(keyword, user_input) #0.0001 * 2000
                except KeyError:
                    pass
        if score > max_score:
            max_score = score
            recommended_region = region
    return recommended_region

def get_recommended_region(model, user_inputs):
    items = get_items_from_db(TABLE_NAME)
    keywords_by_region = get_keywords_by_region(items)

    recommended_region = inference(model, user_inputs, keywords_by_region)
    return recommended_region

# 예시
user_inputs = ["바다", "힐링", "가족", "맛집", "밥"]
model = load_model()
print(get_recommended_region(model, user_inputs))