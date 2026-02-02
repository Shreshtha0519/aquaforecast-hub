"""
Export trained model from Jupyter notebook to pickle file
Run this script to convert your trained model to .pkl format
"""

import pickle
import sys
from pathlib import Path

def export_model():
    """
    Instructions to export your model:
    
    1. Open ml-backend/models/water_demand_model.ipynb
    2. Find the cell where your trained model is stored (e.g., 'model', 'rf_model', 'xgb_model', etc.)
    3. Add a new cell at the end with this code:
    
    import pickle
    
    # Replace 'model' with your actual model variable name
    with open('water_demand_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    print("Model saved successfully!")
    
    4. Run that cell
    5. The .pkl file will be created in the models/ directory
    
    Alternative: If you want to run this from the notebook directly:
    """
    
    print("=" * 60)
    print("MODEL EXPORT HELPER")
    print("=" * 60)
    print("\n📋 To export your model from the notebook:\n")
    
    print("1. Open: ml-backend/models/water_demand_model.ipynb")
    print("\n2. Add this code in a new cell at the end:\n")
    
    code = """
import pickle

# Replace 'model' with your variable name
# Common names: model, rf_model, xgb_model, regressor, etc.
MODEL_VARIABLE = model  # ⬅️ UPDATE THIS

with open('water_demand_model.pkl', 'wb') as f:
    pickle.dump(MODEL_VARIABLE, f)
    
print(f"✅ Model saved: {type(MODEL_VARIABLE)}")
print(f"📦 File: water_demand_model.pkl")
"""
    
    print(code)
    print("\n3. Run that cell to create the .pkl file")
    print("\n4. Verify the file exists:")
    print("   ls ml-backend/models/water_demand_model.pkl")
    print("\n5. Test loading:")
    
    test_code = """
import pickle
with open('ml-backend/models/water_demand_model.pkl', 'rb') as f:
    loaded_model = pickle.load(f)
    print(f"Model loaded: {type(loaded_model)}")
"""
    print(test_code)
    
    print("\n" + "=" * 60)
    print("After export, restart your FastAPI server to use the model!")
    print("=" * 60)

if __name__ == "__main__":
    export_model()
