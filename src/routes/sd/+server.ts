import { exec } from 'child_process';

const TXT2IMG = import.meta.env.VITE_TXT2IMG_PATH;

let busy = false;
let lastImage: string | null = null;

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  if (busy) {
    return new Response(JSON.stringify({ busy }));
  }
  const response = new Response(JSON.stringify({img: lastImage}));
  lastImage = null;
  return response;
}

/** @type {import('./$types').Action} */
export async function POST( {request }) {
  if (busy) {
    return new Response(JSON.stringify({error:'SD is busy'}), {status: 400});
  }
  const data = await request.json();
  console.log('POST', data);
  busy = true;
  txt2img(data.prompt).then((img) => {
    console.log('complete');
    busy = false;
    lastImage = img;
  });
  return new Response(JSON.stringify({started:true}));
}

const txt2img = (prompt:string) => new Promise((resolve, reject) => {
  const child = exec(`python ${TXT2IMG} --prompt "${prompt}" --plms`);
  child.stdout.pipe(process.stdout)
  child.on('exit', () => resolve('PLACEHOLDER_IMG_PATH'));
});