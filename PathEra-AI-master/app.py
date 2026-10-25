import os
from flask import Flask, request, jsonify
from flask_cors import CORS 
import pandas as pd
from JobMatcher.job_matcher import JobRecommender
from InterviewSimulation.evaluator import Evaluator
import nltk
from dotenv import load_dotenv

load_dotenv()

# rake_nltk needs stopwords, and NLTK >= 3.9 tokenizers need punkt_tab instead of punkt
for package in ('punkt', 'punkt_tab', 'stopwords'):
    nltk.download(package, quiet=True)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

db_url = os.getenv('DATABASE_URL')  # Supabase connection string, same as the backend's
if not db_url:
    raise RuntimeError("DATABASE_URL is not set. Copy your Supabase connection string into .env")

model = JobRecommender()
evaluator = Evaluator(db_url=db_url)

@app.route('/recommend', methods=['POST'])
def recommend():
    if request.is_json:
        try:
            user_data = request.get_json(silent=True)
            if not isinstance(user_data, dict):
                return jsonify({'success': False, 'error': "Request body must be a JSON object"}), 400
            missing = [field for field in ('job_title', 'skills') if not user_data.get(field)]
            if missing:
                return jsonify({'success': False, 'error': f"Missing required fields: {', '.join(missing)}"}), 400
            if not all(isinstance(user_data[field], str) for field in ('job_title', 'skills')):
                return jsonify({'success': False, 'error': "job_title and skills must be comma-separated strings"}), 400
            user_data.setdefault('degree', None)
            user_data.setdefault('years_of_experience', None)
            user_data_df = pd.DataFrame([user_data])
            result, skill_matches = model.recommend_jobs(user_data_df)
            
            return jsonify({
                'success': True,
                'result': result.to_dict(orient='records'),
                'skill_matches': skill_matches.to_dict(orient='records')
            }), 200
        except FileNotFoundError as e:
            print("File not found:", e)
            return jsonify({'success': False, 'error': "Job data is unavailable"}), 500
        except pd.errors.EmptyDataError:
            return jsonify({'success': False, 'error': "Job data is unavailable"}), 500
        except Exception as e:
            print("Exception occurred:", e)
            return jsonify({'success': False, 'error': "Internal server error"}), 500
    else:
        return jsonify({"error": "Request must be JSON"}), 400

@app.route('/evaluate', methods=["POST"]) 
def evaluate():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400
    question_id = data.get('question_id')
    user_answer = data.get('user_answer')
    if not question_id or not isinstance(user_answer, str) or not user_answer.strip():
        return jsonify({"error": "Missing required fields"}), 400
    try:
        question_id = int(question_id)
    except (TypeError, ValueError):
        return jsonify({"error": "question_id must be an integer"}), 400
    try:
        if not evaluator.check_question_exists(question_id):
            return jsonify({"error": "Question does not exist"}), 400
        result = evaluator.evaluate_with_feedback(question_id, user_answer)
        return jsonify({"success": True, "score": result["score"], "feedback": result["feedback"]}), 200
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        print("Exception occurred:", e)
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # The Werkzeug debugger runs arbitrary code from the browser, so it is opt-in (FLASK_DEBUG=1) and never the default
    debug = os.getenv('FLASK_DEBUG', '').lower() in ('1', 'true')
    app.run(debug=debug, use_reloader=False, port=int(os.getenv('PORT') or 5020))
