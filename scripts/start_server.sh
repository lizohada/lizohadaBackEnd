#!/bin/bash

python -m uvicorn main:app --reload > /dev/null 2> /dev/null < /dev/null &

# 백그라운드 실행 확인 메시지
echo "FastAPI 애플리케이션이 백그라운드에서 실행 중입니다."