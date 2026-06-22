import xml.etree.ElementTree as ET
import os

tree = ET.parse('pages.xml')
root = tree.getroot()

# The namespace map
namespaces = {
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'wp': 'http://wordpress.org/export/1.2/'
}

pages_to_extract = ['FAQs', 'About Us', 'Home Page | FacePrint 2019', 'Contact']
os.makedirs('scratch', exist_ok=True)

for item in root.findall('.//item'):
    title = item.find('title').text
    if title in pages_to_extract:
        content = item.find('content:encoded', namespaces)
        if content is not None and content.text:
            filename = f"scratch/{title.replace(' | ', '_').replace(' ', '_')}.txt"
            with open(filename, 'w') as f:
                f.write(content.text)
            print(f"Extracted {title}")
