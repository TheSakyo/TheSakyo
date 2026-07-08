// ============================================================================
// Imports
// ============================================================================

// Loads Node.js file APIs with promises.
import fs from 'node:fs/promises';

// Loads path utilities to build cross-platform paths.
import path from 'node:path';

// Loads all available Simple Icons.
import * as simpleIcons from 'simple-icons';

// ============================================================================
// Output paths
// ============================================================================

// Gets the folder where the command is executed.
const ROOT = process.cwd();

// Points to the local folder where SVG badges are generated.
const OUT_DIR = path.join(ROOT, 'assets', 'badges');

// ============================================================================
// Shields.io visual constants
// ============================================================================

// Defines the main font used by the badges.
const FONT = 'Verdana,Geneva,DejaVu Sans,sans-serif';

// Sets the exact badge height in pixels.
const HEIGHT = 20;

// Sets the flat-square border radius.
const RADIUS = 3;

// Sets the text size.
const FONT_SIZE = 11;

// Sets the icon size.
const ICON_SIZE = 10;

// Places the icon 5 px from the left edge.
const ICON_X = 5;

// Vertically centers the icon inside a 20 px badge.
const ICON_Y = 5;

// Places the text after the icon and its spacing.
const TEXT_X_WITH_ICON = 20;

// Places the text when no icon is present.
const TEXT_X_NO_ICON = 6;

// Adds the final right padding.
const RIGHT_PADDING = 5;

// ============================================================================
// Badges to generate
// ============================================================================

/*
 * Each object describes the badge label, color, and icon.
 */
const badges = [

  // JavaScript badge with a yellow icon, like Shields.io without forced logoColor.
  { label: 'JavaScript', color: '#323330', icon: 'siJavascript', iconColor: '#F7DF1E' },

  // TypeScript badge with the matching Simple Icons icon.
  { label: 'TypeScript', color: '#3178C6', icon: 'siTypescript' },

  // Python badge with the official Shields.io color.
  { label: 'Python', color: '#3776AB', icon: 'siPython' },

  // PHP badge with the official color.
  { label: 'PHP', color: '#777BB4', icon: 'siPhp' },

  // Java badge based on the OpenJDK icon.
  { label: 'Java', color: '#ED8B00', icon: 'siOpenjdk' },

  // C# badge based on the .NET icon.
  { label: 'C#', color: '#239120', icon: 'siDotnet' },

  // Go badge with the official Go icon.
  { label: 'Go', color: '#00ADD8', icon: 'siGo' },

  // Node.js badge using the nodedotjs Simple Icons id.
  { label: 'Node.js', color: '#339933', icon: 'siNodedotjs' },

  // Flask badge in black.
  { label: 'Flask', color: '#000000', icon: 'siFlask' },

  // Spring Boot badge with the springboot icon.
  { label: 'Spring Boot', color: '#6DB33F', icon: 'siSpringboot' },

  // Symfony badge in black.
  { label: 'Symfony', color: '#000000', icon: 'siSymfony' },

  // RESTful APIs badge with the Swagger icon.
  { label: 'RESTful APIs', color: '#16A34A', icon: 'siSwagger' },

  // Docker badge with the Docker icon.
  { label: 'Docker', color: '#2496ED', icon: 'siDocker' },

  // Linux badge with a black icon, matching the README Shields.io badge.
  { label: 'Linux', color: '#FCC624', icon: 'siLinux', iconColor: '#000000' },

  // Traefik badge with the Traefik Proxy icon.
  { label: 'Traefik', color: '#24A1C1', icon: 'siTraefikproxy' },

  // Cloudflare badge with the Cloudflare icon.
  { label: 'Cloudflare', color: '#F38020', icon: 'siCloudflare' },

  // MySQL badge with the MySQL icon.
  { label: 'MySQL', color: '#4479A1', icon: 'siMysql' },

  // NoSQL badge with the MongoDB icon.
  { label: 'NoSQL', color: '#47A248', icon: 'siMongodb' },

  // PostgreSQL badge with the PostgreSQL icon.
  { label: 'PostgreSQL', color: '#4169E1', icon: 'siPostgresql' },

  // SQLite badge with the SQLite icon.
  { label: 'SQLite', color: '#003B57', icon: 'siSqlite' },

  // IndexedDB badge with a custom SVG instead of Simple Icons.
  { label: 'IndexedDB', color: '#007EC6', customIcon: indexedDbIcon },
];

