# Screenshot Tool

A simple and efficient screenshot utility that runs in your system tray. Take screenshots instantly with a hotkey and manage them easily.

## Features

- Quick screenshots with F12 hotkey
- System tray icon with easy controls
- Automatic screenshot naming with timestamps
- Toggle screenshot functionality on/off
- Quick access to screenshots folder
- Silent running in the background

## Dependencies

This project requires several Python packages to be installed. You can install them using pip with the following commands:

```bash
pip install keyboard
pip install Pillow
pip install pystray
```

### Package Details

- `keyboard`: For handling keyboard inputs and hotkeys (F12 screenshot trigger)
- `Pillow`: Python Imaging Library for image processing and screenshot capture
- `pystray`: For creating system tray icons and menu interface

## Usage

1. Make sure you have Python installed on your system
2. Install the required packages using the pip commands above
3. Run the script: `python screen_index.py`
4. Look for the camera icon in your system tray
5. Press F12 to take a screenshot at any time

### System Tray Features

- **Screenshot Hotkey (F12)**: Displays the current hotkey
- **Toggle Hotkey**: Enable/disable the screenshot functionality
- **Open Screenshots Folder**: Quick access to your saved screenshots
- **Quit**: Exit the application

Screenshots are automatically saved in `D:\my-screenshots` with timestamps in the format: `screenshot_YYYYMMDD_HHMMSS.png`

## Getting Started

1. Clone this repository
2. Install dependencies
3. Run the script
4. The tool will create the screenshots folder if it doesn't exist
5. Use F12 to take screenshots!
