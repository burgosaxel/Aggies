const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

const projectRoot = path.resolve(__dirname, '..');
const outDir = path.join(projectRoot, 'assets', 'images', 'optimized');
const origDir = path.join(projectRoot, 'assets', 'images', 'originals');

async function ensureDir(dir){
  await fs.mkdir(dir, { recursive: true });
}

function fileNameFromUrl(url){
  try{
    const u = new URL(url);
    const base = path.basename(u.pathname);
    const safe = base.split('?')[0] || 'img';
    return safe.replace(/[^a-zA-Z0-9._-]/g, '_');
  }catch(e){
    const safe = url.replace(/[^a-zA-Z0-9._-]/g, '_');
    return safe.slice(0,60);
  }
}

async function download(url, dest){
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
  await fs.writeFile(dest, Buffer.from(response.data));
}

async function processImage(srcPath, baseName){
  // sizes and formats
  const sizes = [1600, 800, 400];
  for(const w of sizes){
    const jpgOut = path.join(outDir, `${baseName}-${w}.jpg`);
    const webpOut = path.join(outDir, `${baseName}-${w}.webp`);
    try{
      await sharp(srcPath).resize({ width: w, withoutEnlargement:true }).jpeg({quality:80}).toFile(jpgOut);
      await sharp(srcPath).resize({ width: w, withoutEnlargement:true }).webp({quality:75}).toFile(webpOut);
      console.log('Wrote', jpgOut, webpOut);
    }catch(err){
      console.error('Failed to process', srcPath, err.message);
    }
  }
}

async function gatherImageUrls(){
  const urls = new Set();
  // from data/flavors.json
  try{
    const flavorsPath = path.join(projectRoot, 'data', 'flavors.json');
    const raw = await fs.readFile(flavorsPath, 'utf8');
    const data = JSON.parse(raw);
    (data.flavors||[]).forEach(f=>{ if(f.image) urls.add(f.image); });
  }catch(e){ console.warn('No flavors.json found or parse error'); }

  // from index.html
  try{
    const indexPath = path.join(projectRoot, 'index.html');
    const html = await fs.readFile(indexPath, 'utf8');
    const re = /<img[^>]+src=["']([^"']+)["']/g;
    let m;
    while((m=re.exec(html))){ urls.add(m[1]); }
  }catch(e){ console.warn('No index.html found or parse error'); }

  return Array.from(urls).filter(u=>/^https?:\/\//i.test(u));
}

async function main(){
  console.log('Preparing image directories...');
  await ensureDir(outDir);
  await ensureDir(origDir);

  const urls = await gatherImageUrls();
  if(urls.length===0){
    console.log('No remote image URLs detected. Place originals in assets/images/originals/ and run again.');
    return;
  }

  console.log('Found', urls.length, 'images to download and optimize.');
  for(const url of urls){
    try{
      const name = fileNameFromUrl(url);
      const origPath = path.join(origDir, name);
      console.log('Downloading', url);
      await download(url, origPath);
      await processImage(origPath, name.replace(/\.[^.]+$/, ''));
    }catch(err){
      console.error('Failed for', url, err.message);
    }
  }

  console.log('Image optimization complete. Optimized images are in', outDir);
}

main().catch(err=>{ console.error(err); process.exit(1); });
