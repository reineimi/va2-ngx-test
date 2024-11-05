local head = {[[
<meta charset='utf-8'>
<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0, viewport-fit=cover'>
<meta name='keywords' content='reineimi, va2'>
<meta name='robots' content='index, follow, archive, noimageindex'>
<title>Demo</title>
<meta name='description' content='Sample_text'>

<style>
html { font-size: 12px; background: #777 }
body { animation: slidein 0.5s }
@keyframes slidein { 0% { opacity: 0; transform: translateX(-100vw) } }
</style>

<script src='/request.js' defer></script>
<script src='/va2.js' async defer></script>

<!-- Google -->
<link rel='preconnect' href='https://fonts.googleapis.com'>
<link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>
<meta name='google-site-verification' content=''>

<!-- Twemoji -->
<!-- <script src='https://twemoji.maxcdn.com/v/latest/twemoji.min.js' crossorigin='anonymous' defer></script> -->

<!-- Anicons - https://typogram.github.io/Anicons -->
<!-- link href='https://res.cloudinary.com/dr6lvwubh/raw/upload/v1581441981/Anicons/anicons-regular.css' rel='stylesheet' -->
]],

}

return table.concat(head, '\n')
