import sys
import os

# Add Source to path
sys.path.append(os.path.join(os.getcwd(), "Chatbot4vnmtraffic", "Source"))

from chat import chatbot

def test():
    history = [
        {"role": "user", "content": "Mức nồng độ cồn nào được coi là kịch khung đối với người lái xe máy? Hình phạt bổ sung là gì?"}
    ]
    response = chatbot(history, "Vietnamese")
    # Note: chatbot() doesn't return passages, but I can modify it or look at the prints in terminal.
    # Since I'm running this script locally, it will print to my terminal.
    print("--- RESPONSE ---")
    print(response)

if __name__ == "__main__":
    test()
