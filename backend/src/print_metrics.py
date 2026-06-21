# backend/src/print_metrics.py
import os
import pandas as pd

results_path = "/home/akhil/DrainageAi/backend/runs/detect/snp_runs/drain_premium_model/results.csv"

if os.path.exists(results_path):
    df = pd.read_csv(results_path)
    final_epoch = df.iloc[-1]
    
    print("="*60)
    print("      SWACHNIKAASPRAVAH (SNP) - FINAL PERFORMANCE METRICS")
    print("="*60)
    print(f"• Train Box Loss:     {final_epoch.filter(like='train/box_loss').values[0]:.4f}")
    print(f"• Train Class Loss:   {final_epoch.filter(like='train/cls_loss').values[0]:.4f}")
    print(f"• Validation mAP50:   {final_epoch.filter(like='metrics/mAP50(B)').values[0]*100:.2f}%")
    print(f"• Validation mAP50-95:{final_epoch.filter(like='metrics/mAP50-95(B)').values[0]*100:.2f}%")
    print("="*60)
else:
    print(f"[ERROR] Results matrix file not found at: {results_path}")