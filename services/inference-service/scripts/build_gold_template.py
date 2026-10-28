"""Generate unlabeled synthetic retrieval scenarios for clinical review."""
import argparse
import json
from pathlib import Path

SCENARIOS = [
 ("comedonal", "Non-inflammatory comedones with no inflammatory lesions"),
 ("mild_papulopustular", "Mild papules and pustules with comedones"),
 ("moderate_papulopustular", "Moderate inflammatory papules and pustules"),
 ("severe_papulopustular", "Extensive inflammatory acne, possible scarring"),
 ("moderate_nodular", "Inflammatory nodules with moderate acne"),
 ("severe_nodular", "Painful deep nodules and high scarring concern"),
 ("conglobate", "Suspected conglobate acne with draining lesions"),
 ("pregnancy", "Acne treatment considerations during pregnancy"),
 ("trying_to_conceive", "Acne treatment while planning pregnancy"),
 ("systemic_antibiotics", "Duration and stewardship of systemic antibiotics"),
 ("topical_antibiotics", "Antibiotic resistance and combination treatment"),
 ("isotretinoin_monitoring", "Safety and monitoring for isotretinoin"),
 ("isotretinoin_mental_health", "Mental health considerations with isotretinoin"),
 ("topical_retinoid", "Topical retinoid selection and tolerability"),
 ("benzoyl_peroxide", "Benzoyl peroxide safety and irritation"),
 ("azelaic_acid", "Azelaic acid in acne care"),
 ("spironolactone", "Evidence for spironolactone in acne"),
 ("hormonal", "Hormonal therapies for acne"),
 ("maintenance", "Maintenance after successful induction therapy"),
 ("truncal", "Acne affecting chest and back"),
 ("scarring", "Risk of acne scarring and treatment escalation"),
 ("quality_of_life", "Psychosocial impact and acne management"),
 ("uncertain_diagnosis", "Uncertain acne diagnosis based on image alone"),
 ("no_lesions", "No visible acne lesions and uncertain need for treatment")
]
if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--out", default="gold-template.json")
    args = p.parse_args()
    rows = [{"id": key, "query": query, "relevant_source_ids": [],
             "reviewer": "", "review_status": "pending",
             "notes": "Human reviewer assigns relevant IDs from approved corpus."}
            for key, query in SCENARIOS]
    Path(args.out).write_text(json.dumps(rows, indent=2), encoding="utf-8")
    print(f"Wrote {len(rows)} unlabeled cases")
