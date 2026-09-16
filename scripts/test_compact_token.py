import base64
import json
import zlib

CIPHER_KEY = "KinotiX_Token_Cipher_Key_2026_v1"

HOST_DICT = [
    ("https://i.pinimg.com/originals/", "~p1~"),
    ("https://i.pinimg.com/736x/", "~p2~"),
    ("https://i.pinimg.com/", "~p0~"),
    ("https://w.wallhaven.cc/full/", "~w1~"),
    ("https://th.wallhaven.cc/small/", "~w2~"),
    ("https://raw.githubusercontent.com/venomleo2o1-byte/phone-wallpaper/master/", "~gh1~"),
    ("https://raw.githubusercontent.com/venomleo2o1-byte/live-wallpaper/main/", "~gh2~"),
    ("https://cdn.jsdelivr.net/gh/venomleo2o1-byte/phone-wallpaper@master/", "~js1~"),
    ("https://cdn.jsdelivr.net/gh/venomleo2o1-byte/live-wallpaper@main/", "~js2~"),
    ("https://images.unsplash.com/", "~un~"),
    ("https://images.pexels.com/photos/", "~px~"),
    ("https://cdn.animepixels.net/", "~ap~"),
]

def encode_token(url, title="KinotiX Wallpaper", kind="static", author=""):
    short_url = url
    for orig, rep in HOST_DICT:
        if short_url.startswith(orig):
            short_url = rep + short_url[len(orig):]
            break
    
    # Compact tuple: [short_url, title, kind, author]
    payload = json.dumps([short_url, title, kind, author], separators=(',', ':'))
    raw_bytes = payload.encode('utf-8')
    
    # Simple XOR cipher with index scrambling
    key_bytes = CIPHER_KEY.encode('utf-8')
    cipher = bytearray(len(raw_bytes))
    for i in range(len(raw_bytes)):
        k = key_bytes[i % len(key_bytes)]
        b = raw_bytes[i]
        cipher[i] = (b ^ k ^ ((i * 7 + 13) & 0xFF)) & 0xFF
        
    b64 = base64.urlsafe_b64encode(cipher).decode('utf-8').rstrip('=')
    return "KX_e" + b64

def decode_token(token):
    if not token.startswith("KX_e"):
        return None
    b64 = token[4:]
    while len(b64) % 4:
        b64 += '='
    cipher = base64.urlsafe_b64decode(b64)
    key_bytes = CIPHER_KEY.encode('utf-8')
    raw_bytes = bytearray(len(cipher))
    for i in range(len(cipher)):
        k = key_bytes[i % len(key_bytes)]
        b = cipher[i]
        raw_bytes[i] = (b ^ ((i * 7 + 13) & 0xFF) ^ k) & 0xFF
        
    data = json.loads(raw_bytes.decode('utf-8'))
    short_url, title, kind, author = data[0], data[1], data[2], data[3]
    
    full_url = short_url
    for orig, rep in HOST_DICT:
        if full_url.startswith(rep):
            full_url = orig + full_url[len(rep):]
            break
            
    return {
        "url": full_url,
        "title": title,
        "kind": kind,
        "author": author
    }

# Test with Pinterest URL
test_pinterest = "https://i.pinimg.com/originals/ab/cd/ef/abcdef1234567890.jpg"
token = encode_token(test_pinterest, "Aesthetic Neon Altar", "static", "Pinterest")
print("Pinterest Token:", token)
print("Token Length:", len(token))
print("Decoded:", decode_token(token))
assert decode_token(token)["url"] == test_pinterest

# Test with Wallhaven URL
test_wh = "https://w.wallhaven.cc/full/1k/wallhaven-1k2m3n.jpg"
token_wh = encode_token(test_wh, "Cyberpunk City", "4k", "Wallhaven")
print("\nWallhaven Token:", token_wh)
print("Token Length:", len(token_wh))
print("Decoded:", decode_token(token_wh))
assert decode_token(token_wh)["url"] == test_wh
