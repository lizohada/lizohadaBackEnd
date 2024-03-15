response = table.get_item(
    Key={
        "keyword":"광주 여행"
    }
)
print(response)