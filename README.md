# 🧪 ATUM — Drug Toxicity Predictor

> An AI-powered drug toxicity prediction system built for **CodeCure AI Hackathon**.

---

## 📖 Overview

Drug development has a staggering failure rate — over 30% of drug candidates are abandoned due to **unexpected toxicity** discovered late in development. Early-stage toxicity screening is expensive, slow, and often inaccessible.

**ATUM** addresses this by providing instant, ML-powered toxicity predictions from a compound's SMILES string, enabling researchers to flag dangerous candidates before costly lab testing begins.

---

## 🏆 Team ATUM

Built by a team of 4 for the **CodeCure AI Hackathon**.

---

## ✨ Features

- 🤖 **Real ML Model** — XGBoost trained on NIH Tox21 (~12,000 compounds, 12 assays)
- 🧬 **12 Tox21 Assay Coverage** — Comprehensive biological toxicity profiling
- 🫀 **Organ-Specific Toxicity** — Liver, Kidney, Heart, Brain, and Hormonal impact
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

## ⚙️ Technical Workflow

```
User Input (SMILES String)
        ↓
RDKit Processing
  - 2048-bit Morgan Fingerprints
  - 7 Molecular Descriptors
  - Total: 2055 features
        ↓
XGBoost Model (pre-trained on Tox21)
        ↓
Toxicity Predictions across 12 assays
        ↓
Organ-level Risk Mapping
  (Liver / Kidney / Heart / Brain / Hormones)
        ↓
Output: Safety Profile + Feature Importance + PDF Report
```

---

## 📈 Model Performance

| Metric | Score |
|---|---|
| Accuracy | ~95.7% |
| ROC-AUC | ~71.7% |
| Feature Dimensions | 2055 (2048 Morgan bits + 7 descriptors) |

> **Note:** Tox21 is a heavily imbalanced dataset (majority non-toxic). ROC-AUC is the primary evaluation metric as it accounts for class imbalance. A score of 71.7% meaningfully outperforms random baseline (~50%) and naive majority-class classifiers.

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

# Start the server (pre-trained model included — no training needed!)
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
│   ├── model.pkl           # Pre-trained XGBoost model
│   ├── requirements.txt    # Python dependencies
│   └── data/               # Tox21 dataset
└── frontend/
    ├── index.html          # Main UI
    ├── style.css           # Styling
    └── script.js           # Frontend logic & visualizations
```

---

## 🔬 Dataset

Trained on the **NIH Tox21 dataset**:
- ~12,000 chemical compounds
- 12 biological assay endpoints (nuclear receptors + stress response pathways)
- Curated by the National Institutes of Health for ML toxicity research

---

*Built with ❤️ for CodeCure AI Hackathon*