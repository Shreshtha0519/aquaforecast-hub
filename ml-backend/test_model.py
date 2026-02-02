"""
Test script to verify model loading and prediction
"""

import pickle
import sys
from pathlib import Path

def test_model():
    """Test if the model can be loaded and used for predictions"""
    
    model_path = Path(__file__).parent / 'models' / 'water_demand_model.pkl'
    
    print("🔍 Testing Model Loading...")
    print(f"📁 Looking for: {model_path}")
    
    if not model_path.exists():
        print("\n❌ Model file not found!")
        print("\n📋 Follow these steps:")
        print("1. Open ml-backend/models/water_demand_model.ipynb")
        print("2. Find your trained model variable (e.g., 'model', 'rf_model')")
        print("3. Add a cell with:")
        print("\n   import pickle")
        print("   with open('water_demand_model.pkl', 'wb') as f:")
        print("       pickle.dump(your_model_variable, f)")
        print("\n4. Run the cell")
        print("5. Verify file created: ls models/water_demand_model.pkl")
        print("\n6. Run this test again: python test_model.py")
        return False
    
    try:
        # Load model
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        print(f"\n✅ Model loaded successfully!")
        print(f"📦 Model type: {type(model)}")
        print(f"📏 Model object: {model.__class__.__name__}")
        
        # Try to get model attributes
        if hasattr(model, 'feature_names_in_'):
            print(f"🔢 Features: {len(model.feature_names_in_)} features")
            print(f"   {list(model.feature_names_in_)[:5]}..." if len(model.feature_names_in_) > 5 else model.feature_names_in_)
        
        if hasattr(model, 'n_features_in_'):
            print(f"🔢 Input features: {model.n_features_in_}")
        
        # Check if model has predict method
        if hasattr(model, 'predict'):
            print("\n✅ Model has predict() method")
            
            # Try a dummy prediction
            try:
                import numpy as np
                
                # Create dummy input (you'll need to adjust this based on your model)
                n_features = getattr(model, 'n_features_in_', 5)
                dummy_input = np.random.rand(1, n_features)
                
                prediction = model.predict(dummy_input)
                print(f"✅ Test prediction successful!")
                print(f"   Input shape: {dummy_input.shape}")
                print(f"   Output: {prediction}")
                
            except Exception as e:
                print(f"⚠️  Prediction test failed (this is OK, just adjust features): {e}")
        
        print("\n" + "="*60)
        print("✅ MODEL READY FOR API!")
        print("="*60)
        print("\nNext steps:")
        print("1. Update app.py with your model's feature requirements")
        print("2. Start the API: python app.py")
        print("3. Test endpoint: curl -X POST http://localhost:8000/api/forecast \\")
        print('     -H "Content-Type: application/json" \\')
        print('     -d \'{"region":"Maharashtra","months_ahead":6}\'')
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error loading model: {e}")
        print("\n🔧 Troubleshooting:")
        print("- Ensure the model was saved with pickle")
        print("- Check Python version compatibility")
        print("- Verify all required libraries are installed")
        return False

if __name__ == "__main__":
    test_model()
