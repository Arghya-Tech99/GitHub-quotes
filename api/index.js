// api/index.js
const themes = {
  radical: {
    bg: '#141321',
    border: '#FE428E',
    text: '#A9FEF7',
    author: '#F8D847'
  },
  dark: {
    bg: '#0D1117',
    border: '#58A6FF',
    text: '#C9D1D9',
    author: '#58A6FF'
  },
  dracula: {
    bg: '#282A36',
    border: '#FF79C6',
    text: '#F8F8F2',
    author: '#8BE9FD'
  },
  tokyonight: {
    bg: '#1A1B26',
    border: '#7AA2F7',
    text: '#A9B1D6',
    author: '#BB9AF7'
  },
  monokai: {
    bg: '#272822',
    border: '#E6DB74',
    text: '#F8F8F2',
    author: '#A6E22E'
  }
};

const fonts = {
  segoe: "'Segoe UI', Ubuntu, sans-serif",
  roboto: "'Roboto', sans-serif",
  ubuntu: "'Ubuntu', sans-serif",
  raleway: "'Raleway', sans-serif",
  jetbrains: "'JetBrains Mono', monospace",
  cascadia: "'Cascadia Code', monospace",
  fira: "'Fira Code', monospace"
};

// Add your custom quotes here
const quotes = [
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
  { text: "In order to be irreplaceable, one must always be different.", author: "Coco Chanel" },
  { text: "Java is to JavaScript what car is to Carpet.", author: "Chris Heilmann" },
  { text: "Knowledge is power.", author: "Francis Bacon" },
  { text: "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.", author: "Dan Salomon" },
  { text: "Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away.", author: "Antoine de Saint-Exupery" },
  { text: "Code never lies, comments sometimes do.", author: "Ron Jeffries" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" }
];

function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = currentLine.length + word.length + 1;
    
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function generateSVG(quote, theme, font, type) {
  const themeColors = themes[theme] || themes.radical;
  const fontFamily = fonts[font] || fonts.segoe;
  
  const lines = wrapText(quote.text, type === 'horizontal' ? 80 : 50);
  const lineHeight = 24;
  const quoteHeight = lines.length * lineHeight;
  const authorHeight = 30;
  const padding = 30;
  
  const width = type === 'horizontal' ? 800 : 500;
  const height = quoteHeight + authorHeight + (padding * 2) + 20;

  let yPosition = padding + 20;
  const textElements = lines.map((line, i) => {
    const y = yPosition + (i * lineHeight);
    return `<text x="50%" y="${y}" text-anchor="middle" fill="${themeColors.text}" font-size="18" font-family="${fontFamily}">${escapeXml(line)}</text>`;
  }).join('\n    ');

  const authorY = yPosition + (lines.length * lineHeight) + 20;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&amp;family=Ubuntu:wght@400;700&amp;family=Raleway:wght@400;700&amp;family=JetBrains+Mono:wght@400;700&amp;family=Fira+Code:wght@400;700&amp;display=swap');
    </style>
  </defs>
  <rect width="${width}" height="${height}" fill="${themeColors.bg}" rx="10"/>
  <rect x="5" y="5" width="${width - 10}" height="${height - 10}" fill="none" stroke="${themeColors.border}" stroke-width="2" rx="8"/>
  
  <g>
    ${textElements}
    <text x="50%" y="${authorY}" text-anchor="middle" fill="${themeColors.author}" font-size="16" font-family="${fontFamily}" font-style="italic">— ${escapeXml(quote.author)}</text>
  </g>
</svg>`;
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

export default function handler(req, res) {
  const { theme = 'radical', font = 'segoe', type = 'horizontal' } = req.query;
  
  // Get random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  // Generate SVG
  const svg = generateSVG(randomQuote, theme, font, type);
  
  // Set headers
  res.setHeader('Content-Type', 'image/svg+xml');
  // Fetch a new quote every 3 hours
  res.setHeader('Cache-Control', 'public, max-age=10800, must-revalidate');
  
  // Send response
  res.status(200).send(svg);
}

/* 
=== DEPLOYMENT INSTRUCTIONS ===

1. Create a vercel.json file in your project root:
{
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}

2. Create a package.json file in your project root:
{
  "name": "github-quotes-api",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": "18.x"
  }
}

3. Project Structure:
your-project/
├── api/
│   └── index.js (this file)
├── package.json
└── vercel.json

4. Deploy to Vercel:
   - Install Vercel CLI: npm i -g vercel
   - Run: vercel
   - Follow the prompts
   - Or push to GitHub and import in Vercel dashboard

5. Usage in GitHub README:
![Quote](https://your-app.vercel.app/api?theme=radical&font=jetbrains&type=horizontal)

Available parameters:
- theme: radical, dark, dracula, tokyonight, monokai
- font: segoe, roboto, ubuntu, raleway, jetbrains, cascadia, fira
- type: horizontal, vertical
*/