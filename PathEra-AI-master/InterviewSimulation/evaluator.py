from sqlalchemy import create_engine, text
import pandas as pd
from rake_nltk import Rake
import re
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

class Evaluator:
    SCORE_FLOOR = 0.25
    SCORE_CEILING = 0.80

    def __init__(self, db_url, model_name='sentence-transformers/all-MiniLM-L12-v2'):
        # Supabase shows "postgres://" or "postgresql://"; SQLAlchemy 2.1 defaults those to psycopg 3,
        # but we ship psycopg2-binary, so pin the driver explicitly
        db_url = re.sub(r'^postgres(ql)?://', 'postgresql+psycopg2://', db_url)
        connect_args = {"sslmode": "require"} if db_url.startswith("postgresql") else {}
        self.engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)

        self.model = SentenceTransformer(model_name)
        self.rake = Rake()

    def check_question_exists(self, question_id):
        query = text("SELECT 1 FROM questions WHERE id = :id LIMIT 1")
        df = pd.read_sql(query, self.engine, params={"id": question_id})
        return not df.empty

    def get_topic(self, question_id):
        query = text("SELECT topic FROM questions WHERE id = :id")
        df = pd.read_sql(query, self.engine, params={"id": question_id})
        if df.empty or pd.isna(df['topic'][0]):
            return []
        topic = df['topic'][0].split(",")
        # strip so " sql" doesn't leave stray spaces, and drop empties so replace("") is never called
        topic = [self.clean_text(t).strip() for t in topic]
        return [t for t in topic if t]

    def clean_text(self, text):
        text = re.sub(r'[^A-Za-z0-9\s]', ' ', text) 
        text = text.lower() 
        return text

    def extract_keywords(self, text, min_length=2, max_length=6):
        self.rake.extract_keywords_from_text(text)
        keywords = self.rake.get_ranked_phrases()
        keywords = [keyword for keyword in keywords if len(keyword.split()) >= min_length and len(keyword.split()) <= max_length]
        return keywords

    def get_reference_answers(self, question_id):
        query = text("SELECT answer FROM answer_key WHERE question_id = :id")
        answers = pd.read_sql(query, self.engine, params={"id": question_id})
        return answers['answer'].dropna().tolist()

    def preprocess_reference_answers(self, reference_answers, topic):
        def clean_and_replace(text):
            cleaned_text = self.clean_text(text)
            for t in topic:
                cleaned_text = cleaned_text.replace(t, "")
            return cleaned_text
        return [clean_and_replace(answer) for answer in reference_answers]

    def preprocess_user_answer(self, user_answer, topic):
        user_answer = self.clean_text(user_answer)
        for t in topic:
            user_answer = user_answer.replace(t, "") 
        return user_answer

    def calculate_keyword_similarity(self, user_answer, reference_answers):
        # How much of a reference answer's key phrases the user covered: each reference phrase takes its best
        # match among the user's phrases, averaged per reference, best reference wins. Averaging all phrases
        # into a single vector (the old approach) let off-topic answers score as high as partial ones.
        user_keywords = self.extract_keywords(user_answer) or [user_answer]
        reference_keywords_list = [self.extract_keywords(answer) for answer in reference_answers]
        all_reference_keywords = [keyword for keywords in reference_keywords_list for keyword in keywords]
        if not all_reference_keywords:
            return 0.0

        user_embeddings = self.model.encode(user_keywords, normalize_embeddings=True)
        reference_embeddings = self.model.encode(all_reference_keywords, normalize_embeddings=True)
        phrase_matches = (reference_embeddings @ user_embeddings.T).max(axis=1)

        best_coverage, start = 0.0, 0
        for keywords in reference_keywords_list:
            if keywords:
                best_coverage = max(best_coverage, float(phrase_matches[start:start + len(keywords)].mean()))
            start += len(keywords)
        return best_coverage

    def calculate_similarity(self, user_answer, reference_answers):
        user_embedding = self.model.encode(user_answer)
        reference_embeddings = self.model.encode(reference_answers)

        similarities = cosine_similarity([user_embedding], reference_embeddings)[0]
        best_index = int(similarities.argmax())
        return similarities[best_index], best_index

    def find_missing_key_points(self, user_answer, reference_answer, limit=3):
        # key phrases of the closest reference answer that nothing in the user's answer comes close to
        reference_keywords = list(dict.fromkeys(self.extract_keywords(reference_answer)))
        if not reference_keywords:
            return []
        user_keywords = self.extract_keywords(user_answer) or [user_answer]
        user_embeddings = self.model.encode(user_keywords, normalize_embeddings=True)
        reference_embeddings = self.model.encode(reference_keywords, normalize_embeddings=True)
        phrase_matches = (reference_embeddings @ user_embeddings.T).max(axis=1)
        # RAKE ranks phrases by importance, so keep that order
        return [keyword for keyword, match in zip(reference_keywords, phrase_matches) if match < 0.5][:limit]

    def generate_feedback(self, score, missing_key_points):
        if score >= 75:
            feedback = "Strong answer: it covers the main ideas of a good response."
        elif score >= 45:
            feedback = "Partially correct: you're on the right track, but the answer is missing some key points."
        elif score >= 20:
            feedback = "Your answer touches on the topic but doesn't explain it clearly or completely."
        else:
            feedback = "This answer doesn't address the question. Review the sample answer and try again."
        if missing_key_points and score < 90:
            feedback += " Consider mentioning: " + "; ".join(missing_key_points) + "."
        return feedback

    def evaluate_with_feedback(self, question_id, user_answer):
        reference_answers = self.get_reference_answers(question_id)
        if not reference_answers:
            raise LookupError("No reference answers found for this question")

        topic = self.get_topic(question_id)
        reference_answers = self.preprocess_reference_answers(reference_answers, topic)
        user_answer = self.preprocess_user_answer(user_answer, topic)

        keyword_similarity = self.calculate_keyword_similarity(user_answer, reference_answers)
        similarity, best_index = self.calculate_similarity(user_answer, reference_answers)

        raw_score = (similarity * 0.75) + (keyword_similarity * 0.25)
        # Raw cosine scores bunch up: unrelated answers still land near 0.25 and solid answers near 0.8,
        # so stretch that band to 0-100 (calibrated on held-out answer_key answers and hand-graded answers)
        final_score = (raw_score - self.SCORE_FLOOR) / (self.SCORE_CEILING - self.SCORE_FLOOR)
        final_score = min(max(float(final_score), 0.0), 1.0)
        # float() above also matters: numpy float32 isn't JSON serializable
        score = round(final_score * 100, 2)

        missing_key_points = self.find_missing_key_points(user_answer, reference_answers[best_index])
        return {"score": score, "feedback": self.generate_feedback(score, missing_key_points)}

    def evaluate(self, question_id, user_answer):
        return self.evaluate_with_feedback(question_id, user_answer)["score"]

    def close_connection(self):
        self.engine.dispose()  
