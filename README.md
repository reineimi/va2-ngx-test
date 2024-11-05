# Practices
> All the practices below have already been implemented in the `/demo` template.
1. Put `defer` in **ALL** `<script>` tags. Use custom function `init()` for sequential dynamic loading.
2. Don't modify `mod/onload.lua` link formatting loop. It's based on Google's best practices.
3. Hide `<body>` before it has been loaded to prevent layout shift warnings.

<br>
<hr>

# Implementation tasks
> Tasks for developer(s) to integrate into `/demo` template.
- Separate `<head>` content for each page
