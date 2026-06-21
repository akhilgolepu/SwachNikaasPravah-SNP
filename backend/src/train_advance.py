import os
import torch
from ultralytics import YOLO

def train_ultimate_model():
    print("="*60)
    print("[ULTIMATE PIPELINE] Initializing High-Fidelity Training Loop...")
    cuda_active = torch.cuda.is_available()
    print(f"CUDA Core Architecture Detected: {cuda_active}")
    print("="*60)

    # 1. Path Verification
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(current_dir)
    yaml_config = os.path.join(backend_dir, "ml_training", "data.yaml")

    if not os.path.exists(yaml_config):
        raise FileNotFoundError(f"Configuration file missing at {yaml_config}")

    # 2. Upgrade to YOLO11 Medium Architecture for elite feature resolution
    print("[INFO] Compiling state-of-the-art YOLO11 Medium network weights...")
    model = YOLO("yolo11m.pt") 

    # 3. Comprehensive Optimization Parameters
    print("[INFO] Launching 100-epoch hyperparameter evolution loop...")
    model.train(
        data=yaml_config,
        epochs=100,                # Expanded training path depth
        patience=15,               # Early stopping threshold to halt training if validation plates out
        imgsz=640,                 # Keep frame scaling square
        batch=16,                  # High density mapping for 8GB VRAM boundaries
        workers=8,                 # Maximizes multi-thread dataset parsing
        device=0 if cuda_active else 'cpu',
        optimizer='AdamW',         # Superior convergence over raw stochastic gradient descent
        lr0=0.001,                 # Balanced base learning rate
        cos_lr=True,               # Uses a Cosine Learning Rate Scheduler for smoother weight adjustments
        
        # Advanced Augmentations to combat small data size
        mosaic=1.0,                # 4-image structural composite framing
        mixup=0.15,                # Alpha-blend image overlay to drastically boost generalization
        scale=0.5,                 # Zoom variations (+/- 50%) to mimic different camera heights
        fliplr=0.5,                # Horizontal flip simulation
        
        project="runs/detect/snp_runs",
        name="drain_ultimate_model"
    )

    print("\n" + "="*60)
    print("[SUCCESS] Ultimate model weights successfully exported to:")
    print("./runs/detect/snp_runs/drain_ultimate_model/weights/best.pt")
    print("="*60)

if __name__ == "__main__":
    train_ultimate_model()