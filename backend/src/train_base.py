import os
import torch
from ultralytics import YOLO

def train_custom_baseline():
    # 1. System GPU Acceleration Validation Check
    print("="*60)
    print("[SYSTEM CHECK] Verifying local GPU compute architecture...")
    cuda_active = torch.cuda.is_available()
    print(f"CUDA Hardware Acceleration Found: {cuda_active}")
    if cuda_active:
        print(f"Active Graphics Device: {torch.cuda.get_device_name(0)}")
    print("="*60)

    # 2. Point precisely to our newly extracted data configuration file
    yaml_config_path = os.path.abspath("./ml_training/data.yaml")
    if not os.path.exists(yaml_config_path):
        raise FileNotFoundError(f"Configuration profile missing at {yaml_config_path}. Run download_data.py first.")

    # 3. Load the default pre-trained lightweight YOLO Architecture
    print("[INFO] Loading baseline YOLO weights blueprint...")
    model = YOLO("yolov8n.pt") # Fast, low VRAM footprint execution footprint

    # 4. Initialize Transfer-Learning Optimization Cycle
    print("[INFO] Launching model training loop. Optimization running on local GPU...")
    model.train(
        data=yaml_config_path,
        epochs=5,                  # Set to 5 epochs for a rapid hackathon validation run
        imgsz=640,                 # Standard input resolution
        batch=16,                  # Memory-safe batch configuration for an 8GB VRAM pool
        device=0 if cuda_active else 'cpu', # Pins processing straight to your active GPU
        project="snp_runs",        # Output root project namespace
        name="drain_base_model"    # Run trial directory label
    )

    print("\n" + "="*60)
    print("[SUCCESS] Fine-tuning baseline complete.")
    print("Production weight binary generated successfully at:")
    print("./snp_runs/drain_base_model/weights/best.pt")
    print("="*60)

if __name__ == "__main__":
    train_custom_baseline()