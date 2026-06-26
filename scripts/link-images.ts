import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL as string;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

async function main() {
  const mediaPath = path.join(process.cwd(), 'media.xml');
  const productsPath = path.join(process.cwd(), 'products.xml');
  
  if (!fs.existsSync(mediaPath) || !fs.existsSync(productsPath)) {
    console.error("Missing media.xml or products.xml");
    return;
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
  });

  console.log("Parsing media.xml...");
  const mediaData = fs.readFileSync(mediaPath, 'utf8');
  const mediaParsed = parser.parse(mediaData);
  const mediaItems = mediaParsed.rss?.channel?.item || [];
  const mediaArray = Array.isArray(mediaItems) ? mediaItems : [mediaItems];

  const attachmentMap = new Map<string, string>();
  for (const item of mediaArray) {
    const postType = typeof item['wp:post_type'] === 'object' && item['wp:post_type'].__cdata ? item['wp:post_type'].__cdata : item['wp:post_type'];
    if (postType === 'attachment') {
      const postId = item['wp:post_id']?.toString();
      const urlRaw = item['wp:attachment_url'];
      const url = typeof urlRaw === 'object' && urlRaw.__cdata ? urlRaw.__cdata : urlRaw;
      if (postId && url) {
        attachmentMap.set(postId, url);
      }
    }
  }
  
  console.log(`Loaded ${attachmentMap.size} attachments.`);

  console.log("Parsing products.xml...");
  const productsData = fs.readFileSync(productsPath, 'utf8');
  const productsParsed = parser.parse(productsData);
  const productsItems = productsParsed.rss?.channel?.item || [];
  const productsArray = Array.isArray(productsItems) ? productsItems : [productsItems];

  const wpProducts = productsArray.filter((item: any) => {
    const type = item['wp:post_type'];
    const typeStr = typeof type === 'object' && type.__cdata ? type.__cdata : type;
    return typeStr === 'product';
  });

  let updateCount = 0;

  for (const wpProduct of wpProducts) {
    const postmeta = wpProduct['wp:postmeta'] || [];
    const metaArray = Array.isArray(postmeta) ? postmeta : [postmeta];
    
    const title = wpProduct.title;
    const name = typeof title === 'object' && title.__cdata ? title.__cdata : title;
    let thumbnailId = '';

    for (const meta of metaArray) {
      let key = meta['wp:meta_key'];
      if (typeof key === 'object' && key !== null) key = key.__cdata;
      
      let valueCdata = meta['wp:meta_value'];
      if (typeof valueCdata === 'object' && valueCdata !== null) {
        valueCdata = valueCdata.__cdata;
      }
      const value = valueCdata !== undefined ? valueCdata : meta['wp:meta_value'];
      
      if (key === '_thumbnail_id' && value) {
        thumbnailId = value.toString().trim();
      }
    }

    if (name && thumbnailId) {
      const imageUrl = attachmentMap.get(thumbnailId);
      if (!imageUrl) {
        console.log(`No image URL found for thumbnailId ${thumbnailId}`);
      } else {
        // Fix up URL for local testing or proper domain if needed
        const cleanUrl = imageUrl.replace('http://faceprintthebannerfactoryhomeof24hrbanners.WordPress.com', 'https://faceprint.co.za');
        
        try {
          const productsToUpdate = await prisma.product.findMany({
            where: { name: String(name) }
          });
          
          if (productsToUpdate.length === 0) {
            console.log(`Product not found in DB for name: ${name}`);
          }
          
          for (const p of productsToUpdate) {
            await prisma.product.update({
              where: { id: p.id },
              data: { imageUrl: cleanUrl }
            });
            updateCount++;
          }
        } catch (e: any) {
          // Ignore
        }
      }
    }
  }

  console.log(`Updated ${updateCount} products with image URLs.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
