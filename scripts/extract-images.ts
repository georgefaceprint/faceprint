import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL as string });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

async function main() {
  const rootDir = process.cwd();
  const productsXmlPath = path.join(rootDir, 'products.xml');
  const mediaXmlPath = path.join(rootDir, 'media.xml');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
  });

  console.log('Parsing products.xml...');
  const productsXmlData = fs.readFileSync(productsXmlPath, 'utf8');
  const productsParsed = parser.parse(productsXmlData);
  const pItems = productsParsed.rss?.channel?.item || [];
  const wpProducts = Array.isArray(pItems) ? pItems : [pItems];

  const thumbnailIdToName: Record<string, string> = {};

  for (const item of wpProducts) {
    const type = item['wp:post_type'];
    const typeStr = typeof type === 'object' && type.__cdata ? type.__cdata : type;
    if (typeStr !== 'product') continue;

    const title = item.title;
    const name = typeof title === 'object' && title.__cdata ? title.__cdata : title;

    const postmeta = item['wp:postmeta'] || [];
    const metaArray = Array.isArray(postmeta) ? postmeta : [postmeta];

    let thumbnailId = '';

    for (const meta of metaArray) {
      const key = typeof meta['wp:meta_key'] === 'object' ? meta['wp:meta_key'].__cdata : meta['wp:meta_key'];
      let val = meta['wp:meta_value'];
      if (typeof val === 'object' && val !== null) val = val.__cdata;

      if (key === '_thumbnail_id' && val) thumbnailId = val.toString().trim();
    }

    if (name && thumbnailId) {
      thumbnailIdToName[thumbnailId] = String(name);
    }
  }

  console.log('Parsing media.xml...');
  const mediaXmlData = fs.readFileSync(mediaXmlPath, 'utf8');
  const mediaParsed = parser.parse(mediaXmlData);
  const mItems = mediaParsed.rss?.channel?.item || [];
  const wpMedia = Array.isArray(mItems) ? mItems : [mItems];

  const idToUrl: Record<string, string> = {};

  for (const item of wpMedia) {
    const type = item['wp:post_type'];
    const typeStr = typeof type === 'object' && type.__cdata ? type.__cdata : type;
    if (typeStr !== 'attachment') continue;

    const postId = item['wp:post_id'];
    const urlObj = item['wp:attachment_url'];
    const url = typeof urlObj === 'object' && urlObj.__cdata ? urlObj.__cdata : urlObj;

    if (postId && url) {
      idToUrl[postId.toString()] = url;
    }
  }

  console.log('Connecting to database...');

  let matchCount = 0;
  let updateCount = 0;

  for (const [thumbnailId, name] of Object.entries(thumbnailIdToName)) {
    const imageUrl = String(idToUrl[thumbnailId]);
    if (imageUrl && imageUrl !== 'undefined') {
      matchCount++;
      try {
        const updateRes = await prisma.product.updateMany({
          where: { name: name },
          data: { imageUrl: imageUrl }
        });
        updateCount += updateRes.count;
        if (updateCount % 10 === 0 && updateRes.count > 0) console.log(`Updated ${updateCount} products...`);
      } catch (e: any) {
        console.warn(`Failed to update DB for Name ${name}:`, e.message);
      }
    }
  }

  console.log(`\nFinished! Matched ${matchCount} images. Successfully updated ${updateCount} records in the database.`);
}

main().catch(console.error);
