from transformers import AutoTokenizer
from vllm import LLMEngine, SamplingParams

from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from vllm import AsyncEngineArgs, AsyncLLMEngine, SamplingParams

import uuid
import asyncio
import time
import gc
import torch


# def clear_memory():
#     gc.collect()
#     torch.cuda.empty_cache()
#     torch.cuda.synchronize()
#     gc.collect()
#     print(f"GPU allocated memory: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")
#     print(f"GPU reserved memory: {torch.cuda.memory_reserved() / 1024**3:.2f} GB")


# # 데이터셋 로드
# clear_memory()




device = "cuda"  # 모델을 로드할 디바이스

# 1. 토크나이저 로드 (eos 토큰 id 등 필요한 파라미터를 얻기 위해)

model_id = "NTQAI/Nxcode-CQ-7B-orpo"
tokenizer = AutoTokenizer.from_pretrained(model_id)


engine_args = AsyncEngineArgs(
    model=model_id,
    gpu_memory_utilization=0.5,
    tensor_parallel_size=2
)
llm = AsyncLLMEngine.from_engine_args(engine_args)

sampling_params = SamplingParams(
    temperature=0.5, 
    top_p=0.7, 
    repetition_penalty=1.1, 
    max_tokens=1024
)


def make_prompt(user_code):    
    """
    주어진 사용자 코드 스니펫에 이어지는 코드를 vLLM을 이용해 생성합니다.
    """
    prompt = f"""You are a helpful AI code assistant acting like GitHub Copilot.

I have the following Python code snippet:
'''
{user_code}
'''

Please continue writing the Python code in place, keeping the same indentation style and Python syntax as above.
DO NOT REPEAT the snippet and DO NOT provide any explanations.
Do not include any Markdown formatting or triple backticks.
Return only the additional lines of code that logically follow the snippet, as plain text (Python code only)."""
    return prompt

    

def generate_completion_vllm(user_code: str , request_id : str) -> str:
    request_id = str(uuid.uuid4())
    print('Request ID : ',request_id)
    

    sent_text = ""

    async def stream_response():

        nonlocal sent_text
        
        results_generator = llm.generate(user_code, sampling_params, request_id=request_id)
        
        async for output in results_generator:
            text = output.outputs[0].text

            new_text = text[len(sent_text):]
            sent_text = text

            for word in new_text.split(" "):
                if word:  
                    yield word + " "

            if output.finished:
                return

    return stream_response()
