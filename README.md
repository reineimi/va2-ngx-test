# Practices
> All the practices below have already been implemented in the `/demo` template.
1. Put `defer` in **ALL** `<script>` tags. Use custom function `init()` for sequential dynamic loading.
2. Asynchronously embed `<link>` tags with:
```html
<link rel="preload" href="..." as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="..."></noscript>
```
3. Hide `<body>` or body content before it has been loaded to prevent layout shift warnings.

<br>
<hr>

# Implementation tasks
> Tasks for developer(s) to integrate into `/demo` template.
- 

<br>
<hr>

# Performance (Nov 6, 2024)
## Page hop/reload transition animation

Dark
<video src='https://github.com/user-attachments/assets/8cecf4cc-5376-4c12-bbea-3312bd15160b' width=300/>

#

Light
<video src='https://github.com/user-attachments/assets/fc9b68ad-2cc5-48af-b98f-7aeedbceee2b' width=300/>

#

## Benchmarks (Lighthouse)
> With all scripts, styles and fonts loaded, including Twemoji and Anicons

### CPU: 2.665GHz, RAM: 4GB

Desktop
![desktop](https://github.com/user-attachments/assets/bcadf448-c97e-4661-9d78-d6f54910fcae)

Mobile
![mobile](https://github.com/user-attachments/assets/8251b7fe-afee-4b84-adaf-67309d628c39)

### CPU: 3.400GHz, RAM: 8GB

Desktop
![desktop](https://github.com/user-attachments/assets/2036976f-3ca3-4314-9960-523f00a33bdc)

Mobile
![mobile](https://github.com/user-attachments/assets/b94fcd03-d604-4126-918d-6001c94e57f7)

