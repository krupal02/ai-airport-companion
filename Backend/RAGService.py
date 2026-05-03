import json
import os
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

class RAGService:
    def __init__(self, data_path="Data/airport_knowledge.json", persist_directory="Data/chroma_db"):
        self.data_path = data_path
        self.persist_directory = persist_directory
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_store = None
        self.initialize_vector_store()

    def _parse_json_dynamically(self, data, parent_key=""):
        documents = []
        if isinstance(data, dict):
            for k, v in data.items():
                new_key = f"{parent_key}.{k}" if parent_key else k
                if isinstance(v, (dict, list)):
                    documents.extend(self._parse_json_dynamically(v, new_key))
                else:
                    content = f"The {k} of {parent_key} is {v}." if parent_key else f"{k}: {v}"
                    documents.append(Document(page_content=content, metadata={"source": new_key}))
        elif isinstance(data, list):
            for i, item in enumerate(data):
                if isinstance(item, (dict, list)):
                    documents.extend(self._parse_json_dynamically(item, f"{parent_key}[{i}]"))
                else:
                    documents.append(Document(page_content=f"{parent_key}[{i}]: {item}", metadata={"source": parent_key}))
        return documents

    def initialize_vector_store(self):
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Knowledge file not found at {self.data_path}")
            
        with open(self.data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        documents = self._parse_json_dynamically(data)
        
        self.vector_store = Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings,
            persist_directory=self.persist_directory
        )

    def retrieve_context(self, query, k=5):
        if not self.vector_store:
            return ""
        results = self.vector_store.similarity_search(query, k=k)
        context = "\n".join([doc.page_content for doc in results])
        return context

# For testing
if __name__ == "__main__":
    service = RAGService()
    print(service.retrieve_context("Where is Starbucks?"))
