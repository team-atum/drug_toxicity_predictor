# 🧪 ATUM — Drug Toxicity Predictor

> An AI-powered drug toxicity prediction system built for **CodeCure AI Hackathon**.
> *"Bringing the lab into the computer to solve billion-dollar disasters."*

---

## 📖 Overview

Drug development has a staggering failure rate — over 30% of drug candidates are abandoned due to **unexpected toxicity** discovered late in development. Early-stage toxicity screening is expensive, slow, and often inaccessible. 

Bringing a new drug to market costs an average of $2.6 billion, and a single failed candidate represents 10–15 years of wasted research. **ATUM** addresses this by providing instant, ML-powered toxicity predictions from a compound's SMILES string, pushing toxicity detection to the very beginning of the pipeline to flag dangerous candidates before costly lab testing begins.

---

## 🏆 Team ATUM

Built by a team of 4 for the **CodeCure AI Hackathon**.
*(Team Members: Trisha Singh, Uttam Kumar, Ruchi Kumari, and Manjeet Kumar)*

---

## ✨ Features

- 🤖 **Real ML Model** — XGBoost trained on NIH Tox21 (~12,000 compounds, 12 assays), fiercely penalizing false negatives using `scale_pos_weight`.
- 🧬 **12 Tox21 Assay Coverage** — Comprehensive biological toxicity profiling (nuclear receptors + stress response pathways).
- 🫀 **Organ-Specific Toxicity** — Assays map to Liver, Kidney, Heart, Brain, and Hormonal impact with clinical severity scoring.
- 📊 **Feature Importance Visualization** — Integrated SHAP (TreeExplainer) to provide mathematical proof of *why* a compound is flagged.
- 🧊 **Real 3D Molecular Visualisation** — Generates actual energy-minimised 3D coordinates using MMFF force-field optimisation (via RDKit & 3Dmol.js).
- 💊 **Dosage Context & Safety Profile** — Contextual risk assessment per compound based on Lipinski parameters.
- ⚠️ **Physical State Toxicity Warnings** — Flags based on compound physical properties and excretion pathways.
- 📁 **Bulk CSV Prediction** — Screen multiple compounds in one upload (up to 100 compounds simultaneously).
- 📄 **PDF Report Download** — Exportable toxicity reports for documentation, cross-referenced with PubChem.
- 🔄 **Alternative Compound Suggestions** — Recommends safer structural analogues.
- 🛡️ **Extreme Defensive Programming** — Handles invalid inputs gracefully without crashing during live evaluation.

---

## 💻 Live Demo Guide

When evaluating ATUM, try these pre-rehearsed test molecules to see the system's full range:

1. **The Safe Compound:** Input `CCO` (Ethanol) to see a low-risk profile and baseline feature influences.
2. **The Toxic Hit:** Input `O=C(O)CCC(=O)c1ccc(-c2ccccc2)cc1` to see the SHAP explanation charts trigger and highlight dangerous molecular substructures.
3. **The Invalid Edge Case:** Input `INVALID_CHEMICAL_xyz123` to test our error handling. The app will catch the structural error instantly without crashing the interface.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| ML Model | XGBoost + Scikit-learn + SHAP |
| Cheminformatics | RDKit (Morgan Fingerprints + Molecular Descriptors), PubChem API |
| Dataset | NIH Tox21 (~12,000 compounds, 12 assays) |
| Backend | Python + Flask REST API |
| Frontend | HTML5, CSS3, JavaScript |
| Visualization | Three.js, 3Dmol.js, Chart.js, jsPDF |

---

## ⚙️ Technical Workflow

User Input (SMILES String)
        ↓
RDKit Processing
  - 2048-bit Morgan Fingerprints (ECFP4)
  - 7 Molecular Descriptors (MolWt, LogP, TPSA, etc.)
  - Total: 2055 features
        ↓
XGBoost Model (pre-trained on Tox21)
        ↓
Toxicity Predictions across 12 assays
        ↓
Organ-level Risk Mapping
  (Liver / Kidney / Heart / Brain / Hormones)
        ↓
Output: Safety Profile + Feature Importance (SHAP) + PDF Report

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

**Prerequisites**
* Python 3.8+
* `pip` (Python package manager)

**Step-by-Step Guide**

1. **Clone the repository**
   ```bash
   git clone https://github.com/team-atum/drug_toxicity_predictor.git
   ```

2. **Navigate to the backend directory**
   ```bash
   cd drug_toxicity_predictor/backend
   ```

3. **Install the required dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the Flask server** *(Note: The pre-trained XGBoost model is already included, so no training is necessary to run the app)*
   ```bash
   python app.py
   ```

5. **Access the platform**
   Open your web browser and go to `http://localhost:5000`

---

### 🗂️ Project Structure

```text
drug_toxicity_predictor/
│
├── backend/
│   ├── app.py              # Main Flask REST API application
│   ├── train.py            # Model training script for the XGBoost classifiers
│   ├── model.pkl           # Pre-trained XGBoost model files
│   ├── requirements.txt    # List of Python dependencies (RDKit, Flask, SHAP, etc.)
│   └── data/               # Directory containing the NIH Tox21 dataset
│
└── frontend/
    ├── index.html          # Main user interface and layout
    ├── style.css           # Custom styling and animations
    └── script.js           # Frontend logic, API calls, and visualizations (3Dmol.js, Chart.js)
```

## 🔬 Dataset

Trained on the **NIH Tox21 dataset**:
- ~12,000 chemical compounds
- 12 biological assay endpoints (nuclear receptors + stress response pathways)
- Curated by the National Institutes of Health for ML toxicity research

---

*Built with ❤️ for CodeCure AI Hackathon*