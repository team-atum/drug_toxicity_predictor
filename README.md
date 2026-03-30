# 🧪 ATUM — Drug Toxicity Prediction

> AI-powered drug toxicity prediction system built for Hack the Thunder, IIT BHU

## 🏆 Team ATUM
Built by 4 members for the Hack the Thunder Hackathon organized by IIT BHU.

## 🎯 Problem Statement
Drug development frequently fails due to unexpected toxicity. This tool predicts potential drug toxicity using chemical structure and molecular descriptor data.

## ✨ Features
- 🔬 Real ML model (XGBoost) trained on Tox21 dataset with ~95% accuracy
- 🧬 Analyzes 12 Tox21 biological assays
- 🫀 Organ-specific toxicity (Liver, Kidney, Heart, Brain, Hormones)
- 📊 Feature importance visualization
- 💊 Dosage context and safety profile
- ⚠️ Physical state toxicity warnings
- 📁 Bulk CSV prediction for multiple compounds
- 📄 PDF report download
- 🔄 Alternative compound suggestions

## 🛠️ Tech Stack
- **ML Model:** XGBoost + Scikit-learn
- **Chemistry:** RDKit (Morgan Fingerprints + Molecular Descriptors)
- **Dataset:** NIH Tox21 (~12,000 compounds, 12 assays)
- **Backend:** Python Flask REST API
- **Frontend:** HTML5, CSS3, JavaScript
- **Visualization:** Three.js, Chart.js

## 🚀 How to Run
git clone https://github.com/team-atum/drug_toxicity_predictor.git
cd drug_toxicity_predictor/backend
pip install -r requirements.txt
python train.py
python app.py
Open browser at http://localhost:5000

## 📊 Model Performance
- Accuracy: ~95.7%
- ROC-AUC: ~71.7%
- Features: 2055 (2048 Morgan bits + 7 descriptors)