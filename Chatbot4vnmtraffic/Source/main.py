from typing import List
from fastapi import FastAPI
from pydantic import BaseModel
from contextlib import asynccontextmanager
from chat import chatbot, init_retriever

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load the model
    print("Starting up... Warming up the model.")
    init_retriever()
    print("Model loaded.")
    yield
    # Shutdown: Clean up resources if needed
    print("Shutting down...")

# Khởi tạo ứng dụng FastAPI
app = FastAPI(lifespan=lifespan)

# Định nghĩa dữ liệu đầu vào cho API
class Message(BaseModel):
    role: str
    content: str

class RequestData(BaseModel):
    messages: List[Message]
    language: str

# API endpoint xử lý các tin nhắn và trả về kết quả từ hàm process
@app.post("/process")
async def process_messages(request_data: RequestData):
    # Chuyển đổi dữ liệu đầu vào về định dạng mong muốn cho hàm process
    messages = [{"role": msg.role, "content": msg.content} for msg in request_data.messages]
    language = request_data.language
    print(messages)
    result = chatbot(messages, language)  # Gọi hàm process với dữ liệu đầu vào
    return {"answer": result}

# Nếu chạy trực tiếp file main.py thì ứng dụng FastAPI sẽ chạy trên máy chủ uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
