# 🧪 ATUM — Drug Toxicity Predictor

> An AI-powered drug toxicity prediction system built for **Hack the Thunder**, IIT BHU.

---

## 🏆 Team ATUM

Built by a team of 4 for the Hack the Thunder Hackathon organized by IIT BHU.

---

## 🎯 Problem Statement

Drug development has a staggering failure rate — over 30% of drug candidates are abandoned due to **unexpected toxicity** discovered late in development. Early-stage toxicity screening is expensive, slow, and often inaccessible.

**ATUM** addresses this by providing instant, ML-powered toxicity predictions from a compound's SMILES string, enabling researchers to flag dangerous candidates before costly lab testing begins.

---

## ✨ Features

- 🤖 **Real ML Model** — XGBoost trained on the NIH Tox21 dataset (~12,000 compounds, 12 biological assays)
- 🧬 **12 Tox21 Assay Coverage** — Comprehensive biological toxicity profiling
- 🫀 **Organ-Specific Toxicity** — Liver, Kidney, Heart, Brain, and Hormonal impact analysis
- 📊 **Feature Importance Visualization** — Understand *why* a compound is flagged
- 💊 **Dosage Context & Safety Profile** — Contextual risk assessment per compound
- ⚠️ **Physical State Toxicity Warnings** — Flags based on compound physical properties
- 📁 **Bulk CSV Prediction** — Screen multiple compounds in one upload
- 📄 **PDF Report Download** — Exportable toxicity reports for documentation
- 🔄 **Alternative Compound Suggestions** — Recommends safer structural analogues

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| ML Model | XGBoost + Scikit-learn |
| Cheminformatics | RDKit (Morgan Fingerprints + Molecular Descriptors) |
| Dataset | NIH Tox21 (~12,000 compounds, 12 assays) |
| Backend | Python + Flask REST API |
| Frontend | HTML5, CSS3, JavaScript |
| Visualization | Three.js, Chart.js |

---

## 📈 Model Performance

| Metric | Score |
|---|---|
| Accuracy | ~95.7% |
| ROC-AUC | ~71.7% |
| Feature Dimensions | 2055 (2048 Morgan bits + 7 descriptors) |

> **Note:** Tox21 is a heavily imbalanced dataset (majority non-toxic). ROC-AUC is the primary evaluation metric as it accounts for class imbalance. A score of 71.7% meaningfully outperforms a random baseline (~50%) and naive majority-class classifiers.

---

## 🚀 How to Run

### Prerequisites
- Python 3.8+
- pip

### Setup

```bash
# Clone the repository
git clone https://github.com/team-atum/drug_toxicity_predictor.git

# Navigate to backend
cd drug_toxicity_predictor/backend

# Install dependencies
pip install -r requirements.txt

# Train the model
python train.py

# Start the server
python app.py
```

Then open your browser at **http://localhost:5000**

---

## 🗂 Project Structure

```
drug_toxicity_predictor/
├── backend/
│   ├── app.py              # Flask REST API
│   ├── train.py            # Model training script
│   ├── requirements.txt    # Python dependencies
│   └── model/              # Saved XGBoost model
└── frontend/
    ├── index.html          # Main UI
    ├── style.css           # Styling
    └── script.js           # Frontend logic & visualizations
```

---

## 💡 How It Works

1. User inputs a **SMILES string** (chemical notation for a molecule)
2. RDKit generates **2048-bit Morgan fingerprints** + **7 molecular descriptors**
3. XGBoost model predicts toxicity across **12 Tox21 assays**
4. Results are mapped to **organ-level risk** and presented with **feature importance charts**
5. Optionally export a full **PDF safety report**

---

## 🔬 Dataset

The model is trained on the **NIH Tox21 dataset**, a benchmark toxicology dataset containing:
- ~12,000 chemical compounds
- 12 biological assay endpoints (nuclear receptors + stress response pathways)
- Curated by the National Institutes of Health for ML toxicity research

---

*Built with ❤️ at Hack the Thunder, IIT BHU*