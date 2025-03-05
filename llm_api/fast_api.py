# server.py
import uvicorn
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from vllm_code_ge import generate_completion_vllm

app = FastAPI()

# 요청 바디를 위한 Pydantic 모델
class QueryRequest(BaseModel):
    query: str
    request_id : str

@app.post("/generate")
async def generate_post(request: QueryRequest):
    # codegeneration 모듈의 스트리밍 제너레이터 함수 호출
    return StreamingResponse(generate_completion_vllm(request.query, request.request_id), media_type="text/plain")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
