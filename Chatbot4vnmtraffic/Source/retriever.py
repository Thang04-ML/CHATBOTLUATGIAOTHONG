import json
import numpy as np
import string
from rank_bm25 import BM25Okapi
from pyvi.ViTokenizer import tokenize
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

def split_text(text):
    """
    Tách văn bản thành các từ và loại bỏ dấu câu, chuyển về chữ thường.
    """
    text = text.translate(str.maketrans('', '', string.punctuation))
    words = text.lower().split()
    return [w for w in words if w.strip()]


class Retriever:
    """
    Lớp Retriever để tìm kiếm thông tin bằng cách kết hợp semantic search (Qdrant)
    và lexical search (BM25).
    """
    def __init__(self, corpus, qdrant_path, model_name, collection_name="traffic_law"):
        """
        Khởi tạo Retriever.

        Args:
            corpus (list): Danh sách các tài liệu (mỗi tài liệu là một dict).
            qdrant_path (str): Đường dẫn đến thư mục chứa dữ liệu Qdrant (local).
            model_name (str): Tên hoặc đường dẫn đến mô hình SentenceTransformer.
            collection_name (str): Tên collection trong Qdrant.
        """
        self.corpus = corpus
        self.qdrant_path = qdrant_path
        self.model_name = model_name
        self.collection_name = collection_name
        
        # Map ID to Doc for quick lookup
        self.id_to_doc = {doc["id"]: doc for doc in self.corpus}

        # Tải mô hình embedding từ SentenceTransformers
        try:
            self.embedder = SentenceTransformer(model_name)
            print(f"Đã tải mô hình SentenceTransformer: {model_name}")
        except Exception as e:
            print(f"LỖI: Không thể tải mô hình SentenceTransformer '{model_name}': {e}")
            raise

        # Kết nối Qdrant
        print(f"Connecting to Qdrant at: {self.qdrant_path}")
        self.client = QdrantClient(path=self.qdrant_path)
        
        # Kiểm tra collection
        if not self.client.collection_exists(self.collection_name):
            print(f"Cảnh báo: Collection '{self.collection_name}' không tồn tại trong Qdrant. Hãy chạy script migrate trước.")

        # BM25
        # Tokenize corpus for BM25
        print("Đang khởi tạo BM25...")
        self.tokenized_corpus = [split_text(doc.get("context", "")) for doc in self.corpus]
        
        if self.tokenized_corpus and any(len(x) > 0 for x in self.tokenized_corpus): 
             self.bm25 = BM25Okapi(self.tokenized_corpus)
             print("Đã khởi tạo BM25Okapi.")
        else:
            print("Cảnh báo: Corpus rỗng hoặc không có nội dung để tokenize cho BM25. BM25 sẽ không hoạt động.")
            self.bm25 = None 

    def retrieve(self, question: str, topk: int = 10):
        """
        Tìm kiếm các tài liệu liên quan dựa trên câu hỏi.
        Kết hợp Qdrant (Semantic) và BM25 (Lexical).
        """
        # 1. Semantic Search with Qdrant
        segmented_question = tokenize(question)
        query_emb = self.embedder.encode([segmented_question])[0]
        
        # Chuẩn hóa vector nếu cần (Qdrant thường handle cosine, nhưng input vector nên được check)
        # Tuy nhiên, nếu search bằng Cosine trong Qdrant, nó tự normalize.
        # Ở đây ta gửi vector gốc.
        
        search_result = []
        try:
            search_result = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_emb,
                limit=topk * 2  # Lấy nhiều hơn topk để rerank
            )
        except Exception as e:
            print(f"Lỗi khi tìm kiếm Qdrant: {e}")
            
        qdrant_hits = {hit.id: hit.score for hit in search_result}
        
        # 2. BM25 Search
        tokenized_query = split_text(question)
        
        bm25_hits = {}
        if self.bm25: 
            bm25_scores = self.bm25.get_scores(tokenized_query)
            # Lấy top indices
            # argsort trả về indices tăng dần, lấy slice cuối và đảo ngược
            top_bm25_indices = np.argsort(bm25_scores)[-topk*2:][::-1]
            
            for idx in top_bm25_indices:
                score = bm25_scores[idx]
                if score > 0:
                    doc_id = self.corpus[idx]["id"]
                    bm25_hits[doc_id] = score
        else:
             print("BM25 không hoạt động.")

        # 3. Combine Scores
        # Lấy tập hợp tất cả ID
        all_candidate_ids = set(qdrant_hits.keys()) | set(bm25_hits.keys())
        
        # Tính Max/Min để chuẩn hóa
        # Qdrant Score (Cosine Similarity or Dot Product)
        # Nếu dùng Cosine trong Qdrant, score từ -1 đến 1 (hoặc 0-2 tùy implement, nhưng thường là cosine sim).
        # Nếu dùng Dot Product (khi vector đã normalize), cũng là -1 đến 1.
        
        if qdrant_hits:
            q_values = list(qdrant_hits.values())
            max_q = max(q_values)
            min_q = min(q_values)
            if max_q == min_q:
                norm_q_func = lambda x: 0.5
            else:
                norm_q_func = lambda x: (x - min_q) / (max_q - min_q)
        else:
            norm_q_func = lambda x: 0
            
        if bm25_hits:
            b_values = list(bm25_hits.values())
            max_b = max(b_values)
            min_b = min(b_values)
            if max_b == min_b:
                norm_b_func = lambda x: 0.5
            else:
                norm_b_func = lambda x: (x - min_b) / (max_b - min_b)
        else:
            norm_b_func = lambda x: 0
            
        results = []
        for doc_id in all_candidate_ids:
            # Lấy document gốc
            doc = self.id_to_doc.get(doc_id)
            if not doc:
                continue
                
            # Lấy điểm thành phần
            q_score_raw = qdrant_hits.get(doc_id, 0.0) # Nếu không có trong Qdrant list, xem như thấp (hoặc 0)
            # Lưu ý: Nếu doc không nằm trong top Qdrant, điểm thực tế có thể < min_q.
            # Để an toàn, nếu không có trong hit, ta gán = 0 (đã chuẩn hóa sẽ thấp hơn min).
            # Tuy nhiên, norm_q_func(0) có thể sai nếu min_q > 0.
            # Cách tốt hơn: 
            # q_score_norm = norm_q_func(q_score_raw) if doc_id in qdrant_hits else 0.0
            
            if doc_id in qdrant_hits:
                q_score = norm_q_func(q_score_raw)
            else:
                q_score = 0.0 # Penalty cho việc không xuất hiện trong semantic top list
                
            b_score_raw = bm25_hits.get(doc_id, 0.0)
            if doc_id in bm25_hits:
                b_score = norm_b_func(b_score_raw)
            else:
                b_score = 0.0
            
            combined_score = b_score * 0.4 + q_score * 0.6
            
            results.append({
                "id": doc.get("id"), 
                "title": doc.get("title", ""),
                "context": doc.get("context", ""),
                "bm25_score": b_score_raw,
                "semantic_score": q_score_raw,
                "combined_score": combined_score,
                "score_details": f"BM25: {b_score:.4f} (raw: {b_score_raw:.4f}), Sem: {q_score:.4f} (raw: {q_score_raw:.4f})"
            })

        return sorted(results, key=lambda x: x["combined_score"], reverse=True)[:topk]
