import { exec } from 'child_process';
import { rm, access, readdir, readFile } from 'fs/promises';
import path from 'path';

const SD_PATH = import.meta.env.VITE_SD_PATH;
const TXT2IMG = import.meta.env.VITE_TXT2IMG_PATH;
const OUTDIR = import.meta.env.VITE_OUTDIR;

let busy = false;

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  if (busy) {
    return new Response(JSON.stringify({ busy }));
  }
  const response = new Response(JSON.stringify({ 
    images: await getImages() 
  }));
  return response;
}

/** @type {import('./$types').Action} */
export async function POST( { request }) {
  if (busy) {
    return new Response(JSON.stringify({error:'SD is busy'}), {status: 400});
  }
  const data = await request.json();
  console.log('POST', data);
  busy = true;
  await clear();
  txt2img(data.prompt).then(() => {
    busy = false;
  });
  return new Response(JSON.stringify({started:true}));
}

const clear = async () => {
  try {
    await access(OUTDIR);
    rm(OUTDIR, { recursive: true });
  }
  catch {}
};
const getImages = async () => {
  try {
    const folder = path.join(OUTDIR, 'samples');
    await access(folder);
    const files = await readdir(folder);
    return Promise.all(files.map((file) => readFile(path.join(folder, file), { encoding: 'base64' })));
  }
  catch (e) {
    console.log('ERROR', e);
    return null;  
  }
};

const txt2img = (prompt:string) => new Promise((resolve, reject) => {
  const child = exec(`cd ${SD_PATH}; python ${TXT2IMG} --prompt "${prompt}" --plms --outdir ${OUTDIR}`, (error, stdout, stderr) => {
    if (error) {
      console.log(error.stack);
      console.log('Error code: ' + error.code);
      console.log('Signal received: ' + error.signal);
    }
    console.log('Child Process STDOUT: ' + stdout);
    console.log('Child Process STDERR: ' + stderr);
  });
  // child.stdout.pipe(process.stdout)
  child.on('exit', (code) => {
    console.log('exit', code);
    resolve()
  });
});