<script type='ts'>

  import { Circle2 } from 'svelte-loading-spinners';

  const POLL_DELAY = import.meta.env.VITE_POLL_DELAY;

  let text = '';
  let working = false;
  let image = null;

  const change = (e:{ currentTarget: HTMLInputElement }) => text = e.currentTarget.value;

  const submit = async (e:Event) => {
    e.preventDefault();
    const response = await fetch('./sd', {
      method: 'post',
      body: JSON.stringify({prompt:text})
    });
    if (response.ok) {
      setTimeout(poll, POLL_DELAY);
      image = null;
      working = true;
    }
  }

  const poll = async () => {
    const response = await fetch('/sd');
    const data = await response.json();
    if (data.busy) {
      setTimeout(poll, POLL_DELAY);
    }
    if (data.img) {
      image = data.img;
      working = false;
    }
  }

</script>

<form class='form' on:submit={submit}>
  <input type='text' class='input' placeholder='Enter your prompt' value={text} on:change={change} disabled={working} />
  <button class='submit' type='submit' disabled={working}>Generate</button>
</form>

<div class='results'>
{#if working}
  <Circle2 size='200' unit='px' />
{:else if image}
  <img class='image' src='data:image/png;base64,{image}' />
{/if}
</div>

<style>
  .form {
    display: flex;
    gap: 10px;
  }
  .input {
    width: 100%;
    font-size: 1.5rem;
    padding: 10px 20px;
  }
  .buttons {
    padding-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  .submit {
    font-size: 1.5rem;
    padding: 10px 20px;
  }
  .results {
    margin-top: 40px;
    min-height: 1024px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>