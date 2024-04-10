#!/bin/bash
# 작업 공간을 "./EC2/"로 이동
cd ./EC2/
# FastAPI 애플리케이션을 백그라운드에서 실행
python -m uvicorn main:app --reload > /dev/null 2> /dev/null < /dev/null &

# 백그라운드 실행 확인 메시지
echo "FastAPI 애플리케이션이 백그라운드에서 실행 중입니다."