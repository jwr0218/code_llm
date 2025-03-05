import asyncio
import httpx

async def send_request(query):
    url = "http://127.0.0.1:5000/generate"
    headers = {"Content-Type": "application/json"}    
    json_data = {"query":query, "request_id": "test_id"}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=json_data)
        print("Response:", response.text)
        return response

async def main():
    # 5개의 요청을 동시에 실행
    queries = ['def pibonacci()' , 'def bfs()' , 'def back_tracking()' , 'def dynamic_programming' , 'def sum('] * 10 
    tasks = [asyncio.create_task(send_request(query)) for query in queries]
    await asyncio.gather(*tasks)

if __name__ == '__main__':
    asyncio.run(main())
