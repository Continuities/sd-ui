<script type='ts'>

  let text = '';

  const change = (e:{ currentTarget: HTMLTextAreaElement }) => text = e.currentTarget.value;

  const submit = async (e:Event) => {
    e.preventDefault();
    const response = await fetch('./sd', {
      method: 'post',
      body: JSON.stringify({prompt:text})
    });
    console.log(await response.json());
  }

  const poll = async () => {
    const response = await fetch('/sd');
    console.log(await response.json());
  }

</script>

<form class='form' on:submit={submit}>
  <textarea class='input' placeholder='Enter your prompt' value={text} on:change={change}/>
  <button class='submit' type='submit'>Submit</button>
</form>
<button on:click={poll}>poll</button>

<style>
  .form {

  }
  .input {

  }
  .submit {

  }
</style>