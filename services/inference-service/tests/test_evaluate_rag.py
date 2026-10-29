"""Unit tests for RAG retrieval evaluation without external services."""
import unittest
from scripts.evaluate_rag import evaluate

class EvaluationTests(unittest.TestCase):
    def test_perfect_retrieval(self):
        cases = [{"id": "c1", "query": "papules", "relevant_source_ids": ["a", "b"]}]
        result = evaluate(cases, lambda query, limit: [{"source_id": "b"}, {"source_id": "a"}])
        self.assertEqual(result["hit_at_4"], 1)
        self.assertEqual(result["recall_at_4"], 1)
        self.assertEqual(result["mrr_at_4"], 1)

    def test_no_retrieval(self):
        cases = [{"id": "c1", "query": "papules", "relevant_source_ids": ["a"]}]
        result = evaluate(cases, lambda query, limit: [])
        self.assertEqual(result["hit_at_4"], 0)
        self.assertEqual(result["recall_at_4"], 0)

    def test_empty_gold_set_rejected(self):
        with self.assertRaises(ValueError):
            evaluate([], lambda query, limit: [])

if __name__ == "__main__":
    unittest.main()
