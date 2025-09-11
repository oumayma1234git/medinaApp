from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
import unicodedata
import matplotlib.pyplot as plt
import seaborn as sns
import io, base64
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from transformers import pipeline
import numpy as np
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Initialisation Flask ---
app = Flask(__name__)
CORS(app)

# --- Connexion MongoDB avec variables d'environnement ---
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/cinemaDB')
JWT_SECRET = os.getenv('JWT_SECRET', 'monsecret')
PORT = int(os.getenv('PORT', 5000))

try:
    client = MongoClient(MONGO_URI)
    db = client["cinemaDB"]  # Using the database name from your config
    print("Successfully connected to MongoDB")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None

# --- Utils pour transformer un plot matplotlib en base64 ---
def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=100, bbox_inches='tight')
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode("utf-8")

# -----------------------------
# --- 4. SEGMENTATION CLIENTS ---
# -----------------------------
@app.route('/api/segmentation', methods=['GET'])
def segmentation():
    try:
        # Charger les données clients
        df = pd.read_csv('./data/clients.csv', skipinitialspace=True)
        
        # Nettoyage des données
        def clean_data(df):
            # Supprimer les doublons
            df = df.drop_duplicates()
            
            # Gérer les valeurs manquantes
            df['age'] = df['age'].fillna(df['age'].median())
            df['revenu_annuel'] = df['revenu_annuel'].fillna(df['revenu_annuel'].median())
            df['score_depense'] = df['score_depense'].fillna(df['score_depense'].median())
            
            # Convertir les colonnes numériques
            numeric_cols = ['age', 'revenu_annuel', 'score_depense']
            for col in numeric_cols:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            return df.dropna()
        
        df_clean = clean_data(df.copy())
        
        # Application de la segmentation
        def assign_segment(row):
            if row['age'] < 35:
                if row['revenu_annuel'] > 70000:
                    return 'Jeunes à haut revenu'
                else:
                    return 'Jeunes à revenu moyen'
            else:
                if row['revenu_annuel'] > 70000:
                    return 'Adultes à haut revenu'
                else:
                    return 'Adultes à revenu moyen'
        
        df_clean['segment'] = df_clean.apply(assign_segment, axis=1)
        df_clean['total_depense'] = df_clean['revenu_annuel'] * df_clean['score_depense'] / 100
        
        # Calcul des statistiques par segment
        segment_stats = df_clean.groupby('segment').agg(
            Nb_Clients=('age', 'count'),
            Dépense_Moyenne=('total_depense', 'mean'),
            Age_Moyen=('age', 'mean'),
            Revenu_Moyen=('revenu_annuel', 'mean')
        ).round(2).reset_index()
        
        # Création des visualisations
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        
        # Diagramme en barres pour le nombre de clients
        colors = ['#FF9999', '#66B2FF', '#99FF99', '#FFCC99']
        axes[0, 0].bar(segment_stats['segment'], segment_stats['Nb_Clients'], color=colors)
        axes[0, 0].set_title('Nombre de Clients par Segment')
        axes[0, 0].set_ylabel('Nombre de Clients')
        axes[0, 0].tick_params(axis='x', rotation=45)
        
        # Diagramme circulaire pour la répartition
        axes[0, 1].pie(segment_stats['Nb_Clients'], labels=segment_stats['segment'], 
                       autopct='%1.1f%%', colors=colors)
        axes[0, 1].set_title('Répartition des Clients')
        
        # Diagramme en barres pour la dépense moyenne
        axes[1, 0].bar(segment_stats['segment'], segment_stats['Dépense_Moyenne'], color=colors)
        axes[1, 0].set_title('Dépense Moyenne par Segment')
        axes[1, 0].set_ylabel('Dépense Moyenne (DT)')
        axes[1, 0].tick_params(axis='x', rotation=45)
        
        # Diagramme en barres pour l'âge moyen
        axes[1, 1].bar(segment_stats['segment'], segment_stats['Age_Moyen'], color=colors)
        axes[1, 1].set_title('Âge Moyen par Segment')
        axes[1, 1].set_ylabel('Âge Moyen')
        axes[1, 1].tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        
        # Conversion en base64
        segmentation_chart = fig_to_base64(fig)
        plt.close(fig)
        
        return jsonify({
            "success": True,
            "segmentation_data": segment_stats.to_dict('records'),
            "segmentation_chart": segmentation_chart
        })
        
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la segmentation: {str(e)}"}), 500

