import keyboard
from PIL import ImageGrab
import os
from datetime import datetime

# Define the folder where screenshots will be saved
SCREENSHOT_FOLDER = r"D:\my-screenshots"

# Create the folder if it doesn't exist
if not os.path.exists(SCREENSHOT_FOLDER):
    os.makedirs(SCREENSHOT_FOLDER)

def take_screenshot():
    """Capture screenshot and save to folder"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screenshot_{timestamp}.png"
    filepath = os.path.join(SCREENSHOT_FOLDER, filename)
    
    screenshot = ImageGrab.grab()
    screenshot.save(filepath)
    
    print(f"✓ Screenshot saved: {filepath}")

keyboard.add_hotkey('f12', take_screenshot)

print("=" * 50)
print("Screenshot Tool Active!")
print("=" * 50)
print("Current hotkey: F12")
print("Screenshot folder:", SCREENSHOT_FOLDER)
print("\nPress the hotkey to capture a screenshot.")
print("Press Ctrl+C to exit.")
print("=" * 50)

keyboard.wait()