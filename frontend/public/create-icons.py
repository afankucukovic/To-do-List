#!/usr/bin/env python3
import base64

# Create SVG icons as data URLs
svg_192 = '''<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6"/>
      <stop offset="100%" style="stop-color:#4f46e5"/>
    </linearGradient>
  </defs>
  <rect width="192" height="192" rx="32" fill="url(#grad)"/>
  <g transform="translate(96,96)" stroke="white" stroke-width="8" fill="none">
    <circle r="50" opacity="0.2"/>
    <path d="M-20,5 L-5,20 L25,-25" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>'''

svg_512 = '''<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6"/>
      <stop offset="100%" style="stop-color:#4f46e5"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="85" fill="url(#grad)"/>
  <g transform="translate(256,256)" stroke="white" stroke-width="20" fill="none">
    <circle r="120" opacity="0.2"/>
    <path d="M-50,10 L-15,50 L70,-70" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>'''

# Write to files
with open('icon-192x192.png', 'w') as f:
    f.write(f"data:image/svg+xml;base64,{base64.b64encode(svg_192.encode()).decode()}")

with open('icon-512x512.png', 'w') as f:
    f.write(f"data:image/svg+xml;base64,{base64.b64encode(svg_512.encode()).decode()}")

print("SVG icons created successfully!")