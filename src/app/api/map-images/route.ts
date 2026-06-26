import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('Starting image mapping...');

    const xmlPath = path.join(process.cwd(), 'media.xml');
    if (!fs.existsSync(xmlPath)) {
      return NextResponse.json({ error: 'media.xml not found' }, { status: 404 });
    }

    const rawXml = fs.readFileSync(xmlPath, 'utf8');
    
    // Extract all wp:attachment_url tags
    const urlMatches = rawXml.match(/<wp:attachment_url><!\[CDATA\[(.*?)\]\]><\/wp:attachment_url>/g);
    if (!urlMatches) {
      return NextResponse.json({ error: 'No attachment URLs found in media.xml' }, { status: 400 });
    }

    // Clean and filter to only images
    const imageUrls = urlMatches
      .map(tag => tag.replace('<wp:attachment_url><![CDATA[', '').replace(']]></wp:attachment_url>', ''))
      .filter(url => {
        const lower = url.toLowerCase();
        return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif');
      });

    console.log(`Found ${imageUrls.length} image URLs in media.xml`);

    // Fetch all products
    const products = await prisma.product.findMany();
    console.log(`Mapping to ${products.length} products`);

    let mappedCount = 0;

    // A simple list of common filler words to ignore in matching
    const ignoreWords = new Set(['the', 'with', 'for', 'and', 'or', 'a', 'an', 'of', 'in', 'copy']);

    // Fuzzy Matcher
    for (const product of products) {
      // Tokenize product name: "TELESCOPIC 5M" -> ["telescopic", "5m"]
      const productTokens = product.name.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2 && !ignoreWords.has(t));
      
      let bestUrl = null;
      let highestScore = 0;

      for (const url of imageUrls) {
        const filename = url.split('/').pop()?.toLowerCase() || '';
        // Tokenize filename: "telescopic-banner-e1532.png" -> ["telescopic", "banner", "e1532", "png"]
        const filenameTokens = filename.split(/[^a-z0-9]+/).filter(t => t.length > 2 && !ignoreWords.has(t));

        let score = 0;
        for (const pt of productTokens) {
          if (filenameTokens.includes(pt)) {
            score += 2; // Exact word match
          } else if (filenameTokens.some(ft => ft.includes(pt) || pt.includes(ft))) {
            score += 1; // Partial word match (e.g. 'gazibo' vs 'gazebo' if one contains another - wait, contains doesn't catch typos, but catches 'pullup' in 'pullup-banner')
          }
        }

        if (score > highestScore) {
          highestScore = score;
          bestUrl = url;
        }
      }

      // If we found a decent match (score > 1 means at least one partial or one exact match)
      if (bestUrl && highestScore > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: { imageUrl: bestUrl }
        });
        mappedCount++;
        console.log(`Mapped [${product.name}] -> ${bestUrl} (Score: ${highestScore})`);
      }
    }

    return NextResponse.json({
      message: 'Image mapping complete!',
      totalProducts: products.length,
      mappedImages: mappedCount
    });

  } catch (e: any) {
    console.error('Image mapping error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
