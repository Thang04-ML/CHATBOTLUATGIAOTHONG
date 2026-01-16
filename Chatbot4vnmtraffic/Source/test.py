import sys
import os

# Ensure Source directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data_loader import load_meta_corpus
import chat 

# Initialize retriever via chat module to avoid multiple QdrantClient instances locking the DB
print("Initializing Retriever via chat module...")
chat.init_retriever()
retriever = chat.retriever

# Query example
question = "Đối tượng tham gia giao thông bao gồm những ai?"
print(f"Querying: {question}")
top_results = retriever.retrieve(question, topk=5)

print("\nTop Results (Independent Retriever):")
for i, res in enumerate(top_results):
    print(f"[{i+1}] Score: {res['combined_score']:.4f} ({res.get('score_details', '')})")
    print(f"    ID: {res['id']}")
    print(f"    Content: {res['context'][:100]}...")
    print("-" * 50)

# Test Chatbot Function
print("\nTesting Chatbot Function...")
conversation_history = [
    {"role": "user", "content": "Chào bạn, bạn biết về luật giao thông việt nam chứ?"},
]

response = chat.chatbot(conversation_history, "Tiếng Việt")
print("\nChatbot Response (Small Talk test):")
print(response)

conversation_history_2 = [
    {"role": "user", "content": "Vượt đèn đỏ phạt bao nhiêu?"}
]
print("\nChatbot Response (Domain Question test):")
try:
    response_2 = chat.chatbot(conversation_history_2, "Tiếng Việt")
    print(response_2)
except Exception as e:
    print(f"Error calling chatbot: {e}")