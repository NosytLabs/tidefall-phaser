import os, struct

def get_png_size(path):
    with open(path, 'rb') as f:
        f.read(16)
        f.read(4)
        w = struct.unpack('>I', f.read(4))[0]
        f.read(4)
        h = struct.unpack('>I', f.read(4))[0]
        return w, h

base = 'C:/Users/Tyson/clawd/tidefall-phaser/assets'
for root, dirs, files in os.walk(base):
    for f in files:
        full = os.path.join(root, f)
        if f.endswith('.png'):
            w, h = get_png_size(full)
            rel = full.replace('C:/Users/Tyson/clawd/tidefall-phaser/', '')
            print(f'{rel}: {w}x{h}')
