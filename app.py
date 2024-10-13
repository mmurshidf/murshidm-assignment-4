from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

app = Flask(__name__)
newsgroups = fetch_20newsgroups(subset='all')
documents = newsgroups.data
stop_words = stopwords.words('english')
vectorizer = TfidfVectorizer(stop_words=stop_words, max_features=10000)
X = vectorizer.fit_transform(documents)

lsa = TruncatedSVD(n_components=100)
X_reduced = lsa.fit_transform(X)

def search_engine(query):
    """
    Function to search for top 5 similar documents given a query
    Input: query (str)
    Output: documents (list), similarities (list), indices (list)
    """
    query_vec = vectorizer.transform([query])
    
    query_reduced = lsa.transform(query_vec)
    
    similarities = cosine_similarity(query_reduced, X_reduced).flatten()
    
    top_indices = np.argsort(similarities)[::-1][:5]
    
    top_docs = [documents[i] for i in top_indices]
    top_sims = [similarities[i] for i in top_indices]

    top_indices = top_indices.tolist()
    
    return top_docs, top_sims, top_indices

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    documents, similarities, indices = search_engine(query)
    # Convert similarities to floats for JSON serialization
    similarities = [float(s) for s in similarities]
    return jsonify({'documents': documents, 'similarities': similarities, 'indices': indices}) 

if __name__ == '__main__':
    app.run(debug=True, port=3000)