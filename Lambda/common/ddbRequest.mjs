import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "ap-northeast-2" });
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "keyword_blog_contents";

export async function requestBathWrite(putRequests) {
  // 배치로 DynamoDB에 요소 집어넣기
  const command = new BatchWriteCommand({
    RequestItems: {
      [tableName]: putRequests,
    },
  });
  await dynamo.send(command);
}

export async function requestRecentPostdate(keyword) {
  const command = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: "keyword = :keyword",
    ExpressionAttributeValues: {
      ":keyword": keyword,
    },
    ProjectionExpression: "postdate", // 결과 데이터에서 특정 속성만 정사형.
    ScanIndexForward: false, // 정렬키로 정렬하지 않음
    Limit: 1, // 가장 큰 값 1개를 추출
  });

  const response = await dynamo.send(command);
  console.log("응답 아이템 " + response.Items);
  if (response.Items.length === 0) {
    return "00000000";
  }
  return response.Items.length[0];
}