// ============================================================================
// Sizing and formatting
// ============================================================================

/*
 * Overrides labels whose visual width differs from a simple character ratio.
 */
const TEXT_WIDTHS = Object.freeze({
  JavaScript: 59,      // <- Calibrated text width for the JavaScript badge
  TypeScript: 64,      // <- Calibrated text width for the TypeScript badge
  Python: 42,          // <- Calibrated text width for the Python badge
  PHP: 24,             // <- Calibrated text width for the PHP badge
  Java: 28,            // <- Calibrated text width for the Java badge
  'C#': 16,            // <- Calibrated text width for the C# badge
  Go: 18,              // <- Calibrated text width for the Go badge
  'Node.js': 45,       // <- Calibrated text width for the Node.js badge
  Flask: 31,           // <- Calibrated text width for the Flask badge
  'Spring Boot': 66,   // <- Calibrated text width for the Spring Boot badge
  Symfony: 51,         // <- Calibrated text width for the Symfony badge
  'RESTful APIs': 70,  // <- Calibrated text width for the RESTful APIs badge
  Docker: 42,          // <- Calibrated text width for the Docker badge
  Linux: 34,           // <- Calibrated text width for the Linux badge
  Traefik: 42,         // <- Calibrated text width for the Traefik badge
  Cloudflare: 64,      // <- Calibrated text width for the Cloudflare badge
  MySQL: 38,           // <- Calibrated text width for the MySQL badge
  NoSQL: 41,           // <- Calibrated text width for the NoSQL badge
  PostgreSQL: 70,      // <- Calibrated text width for the PostgreSQL badge
  SQLite: 38,          // <- Calibrated text width for the SQLite badge
  IndexedDB: 60        // <- Calibrated text width for the IndexedDB badge
});

/**
 * Estimates the rendered text width used to compute the badge width.
 *
 * @param {string} text - Badge label to measure.
 * @returns {number} Estimated text width in pixels.
 */
function textWidth(text) {

  // Uses a calibrated width when the label has one.
  return TEXT_WIDTHS[text] ?? Math.ceil([...text].length * 6);
}

/**
 * Converts a badge label into a filesystem-safe SVG file slug.
 *
 * @param {string} label - Badge label.
 * @returns {string} Lowercase slug used as the SVG file name.
 */
