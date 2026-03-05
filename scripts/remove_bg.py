from PIL import Image
import numpy as np
import os

logo_path = os.path.join(os.path.dirname(__file__), "..", "public", "images", "logo.png")
logo_path = os.path.abspath(logo_path)
print(f"Looking for logo at: {logo_path}")
print(f"Exists: {os.path.exists(logo_path)}")

img = Image.open(logo_path).convert("RGBA")
data = np.array(img)

# Replace white/near-white pixels with transparent
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
white_mask = (r > 240) & (g > 240) & (b > 240)
data[white_mask] = [255, 255, 255, 0]

# Smooth alpha falloff at edges for near-white pixels
light_mask = (r > 220) & (g > 220) & (b > 220) & ~white_mask
brightness = (r[light_mask].astype(float) + g[light_mask].astype(float) + b[light_mask].astype(float)) / 3.0
alpha_vals = ((255.0 - brightness) / (255.0 - 220.0) * 255.0).clip(0, 255).astype(np.uint8)
data[light_mask, 3] = alpha_vals

result = Image.fromarray(data)
result.save(logo_path)
print("Background removed successfully")
