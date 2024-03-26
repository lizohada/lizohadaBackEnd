import boto3
from boto3.dynamodb.conditions import Key, Attr

# Get the service resource.
dynamodb = boto3.resource('dynamodb')
# 테이블 접속
table = dynamodb.Table('keyword_blog_contents') # 스크랩한 블로그 글

# 요소 하나만 가져오는 api
# response = table.get_item( # keyword와 Link 모두 입력해야함
#     Key={
#         "keyword":"광주 여행",
#         "link":"https://blog.naver.com/find790/223380966762"
#     }
# )
# print(response)

# keyword가 같은 쿼리와 같은 요소를 전부 가져온다.
response = table.query(
    KeyConditionExpression=Key('keyword').eq('광주 여행')
)
items = response['Items']
print(items)
print(len(items))