function slug(label) {

  /*
   * Starts the transformation chain from the label.
   */
  return label

    // Converts everything to lowercase.
    .toLowerCase()

    // Replaces the C# hash with a readable word.
    .replace(/#/g, 'sharp')

    // Replaces dots with dashes.
    .replace(/\./g, '-')

    // Replaces plus signs with text.
    .replace(/\+/g, 'plus')

    // Replaces every non-alphanumeric separator with a dash.
    .replace(/[^a-z0-9]+/g, '-')

    // Removes leading and trailing dashes.
    .replace(/^-|-$/g, '');
}

/**
 * Escapes a value before injecting it into SVG markup.
 *
 * @param {unknown} value - Value to escape.
 * @returns {string} SVG-safe string.
 */
function esc(value) {

  /*
   * Forces the value to a string before replacements.
   */
  return String(value)

    // Escapes ampersands.
    .replace(/&/g, '&amp;')

    // Escapes opening angle brackets.
    .replace(/</g, '&lt;')

    // Escapes closing angle brackets.
    .replace(/>/g, '&gt;')

    // Escapes double quotes.
    .replace(/"/g, '&quot;');
}

// ============================================================================
// Icons
// ============================================================================

/**
 * Builds the SVG path for a Simple Icons logo.
 *
 * @param {string} iconKey - Export name from the simple-icons package.
 * @param {string} [color='#fff'] - Icon fill color.
 * @returns {string} SVG path markup, or an empty string when missing.
 */
function simpleIconSvg(iconKey, color = '#fff') {

  // Reads the icon from the object exported by simple-icons.
  const icon = simpleIcons[iconKey];

  // Returns an empty string when the icon does not exist.
  if(!icon) return '';

  /*
   * Returns the SVG path inside the same 10x10 icon box as IndexedDB.
   */
  return `<svg x="${ICON_X}" y="${ICON_Y}" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="${color}" d="${icon.path}"/>
    </svg>`;
}

/**
 * Builds the custom IndexedDB icon used when no Simple Icons logo is available.
 *
 * @param {string} [color='#fff'] - Icon stroke and fill color.
 * @returns {string} SVG group markup for the IndexedDB icon.
 */
function indexedDbIcon(color = '#fff') {

  /*
   * Returns a compact SVG group representing a window and a database.
   */
  return `<g transform="translate(5 5)" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
        <rect x="0" y="0" width="10" height="10" rx="1.2"/>
        <line x1="0" y1="2.6" x2="10" y2="2.6"/>
        <circle cx="1.6" cy="1.3" r="0.3" fill="${color}" stroke="none"/>
        <circle cx="3.1" cy="1.3" r="0.3" fill="${color}" stroke="none"/>
        <circle cx="4.6" cy="1.3" r="0.3" fill="${color}" stroke="none"/>
        <ellipse cx="5" cy="6.1" rx="2.1" ry="0.65" fill="${color}" stroke="none"/>
        <path d="M2.9 6.1v2c0 .4.9.7 2.1.7s2.1-.3 2.1-.7v-2" fill="${color}" stroke="none"/>
    </g>`;
}

// ============================================================================
// Full SVG rendering
// ============================================================================

/**
 * Renders one complete badge SVG from its configuration.
 *
 * @param {object} badge - Badge configuration.
 * @param {string} badge.label - Text displayed in the badge.
 * @param {string} badge.color - Badge background color.
 * @param {string} [badge.icon] - Optional Simple Icons export name.
 * @param {string} [badge.iconColor] - Optional icon color override.
 * @param {string} [badge.textColor] - Optional text color override.
 * @param {(color?: string) => string} [badge.customIcon] - Optional custom icon renderer.
 * @returns {string} Complete SVG markup.
 */
function renderBadge(badge) {

  // Detects whether the badge has a Simple Icons or custom icon.
  const hasIcon = Boolean(badge.icon || badge.customIcon);

  // Chooses the text position based on icon presence.
  const textX = hasIcon ? TEXT_X_WITH_ICON : TEXT_X_NO_ICON;

  // Computes the total dynamic width.
  const width = textX + textWidth(badge.label) + RIGHT_PADDING;

  // Prepares the escaped label for SVG attributes.
  const title = esc(badge.label);

  // Creates a unique id for the gradient.
  const gradientId = `s-${slug(badge.label)}`;

  /*
   * Generates the custom icon when present, otherwise the Simple Icons icon.
   */
  const icon = badge.customIcon

    // Calls the custom function with the requested color.
    ? badge.customIcon(badge.iconColor || '#fff')

    // Generates the Simple Icons path with the requested color.
    : simpleIconSvg(badge.icon, badge.iconColor || '#fff');

  /*
   * Returns the final SVG with background, gradient, icon, and text.
   */
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEIGHT}" viewBox="0 0 ${width} ${HEIGHT}" role="img" aria-label="${title}">
    <title>${title}</title>
    <linearGradient id="${gradientId}" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <rect width="${width}" height="${HEIGHT}" rx="${RADIUS}" fill="${badge.color}"/>
    <rect width="${width}" height="${HEIGHT}" rx="${RADIUS}" fill="url(#${gradientId})"/>
    ${icon}
    <text x="${textX}" y="14" fill="${badge.textColor || '#fff'}" font-family="${FONT}" font-size="${FONT_SIZE}">${esc(badge.label)}</text>
  </svg>`;
}

// ============================================================================
// File generation
// ============================================================================

// Creates the output folder if it does not exist.
await fs.mkdir(OUT_DIR, { recursive: true });

// Prepares the Markdown lines printed at the end.
const markdown = [];

/*
 * Iterates over all configured badges.
 */
for(const badge of badges) {
  
  // Computes the SVG file name.
  const file = `${slug(badge.label)}.svg`;

  // Writes the generated SVG into assets/badges.
  await fs.writeFile(path.join(OUT_DIR, file), renderBadge(badge), 'utf8');
  
  // Adds the matching Markdown line.
  markdown.push(`![${badge.label}](./assets/badges/${file})`);
}

// Prints the Markdown lines to copy into the README.
console.log(markdown.join('\n'));
