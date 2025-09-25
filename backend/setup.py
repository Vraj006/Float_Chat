#!/usr/bin/env python3
"""
Setup script for FloatChat RAG Backend
"""

import subprocess
import sys
import os

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False
    return True

def check_env_file():
    """Check if .env file exists"""
    if os.path.exists(".env"):
        print("✅ .env file found")
        return True
    else:
        print("❌ .env file not found. Please create .env file with required variables.")
        print("Required variables:")
        print("- SUPABASE_URL")
        print("- SUPABASE_KEY")
        print("- MISTRAL_API_KEY")
        print("- TABLE_LIST")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up FloatChat RAG Backend...")

    if not check_env_file():
        return False

    if not install_requirements():
        return False

    print("\n✅ Setup complete!")
    print("\nTo start the server:")
    print("python floatchat_flask.py")
    print("\nOr with Flask CLI:")
    print("flask --app floatchat_flask run --host=0.0.0.0 --port=5000")

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)