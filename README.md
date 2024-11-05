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

# Performance (Nov 6, 2024)
### Page hop/reload transition animation
Dark
![theme_dark](https://github.com/user-attachments/assets/48c75565-e10b-42d3-82fb-85c10c13f35f)

Light
![theme_light](https://github.com/user-attachments/assets/d8303860-5144-4bb4-9777-b0a275cdd3b0)

#

### Benchmarks (Lighthouse) - CPU: 2.665GHz, RAM: 4GB
Desktop
![desktop](https://github.com/user-attachments/assets/bcadf448-c97e-4661-9d78-d6f54910fcae)

Mobile
![mobile](https://github.com/user-attachments/assets/8251b7fe-afee-4b84-adaf-67309d628c39)
