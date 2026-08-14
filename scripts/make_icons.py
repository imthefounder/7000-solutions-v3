import struct, zlib, os

def make_png(path, size, rgb):
    def chunk(typ, data):
        c = struct.pack('>I', len(data)) + typ + data
        c += struct.pack('>I', zlib.crc32(typ + data) & 0xffffffff)
        return c
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
    raw = b''
    row = b'\x00' + bytes(rgb) * size
    for _ in range(size):
        raw += row
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(png)
    print('wrote', path)

# teal primary #0f766e
make_png('public/icons/icon-192.png', 192, (15, 118, 110))
make_png('public/icons/icon-512.png', 512, (15, 118, 110))
