from PIL import Image
import numpy as np

img = Image.open("/vercel/share/v0-project/public/images/logo.png").convert("RGBA")
data = np.array(img)

# Replace white/near-white pixels with transparent
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
white_mask = (r > 240) & (g > 240) & (b > 240)
data[white_mask] = [255, 255, 255, 0]

# Also handle near-white with smooth alpha falloff at edges
light_mask = (r > 220) & (g > 220) & (b > 220) & ~white_mask
brightness = (r[light_mask].astype(float) + g[light_mask].astype(float) + b[light_mask].astype(float)) / 3.0
alpha_vals = ((255.0 - brightness) / (255.0 - 220.0) * 255.0).clip(0, 255).astype(np.uint8)
data[light_mask, 3] = alpha_vals

result = Image.fromarray(data)
result.save("/vercel/share/v0-project/public/images/logo.png")
print("Background removed successfully")
