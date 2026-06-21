import os
import torch
from ultralytics import YOLO

def train_premium_model():
    print("="*60)
    print("[SYSTEM INITIALIZATION] Running Advanced Deep Learning Pipeline...")
    cuda_active = torch.cuda.is_available()
    print(f"CUDA Hardware Acceleration: {cuda_active}")
    if cuda_active:
        print(f"Targeting Graphics Engine: {torch.cuda.get_device_name(0)}")
    print("="*60)

    # 1. Resolve configuration path cleanly
   # 1. Resolve configuration path dynamically relative to this script's location
    current_script_dir = os.path.dirname(os.path.abspath(__file__)) # backend/src
    backend_dir = os.path.dirname(current_script_dir)               # backend
    yaml_config_path = os.path.join(backend_dir, "ml_training", "data.yaml")
    
    if not os.path.exists(yaml_config_path):
        raise FileNotFoundError(f"Configuration profile missing at {yaml_config_path}")

    # 2. Upgrade to a Small or Medium model scale blueprint
    # 'yolov8s.pt' (Small) is balanced; swap to 'yolov8m.pt' (Medium) if you want deeper training graphs
    print("[INFO] Loading enhanced YOLOv8 Small architecture layers...")
    model = YOLO("yolov8s.pt") 

    # 3. Initialize high-fidelity training loop
    print("[INFO] Commencing fine-tuning loop. Compiling weights...")
    model.train(
        data=yaml_config_path,
        epochs=30,                 # 30 epochs allows genuine convergence and clean metrics curves
        imgsz=640,                 # Keep frame dimensions standard for performance stability
        batch=16,                  # Memory-safe batch allocation optimized for an 8GB VRAM pool
        workers=8,                 # Leverages multi-core processing for hyper-fast data loading
        device=0 if cuda_active else 'cpu',
        optimizer='AdamW',         # Superior weight decay management for custom datasets
        lr0=0.001,                 # Optimal initial learning rate for transfer learning
        mosaic=1.0,                # Enable high-density multi-image composite training augmentation
        degrees=10.0,              # Introduce slight rotational variations to simulate tilted cameras
        project="runs/detect/snp_runs",
        name="drain_premium_model" # Distinct run folder to avoid overwriting your base model
    )

    print("\n" + "="*60)
    print("[SUCCESS] Deep Learning Optimization Completed.")
    print("Premium production binary weights successfully exported to:")
    print("./runs/detect/snp_runs/drain_premium_model/weights/best.pt")
    print("="*60)

if __name__ == "__main__":
    train_premium_model()