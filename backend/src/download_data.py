import os
from roboflow import Roboflow

def fetch_hackathon_dataset():
    print("[INFO] Authenticating with Roboflow public server context...")
    
    # PASTE YOUR ACTUAL ROBOFLOW API KEY HERE 👇
    rf = Roboflow(api_key="lRzDNK9Q6zLf3Ro0HTqp") 
    
    project = rf.workspace("chaitanya-kharche").project("drain-overflow")
    
    print("[INFO] Pulling images and converting annotations directly to YOLO format...")
    dataset = project.version(1).download("yolov8")
    
    print(f"[SUCCESS] Dataset downloaded cleanly to: {dataset.location}")
    
    # Clean up and rename to match our target ML training folder architecture
    if os.path.exists("./drain-overflow-1"):
        if os.path.exists("./ml_training"):
            import shutil
            shutil.rmtree("./ml_training") # Wipe existing placeholder if it exists
        os.rename("./drain-overflow-1", "./ml_training")
        print("[INFO] Directory successfully mapped to ./ml_training")

if __name__ == "__main__":
    fetch_hackathon_dataset()