import keyboard
from PIL import ImageGrab
import pystray
from pystray import MenuItem as item
from PIL import Image, ImageDraw
import os
from datetime import datetime
import threading
import requests
import uuid
from io import BytesIO

# Define the folder where screenshots will be saved
SCREENSHOT_FOLDER = r"D:\my-screenshots"

# API Configuration
API_ENDPOINT = "http://localhost:3000/api/upload"  # Change this to your API URL
API_KEY = ""  # Optional: Add your API key if needed
SEND_TO_API = True  # Set to False to disable API uploads

# Create the folder if it doesn't exist
if not os.path.exists(SCREENSHOT_FOLDER):
    os.makedirs(SCREENSHOT_FOLDER)

# Global state
hotkey_active = True
icon = None

def upload_to_api(image, filename):
    """Upload image to API via POST request"""
    if not SEND_TO_API:
        return
    
    try:
        # Generate unique ID for the image
        image_id = str(uuid.uuid4())
        
        # Convert image to bytes
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        buffered.seek(0)
        
        print(f"Uploading to API: {filename}")  # Debug
        
        # Prepare multipart form data
        files = {
            'image': (f"{image_id}.png", buffered, 'image/png')
        }
        
        # Additional form data
        data = {
            'image_id': image_id,
            'filename': filename,
            'timestamp': datetime.now().isoformat()
        }
        
        # Optional: Add headers
        headers = {}
        if API_KEY:
            headers['Authorization'] = f'Bearer {API_KEY}'
        
        # Send POST request
        response = requests.post(
            API_ENDPOINT,
            files=files,
            data=data,
            headers=headers,
            timeout=30
        )
        
        # Check response
        if response.status_code == 200 or response.status_code == 201:
            print(f"✓ Screenshot uploaded successfully: {filename} (ID: {image_id})")
        else:
            print(f"✗ Upload failed: {response.status_code} - {response.text}")
    
    except requests.exceptions.Timeout:
        print(f"✗ API request timeout for {filename}")
    except requests.exceptions.RequestException as e:
        print(f"✗ API request error for {filename}: {str(e)}")
    except Exception as e:
        print(f"✗ Unexpected error: {str(e)}")

def take_screenshot():
    """Capture screenshot and upload to API"""
    if not hotkey_active:
        return
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screenshot_{timestamp}.png"
    filepath = os.path.join(SCREENSHOT_FOLDER, filename)
    
    # Capture screenshot
    screenshot = ImageGrab.grab()
    screenshot.save(filepath)
    
    # Upload to API in a separate thread to avoid blocking
    if SEND_TO_API:
        threading.Thread(target=upload_to_api, args=(screenshot, filename), daemon=True).start()

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