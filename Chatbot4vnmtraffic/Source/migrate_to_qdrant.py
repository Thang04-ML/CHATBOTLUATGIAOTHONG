import json
import pickle
import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.models import PointStruct, VectorParams, Distance
import os
import sys

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "chunked_data.jsonl")
EMBEDDING_FILE = os.path.join(BASE_DIR, "data", "corpus_embedding.pkl")
QDRANT_PATH = os.path.join(BASE_DIR, "data", "qdrant_db")
COLLECTION_NAME = "traffic_law"

def load_data():
    print(f"Loading data from {DATA_FILE}")
    data = []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        for line in f:
            data.append(json.loads(line))
    return data

def load_embeddings():
    print(f"Loading embeddings from {EMBEDDING_FILE}")
    with open(EMBEDDING_FILE, "rb") as f:
        loaded_data = pickle.load(f)
    
    embeddings = None
    if isinstance(loaded_data, list):
        extracted = []
        for item in loaded_data:
            if isinstance(item, dict) and 'embedding' in item:
                extracted.append(item['embedding'])
        if extracted:
            embeddings = np.array(extracted)
    elif isinstance(loaded_data, dict):
        embeddings = np.array(list(loaded_data.values()))
    elif isinstance(loaded_data, np.ndarray):
        embeddings = loaded_data
    
    if embeddings is None:
        raise ValueError("Could not load embeddings properly.")
        
    print(f"Embeddings shape: {embeddings.shape}")
    return embeddings

def migrate():
    # 1. Load Data and Embeddings
    data = load_data()
    embeddings = load_embeddings()
    
    if len(data) != len(embeddings):
        print(f"Warning: Number of data points ({len(data)}) does not match number of embeddings ({len(embeddings)}).")
        # Proceed with the smaller number or handle error?
        # Usually they should match. relying on index.
        limit = min(len(data), len(embeddings))
        data = data[:limit]
        embeddings = embeddings[:limit]
    
    dim = embeddings.shape[1]
    
    # 2. Initialize Qdrant
    print(f"Initializing Qdrant at {QDRANT_PATH}")
    client = QdrantClient(path=QDRANT_PATH)
    
    # 3. Create Collection
    if client.collection_exists(COLLECTION_NAME):
        print(f"Collection {COLLECTION_NAME} exists. Recreating...")
        client.delete_collection(COLLECTION_NAME)
    
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
    )
    
    # 4. Upload Points
    print("Uploading points...")
    points = []
    batch_size = 500
    
    for i, (doc, vec) in enumerate(zip(data, embeddings)):
        # Normalize vector if not already (Qdrant Cosine prefers normalized, though it handles dot product if Distance.DOT)
        # However, Retriver.py was doing normalization manually.
        # Cosine distance in Qdrant does normalization internally during search? 
        # Actually Qdrant Cosine distance = 1 - cosine_similarity.
        # It's better to upload normalized vectors and use Dot? Or use Cosine.
        # Let's stick to using raw vectors and let Qdrant handle distance, BUT 
        # retriever.py strictly normalizes. 
        # To be safe and consistent with retriever.py logic (Normalize -> Dot Product), 
        # which is equivalent to Cosine Similarity on normalized vectors.
        # I will use Cosine distance in Qdrant and upload vectors as is (or normalized).
        # Normalizing here to be safe.
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        
        # Prepare payload
        payload = {
            "doc_id": doc.get("doc_id"),
            "effective_date": doc.get("effective_date"),
            "field": doc.get("field"),
            "chapter": doc.get("chapter"),
            "article": doc.get("article"),
            "chunk_index": doc.get("chunk_index"),
            "context": doc.get("context"),
            # Add other fields if necessary
        }
        
        points.append(PointStruct(
            id=doc["id"], # Using the provided integer ID
            vector=vec.tolist(),
            payload=payload
        ))
        
        if len(points) >= batch_size:
            client.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
            points = []
            print(f"Uploaded {i+1}/{len(data)} points")
            
    if points:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print(f"Uploaded {len(data)} points")
        
    print("Migration finished!")

if __name__ == "__main__":
    try:
        migrate()
    except ImportError:
        print("Error: qdrant-client not installed. Please install it using: pip install qdrant-client")
    except Exception as e:
        print(f"An error occurred: {e}")
