import keyboard
from PIL import ImageGrab
import pystray
from pystray import MenuItem as item
from PIL import Image, ImageDraw
import os
from datetime import datetime
import threading

# Define the folder where screenshots will be saved
SCREENSHOT_FOLDER = r"D:\my-screenshots"

# Create the folder if it doesn't exist
if not os.path.exists(SCREENSHOT_FOLDER):
    os.makedirs(SCREENSHOT_FOLDER)

# Global state
hotkey_active = True
icon = None

def take_screenshot():
    """Capture screenshot and save to folder"""
    if not hotkey_active:
        return
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screenshot_{timestamp}.png"
    filepath = os.path.join(SCREENSHOT_FOLDER, filename)
    
    screenshot = ImageGrab.grab()
    screenshot.save(filepath)

def create_icon_image():
    """Create a simple camera icon for the system tray"""
    # Create a 64x64 image
    img = Image.new('RGB', (64, 64), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple camera shape
    draw.rectangle([10, 20, 54, 50], fill='black')
    draw.rectangle([20, 15, 35, 20], fill='black')
    draw.ellipse([25, 28, 39, 42], fill='white')
    draw.ellipse([48, 24, 54, 30], fill='red')
    
    return img

def toggle_hotkey(icon_obj, item):
    """Toggle hotkey on/off"""
    global hotkey_active
    hotkey_active = not hotkey_active

def open_folder(icon_obj, item):
    """Open the screenshot folder"""
    os.startfile(SCREENSHOT_FOLDER)

def quit_app(icon_obj, item):
    """Quit the application"""
    icon_obj.stop()

def setup_tray_icon():
    """Setup the system tray icon"""
    global icon
    
    # Create menu
    menu = pystray.Menu(
        item('Screenshot Hotkey (F12)', lambda: None, enabled=False),
        item('Toggle Hotkey', toggle_hotkey, default=True, checked=lambda item: hotkey_active),
        item('Open Screenshots Folder', open_folder),
        item('Quit', quit_app)
    )
    
    # Create icon
    icon_image = create_icon_image()
    icon = pystray.Icon("screenshot_tool", icon_image, "Screenshot Tool - F12", menu)
    
    # Run icon (this blocks)
    icon.run()

def main():
    """Main function"""
    # Register hotkey - using F12 (change if needed)
    keyboard.add_hotkey('f12', take_screenshot)
    
    # Start system tray icon in main thread (runs silently)
    setup_tray_icon()

if __name__ == "__main__":
    main()