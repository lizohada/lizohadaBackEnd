import pandas as pd
from gensim.models.word2vec import Word2Vec
from konlpy.tag import Okt
from tqdm.auto import tqdm
from gensim.models import Word2Vec

import boto3
import os

from dotenv import load_dotenv

load_dotenv()

FILE_NAME = os.environ.get('MODEL_FILE_NAME')
BUCKET_NAME = os.environ.get('BUCKET_NAME')
TABLE_NAME = os.environ.get('REVIEW_TABLE_NAME')

def remove_newline(text):
    return text.replace('\n', '')

def get_review_data():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(TABLE_NAME) # 스크랩한 블로그 글
    response = table.scan()
    items = response["Items"]
    contexts = [item["content"] for item in items]
    return contexts

def create_train_data(contexts):
    train_data = pd.DataFrame(contexts, columns=["content"])
    train_data = train_data.dropna(how = 'any') # Null 값이 존재하는 행 제거
    # 정규 표현식을 통한 한글 외 문자 제거
    train_data['content'] = train_data['content'].str.replace("[^ㄱ-ㅎㅏ-ㅣ가-힣\n ]","", regex=True)

    return train_data

def create_tokenized_data(train_data):
    # 불용어 정의
    stopwords = ['의','가','이','은','들','는','좀','잘','걍','과','도','를','으로','자','에','와','한','하다']
    # 형태소 분석기 OKT를 사용한 토큰화 작업 (다소 시간 소요)
    okt = Okt()
    tokenized_data = []
    for sentence in tqdm(train_data['content']):
        tokenized_sentence = okt.morphs(sentence, stem=True) # 토큰화
        stopwords_removed_sentence = [word for word in tokenized_sentence if not word in stopwords] # 불용어 제거
        tokenized_data.append(stopwords_removed_sentence)
    return tokenized_data

def train_model():
    contexts = get_review_data()
    train_data = create_train_data(contexts)
    tokenized_data = create_tokenized_data(train_data)
    model = Word2Vec(sentences = tokenized_data, vector_size = 100, window = 5, min_count = 5, workers = 4, sg = 0) # min_count는 어휘의 빈도. 기본값인 5로 하니 에러 뜸.
    return model

def save_model_params(model):
    # 모델 로컬에 저장
    model.save(FILE_NAME)

    # s3에 저장
    s3 = boto3.resource('s3')
    local_file_path = FILE_NAME
    s3_object_key = FILE_NAME

    s3.meta.client.upload_file(local_file_path, BUCKET_NAME, s3_object_key)

    os.remove(FILE_NAME)