# -----------------------------
# --- 5. SYSTÈME DE RECOMMANDATION ---
# -----------------------------
@app.route('/api/recommendation', methods=['POST'])
def recommendation():
    try:
        data = request.get_json()
        film_title = data.get('film_title', '')
        
        if not film_title:
            return jsonify({"error": "Le titre du film est requis"}), 400
        
        # Charger les données films
        df = pd.read_csv('./data/films.csv')
        
        # Nettoyage et prétraitement
        def clean_text(text):
            if pd.isna(text):
                return ""
            text = str(text)
            text = text.lower()
            text = re.sub(r'[^\w\s]', '', text)
            return text
        
        df['description'] = df['description'].apply(clean_text)
        df['genre'] = df['genre'].apply(clean_text)
        df['language'] = df['language'].apply(clean_text)
        
        # Combiner les caractéristiques pour la vectorisation
        df['features'] = df['genre'] + ' ' + df['description'] + ' ' + df['language']
        
        # Vectorisation TF-IDF
        tfidf = TfidfVectorizer(stop_words='english', max_features=5000)
        tfidf_matrix = tfidf.fit_transform(df['features'])
        
        # Calcul de la similarité cosinus
        cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)
        
        # Fonction de recommandation
        def get_recommendations(title, cosine_sim=cosine_sim):
            # Créer un mapping des titres vers les indices
            indices = pd.Series(df.index, index=df['title']).drop_duplicates()
            
            # Obtenir l'index du film correspondant au titre
            if title not in indices:
                return pd.DataFrame(columns=['title', 'similarity_score'])
                
            idx = indices[title]
            
            # Obtenir les scores de similarité par paire
            sim_scores = list(enumerate(cosine_sim[idx]))
            
            # Trier les films selon les scores de similarité
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
            
            # Obtenir les scores des 10 films les plus similaires
            sim_scores = sim_scores[1:11]
            
            # Obtenir les indices des films
            movie_indices = [i[0] for i in sim_scores]
            
            # Retourner le top 10 des films les plus similaires
            recommendations = df[['title', 'genre', 'language']].iloc[movie_indices]
            recommendations['similarity_score'] = [round(score[1], 2) for score in sim_scores]
            
            return recommendations
        
        recommendations = get_recommendations(film_title)
        
        if recommendations.empty:
            return jsonify({
                "success": False,
                "message": "Film non trouvé dans la base de données"
            })
        
        # Création de visualisations
        fig, ax = plt.subplots(figsize=(10, 6))
        bars = ax.barh(recommendations['title'], recommendations['similarity_score'], color='skyblue')
        ax.set_xlabel('Score de Similarité')
        ax.set_title('Films Recommandés')
        plt.gca().invert_yaxis()
        
        # Ajouter les valeurs sur les barres
        for i, v in enumerate(recommendations['similarity_score']):
            ax.text(v + 0.01, i, str(v), color='blue', fontweight='bold')
        
        # Conversion en base64
        recommendation_chart = fig_to_base64(fig)
        plt.close(fig)
        
        return jsonify({
            "success": True,
            "recommendations": recommendations.to_dict('records'),
            "recommendation_chart": recommendation_chart
        })
        
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la recommandation: {str(e)}"}), 500

# -----------------------------
# --- 6. ANALYSE DE SENTIMENT DES FILMS ---
# -----------------------------
@app.route('/api/film-sentiment', methods=['GET'])
def film_sentiment():
    try:
        # Charger les données d'évaluation
        df = pd.read_csv('./data/evaluations_films.csv')
        
        # Nettoyage et prétraitement
        df = df.dropna(subset=['note'])
        df['note'] = pd.to_numeric(df['note'], errors='coerce')
        df = df.dropna(subset=['note'])
        
        # Catégorisation des sentiments
        def categoriser_sentiment(note):
            if note >= 4:
                return 'Positif'
            elif note >= 3:
                return 'Neutre'
            else:
                return 'Negatif'
        
        df['sentiment'] = df['note'].apply(categoriser_sentiment)
        
        # Calcul des statistiques par film
        sentiment_counts = df.groupby('film_titre')['sentiment'].value_counts().unstack(fill_value=0)
        sentiment_percentages = df.groupby('film_titre')['sentiment'].value_counts(normalize=True).unstack(fill_value=0) * 100
        sentiment_percentages = sentiment_percentages.round(0).astype(int)
        
        # Filtrer les films avec plus de 50% de sentiments positifs
        if 'Positif' in sentiment_percentages.columns:
            films_positifs = sentiment_percentages[sentiment_percentages['Positif'] > 50]
            films_positifs = films_positifs.reset_index()
        else:
            films_positifs = pd.DataFrame(columns=['film_titre', 'Positif'])
        
        # Création de visualisations
        fig, axes = plt.subplots(1, 2, figsize=(14, 6))
        
        # Diagramme en barres pour les films positifs
        if not films_positifs.empty:
            axes[0].bar(films_positifs['film_titre'], films_positifs['Positif'], color='green')
            axes[0].set_title('Films avec plus de 50% de sentiments positifs')
            axes[0].set_ylabel('Pourcentage de sentiments positifs')
            axes[0].tick_params(axis='x', rotation=45)
        else:
            axes[0].text(0.5, 0.5, 'Aucun film avec plus de 50% de sentiments positifs', 
                        ha='center', va='center', transform=axes[0].transAxes)
            axes[0].set_title('Aucun film positif')
        
        # Diagramme circulaire pour la répartition des sentiments
        sentiment_distribution = df['sentiment'].value_counts()
        axes[1].pie(sentiment_distribution.values, labels=sentiment_distribution.index, 
                   autopct='%1.1f%%', colors=['green', 'blue', 'red'])
        axes[1].set_title('Répartition des sentiments tous films confondus')
        
        plt.tight_layout()
        
        # Conversion en base64
        sentiment_chart = fig_to_base64(fig)
        plt.close(fig)
        
        return jsonify({
            "success": True,
            "films_positifs": films_positifs.to_dict('records'),
            "sentiment_chart": sentiment_chart,
            "total_evaluations": len(df),
            "sentiment_distribution": sentiment_distribution.to_dict()
        })
        
    except Exception as e:
        return jsonify({"error": f"Erreur lors de l'analyse de sentiment: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=PORT, debug=True)