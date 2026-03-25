import pandas as pd
import numpy as np
from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
import joblib
import os

TOX21_ASSAYS = [
    'NR-AR', 'NR-AR-LBD', 'NR-AhR', 'NR-Aromatase',
    'NR-ER', 'NR-ER-LBD', 'NR-PPAR-gamma',
    'SR-ARE', 'SR-ATAD5', 'SR-HSE', 'SR-MMP', 'SR-p53'
]

def compute_features(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None
    fp = AllChem.GetMorganFingerprintAsBitVect(mol, radius=2, nBits=2048)
    fp_array = np.array(fp, dtype=np.float32)
    descriptors = [
        Descriptors.MolWt(mol),
        Descriptors.MolLogP(mol),
        Descriptors.NumHDonors(mol),
        Descriptors.NumHAcceptors(mol),
        Descriptors.TPSA(mol),
        Descriptors.NumRotatableBonds(mol),
        Descriptors.NumAromaticRings(mol)
    ]
    features = np.concatenate([fp_array, descriptors])
    return features

def main():
    print("=" * 60)
    print("ATUM - Drug Toxicity Prediction Model Training")
    print("=" * 60)

    csv_path = os.path.join('data', 'tox21.csv')
    if not os.path.exists(csv_path):
        print(f"\nERROR: {csv_path} not found.")
        print("Please download the Tox21 dataset:")
        print("  https://deepchemdata.s3-us-west-1.amazonaws.com/datasets/tox21.csv.gz")
        print(f"Extract and place it at: {csv_path}")
        return

    print("\n[1/5] Loading Tox21 dataset...")
    df = pd.read_csv(csv_path)
    print(f"  Total compounds: {len(df)}")

    primary_target = 'NR-AR'
    df_clean = df.dropna(subset=[primary_target, 'smiles']).reset_index(drop=True)
    print(f"  Compounds with {primary_target} labels: {len(df_clean)}")

    print("\n[2/5] Computing molecular features...")
    features_list = []
    valid_indices = []
    for i, smiles in enumerate(df_clean['smiles']):
        feat = compute_features(smiles)
        if feat is not None:
            features_list.append(feat)
            valid_indices.append(i)
        if (i + 1) % 500 == 0:
            print(f"  Processed {i + 1}/{len(df_clean)} molecules...")

    X = np.array(features_list, dtype=np.float32)
    y = df_clean.iloc[valid_indices][primary_target].values.astype(int)
    print(f"  Valid molecules: {len(X)}")
    print(f"  Feature vector size: {X.shape[1]}")
    print(f"  Positive samples: {y.sum()} | Negative samples: {(1 - y).sum()}")

    feature_names = [f'fp_{i}' for i in range(2048)] + [
        'MolWt', 'LogP', 'NumHDonors', 'NumHAcceptors',
        'TPSA', 'NumRotatableBonds', 'NumAromaticRings'
    ]

    print("\n[3/5] Splitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  Train: {len(X_train)} | Test: {len(X_test)}")

    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    scale_weight = neg_count / pos_count if pos_count > 0 else 1.0
    print(f"  scale_pos_weight: {scale_weight:.2f}")

    print("\n[4/5] Training XGBoost model...")
    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=scale_weight,
        eval_metric='logloss',
        use_label_encoder=False,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    print("\n[5/5] Evaluating model...")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    accuracy = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)
    print(f"  Accuracy:  {accuracy:.4f}")
    print(f"  ROC-AUC:   {roc_auc:.4f}")

    assay_models = {}
    for assay in TOX21_ASSAYS:
        if assay not in df.columns:
            continue
        df_assay = df.dropna(subset=[assay, 'smiles']).reset_index(drop=True)
        a_features = []
        a_indices = []
        for i, smiles in enumerate(df_assay['smiles']):
            feat = compute_features(smiles)
            if feat is not None:
                a_features.append(feat)
                a_indices.append(i)
        if len(a_features) < 50:
            continue
        Xa = np.array(a_features, dtype=np.float32)
        ya = df_assay.iloc[a_indices][assay].values.astype(int)
        neg_a = (ya == 0).sum()
        pos_a = (ya == 1).sum()
        sw_a = neg_a / pos_a if pos_a > 0 else 1.0
        m = XGBClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.1,
            scale_pos_weight=sw_a,
            eval_metric='logloss',
            use_label_encoder=False,
            random_state=42,
            n_jobs=-1
        )
        m.fit(Xa, ya, verbose=False)
        assay_models[assay] = m
        print(f"  Trained assay model: {assay} ({len(Xa)} samples)")

    save_data = {
        'primary_model': model,
        'assay_models': assay_models,
        'feature_names': feature_names,
        'accuracy': accuracy,
        'roc_auc': roc_auc
    }
    joblib.dump(save_data, 'model.pkl')
    print(f"\nModel saved to model.pkl")
    print("=" * 60)
    print("Training complete!")
    print("=" * 60)

if __name__ == '__main__':
    main()