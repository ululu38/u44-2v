import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/infrastructure/db/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs/promises';
import * as path from 'path';

// Parse command line arguments
const writeMode = process.argv.includes('--write');

// Tokenizer & Parser types
interface Node {
  type: 'element' | 'text';
  name?: string;
  attrs?: Record<string, string>;
  children?: Node[];
  text?: string;
}

type Token = 
  | { type: 'tag'; name: string; isClosing: boolean; attrs: Record<string, string>; raw: string } 
  | { type: 'text'; text: string };

// HTML Tokenizer
function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  const regex = /<(\/?)([a-zA-Z1-6]+)([^>]*)>/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const textBefore = html.substring(lastIndex, match.index);
    if (textBefore) {
      tokens.push({ type: 'text', text: textBefore });
    }

    const isClosing = match[1] === '/';
    const name = match[2].toLowerCase();
    const attrStr = match[3];
    const attrs: Record<string, string> = {};

    // Parse attributes
    const attrRegex = /([a-zA-Z0-9:-]+)(?:\s*=\s*(?:'([^']*)'|"([^"]*)"|([^\s>]+)))?/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
      attrs[attrName] = attrValue;
    }

    tokens.push({
      type: 'tag',
      name,
      isClosing,
      attrs,
      raw: match[0]
    });
    lastIndex = regex.lastIndex;
  }

  const textAfter = html.substring(lastIndex);
  if (textAfter) {
    tokens.push({ type: 'text', text: textAfter });
  }

  return tokens;
}

// Stack-based HTML Tree Parser
function parseHTMLToTree(html: string): Node[] {
  const tokens = tokenize(html);
  const root: Node = { type: 'element', name: 'root', children: [] };
  const stack: Node[] = [root];

  for (const token of tokens) {
    if (token.type === 'text') {
      const current = stack[stack.length - 1];
      current.children!.push({ type: 'text', text: token.text });
    } else {
      if (token.isClosing) {
        let foundIdx = -1;
        for (let i = stack.length - 1; i >= 1; i--) {
          if (stack[i].name === token.name) {
            foundIdx = i;
            break;
          }
        }
        if (foundIdx !== -1) {
          stack.splice(foundIdx);
        }
      } else {
        const isSelfClosing = ['br', 'hr', 'img', 'iframe'].includes(token.name);
        const newNode: Node = {
          type: 'element',
          name: token.name,
          attrs: token.attrs,
          children: []
        };
        const current = stack[stack.length - 1];
        current.children!.push(newNode);
        if (!isSelfClosing) {
          stack.push(newNode);
        }
      }
    }
  }

  return root.children!;
}

// Helpers to extract formatting details
function extractWidth(attrs: Record<string, string>): string | undefined {
  if (attrs.width) {
    if (attrs.width.endsWith('%') || attrs.width.endsWith('px')) {
      return attrs.width;
    }
    if (/^\d+$/.test(attrs.width)) {
      return attrs.width + 'px';
    }
  }
  if (attrs.style) {
    const match = attrs.style.match(/width:\s*([^;]+)/i);
    if (match) {
      return match[1].trim();
    }
  }
  return undefined;
}

function extractAlign(attrs: Record<string, string>): 'left' | 'right' | 'center' | undefined {
  if (attrs.align) {
    const a = attrs.align.toLowerCase();
    if (a === 'left' || a === 'right' || a === 'center') {
      return a as 'left' | 'right' | 'center';
    }
  }
  if (attrs.style) {
    const match = attrs.style.match(/text-align:\s*([^;]+)/i);
    if (match) {
      const a = match[1].trim().toLowerCase();
      if (['left', 'right', 'center'].includes(a)) {
        return a as 'left' | 'right' | 'center';
      }
    }
    const floatMatch = attrs.style.match(/float:\s*([^;]+)/i);
    if (floatMatch) {
      const f = floatMatch[1].trim().toLowerCase();
      if (['left', 'right'].includes(f)) {
        return f as 'left' | 'right';
      }
    }
  }
  return undefined;
}

function getTextAlignStyle(styleStr: string | undefined): string {
  if (!styleStr) return '';
  const match = styleStr.match(/text-align:\s*([^;]+)/i);
  if (match) {
    const val = match[1].trim().toLowerCase();
    if (['left', 'center', 'right', 'justify'].includes(val)) {
      return `text-align: ${val};`;
    }
  }
  return '';
}

// Step 1: Clean tree nodes recursively
function cleanTree(nodes: Node[]): Node[] {
  const result: Node[] = [];

  for (const node of nodes) {
    if (node.type === 'text') {
      result.push(node);
      continue;
    }

    const name = node.name!;
    
    // Unwrap layout & non-standard wrapping tags (div, span, font, card, row, col, etc.)
    if (['div', 'span', 'font', 'section', 'article', 'header', 'footer'].includes(name)) {
      result.push(...cleanTree(node.children || []));
      continue;
    }

    // Remap bold and italic tags
    let cleanName = name;
    if (name === 'b') cleanName = 'strong';
    if (name === 'i') cleanName = 'em';

    // Handle images -> convert to standard figure structure
    if (name === 'img') {
      const imgWidth = extractWidth(node.attrs || {}) || '80%';
      const imgAlign = extractAlign(node.attrs || {}) || 'center';

      let figStyle = 'margin: 2rem auto; ';
      if (imgAlign === 'left') {
        figStyle += 'margin-left: 0px; margin-right: auto; text-align: left; ';
      } else if (imgAlign === 'right') {
        figStyle += 'margin-left: auto; margin-right: 0px; text-align: right; ';
      } else {
        figStyle += 'margin-left: auto; margin-right: auto; text-align: center; ';
      }
      figStyle += `width: ${imgWidth};`;

      let src = node.attrs?.src || '';
      // Normalize various legacy path formats to clean /uploads/ relative URLs
      src = src
        .replace(/^(https?:\/\/[^/]+)\/uploads\//i, '/uploads/')   // http://localhost:4000/uploads/
        .replace(/^(\.\.\/)+src\/images\/uploads\//i, '/uploads/') // ../../src/images/uploads/
        .replace(/^(\.\.\/)+src\/uploads\//i, '/uploads/')         // ../../src/uploads/
        .replace(/^(\.\.\/)+uploads\//i, '/uploads/');             // ../../uploads/

      const cleanImgNode: Node = {
        type: 'element',
        name: 'img',
        attrs: {
          src: src,
          style: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15); display: block; margin: 0 auto; max-width: 100%;'
        },
        children: []
      };

      result.push({
        type: 'element',
        name: 'figure',
        attrs: { style: figStyle },
        children: [cleanImgNode]
      });
      continue;
    }

    // Handle existing figures
    if (name === 'figure') {
      // Find inner img
      const imgNode = (node.children || []).find(c => c.type === 'element' && c.name === 'img');
      if (imgNode) {
        const width = extractWidth(node.attrs || {}) || extractWidth(imgNode.attrs || {}) || '80%';
        const align = extractAlign(node.attrs || {}) || extractAlign(imgNode.attrs || {}) || 'center';

        let figStyle = 'margin: 2rem auto; ';
        if (align === 'left') {
          figStyle += 'margin-left: 0px; margin-right: auto; text-align: left; ';
        } else if (align === 'right') {
          figStyle += 'margin-left: auto; margin-right: 0px; text-align: right; ';
        } else {
          figStyle += 'margin-left: auto; margin-right: auto; text-align: center; ';
        }
        figStyle += `width: ${width};`;

        let src = imgNode.attrs?.src || '';
        // Normalize various legacy path formats to clean /uploads/ relative URLs
        src = src
          .replace(/^(https?:\/\/[^/]+)\/uploads\//i, '/uploads/')   // http://localhost:4000/uploads/
          .replace(/^(\.\.\/)+src\/images\/uploads\//i, '/uploads/') // ../../src/images/uploads/
          .replace(/^(\.\.\/)+src\/uploads\//i, '/uploads/')         // ../../src/uploads/
          .replace(/^(\.\.\/)+uploads\//i, '/uploads/');             // ../../uploads/

        const cleanImgNode: Node = {
          type: 'element',
          name: 'img',
          attrs: {
            src: src,
            style: 'border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15); display: block; margin: 0 auto; max-width: 100%;'
          },
          children: []
        };

        result.push({
          type: 'element',
          name: 'figure',
          attrs: { style: figStyle },
          children: [cleanImgNode]
        });
      } else {
        // If figure has no img, unwrap children
        result.push(...cleanTree(node.children || []));
      }
      continue;
    }

    // Build cleaned node structure
    const cleanedNode: Node = {
      type: 'element',
      name: cleanName,
      attrs: {},
      children: cleanTree(node.children || [])
    };

    // Clean attributes according to tag
    if (['p', 'h1', 'h2', 'h3', 'blockquote'].includes(cleanName)) {
      const alignStyle = getTextAlignStyle(node.attrs?.style);
      if (alignStyle) {
        cleanedNode.attrs = { style: alignStyle };
      }
    } else if (cleanName === 'a') {
      cleanedNode.attrs = {
        href: node.attrs?.href || '#',
        target: '_blank',
        rel: 'noopener noreferrer'
      };
    } else if (cleanName === 'iframe') {
      cleanedNode.attrs = {
        src: node.attrs?.src || '',
        width: node.attrs?.width || '100%',
        height: node.attrs?.height || '450',
        frameborder: '0',
        allowfullscreen: 'true'
      };
    }

    result.push(cleanedNode);
  }

  return result;
}

// Step 2: Flatten block elements and wrap loose inlines into paragraphs
function flattenTree(nodes: Node[]): Node[] {
  const flatBlocks: Node[] = [];
  let inlineBuffer: Node[] = [];

  function commitParagraph() {
    if (inlineBuffer.length > 0) {
      // Check if it actually contains text content or inline elements
      const hasContent = inlineBuffer.some(n => {
        if (n.type === 'text') {
          return n.text && n.text.replace(/\s/g, '').length > 0;
        }
        return n.name !== 'br';
      });

      if (hasContent) {
        flatBlocks.push({
          type: 'element',
          name: 'p',
          attrs: {},
          children: [...inlineBuffer]
        });
      } else {
        // If buffer contains a <br>, output <p><br></p>
        const hasBr = inlineBuffer.some(n => n.name === 'br');
        if (hasBr) {
          flatBlocks.push({
            type: 'element',
            name: 'p',
            attrs: {},
            children: [{ type: 'element', name: 'br', attrs: {}, children: [] }]
          });
        }
      }
      inlineBuffer = [];
    }
  }

  function helper(cNodes: Node[]) {
    for (const node of cNodes) {
      if (node.type === 'text') {
        inlineBuffer.push(node);
        continue;
      }

      const name = node.name!;
      const isBlock = ['p', 'h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'figure', 'hr', 'iframe'].includes(name);

      if (isBlock) {
        commitParagraph();

        if (name === 'p') {
          // Push p's children to inline buffer or process nested blocks if any
          // (Since cleanTree is already run, p will only contain inlines, but double check)
          const nestedBlocks = (node.children || []).some(c => c.type === 'element' && ['p', 'h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'figure', 'hr', 'iframe'].includes(c.name!));
          if (nestedBlocks) {
            helper(node.children || []);
          } else {
            // Commit as paragraph with its own alignment style
            flatBlocks.push({
              type: 'element',
              name: 'p',
              attrs: node.attrs || {},
              children: node.children || []
            });
          }
        } else if (['h1', 'h2', 'h3', 'blockquote'].includes(name)) {
          // Normalise headings/blockquotes - only allow inline tags inside them
          const onlyInlines = stripBlockChildren(node.children || []);
          flatBlocks.push({
            type: 'element',
            name: name,
            attrs: node.attrs || {},
            children: onlyInlines
          });
        } else if (name === 'ul' || name === 'ol') {
          const cleanLi: Node[] = [];
          for (const child of node.children || []) {
            if (child.type === 'element' && child.name === 'li') {
              cleanLi.push({
                type: 'element',
                name: 'li',
                attrs: {},
                children: stripBlockChildren(child.children || [])
              });
            } else if (child.type === 'text' && child.text?.trim()) {
              cleanLi.push({
                type: 'element',
                name: 'li',
                attrs: {},
                children: [child]
              });
            }
          }
          flatBlocks.push({
            type: 'element',
            name: name,
            attrs: {},
            children: cleanLi
          });
        } else {
          // figure, hr, iframe
          flatBlocks.push(node);
        }
      } else {
        // Inline tag (strong, em, u, a, br)
        inlineBuffer.push(node);
      }
    }
  }

  function stripBlockChildren(nodes: Node[]): Node[] {
    const res: Node[] = [];
    for (const c of nodes) {
      if (c.type === 'text') {
        res.push(c);
      } else if (c.type === 'element') {
        const isBlock = ['p', 'h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'figure', 'hr', 'iframe'].includes(c.name!);
        if (!isBlock) {
          res.push({
            type: 'element',
            name: c.name,
            attrs: c.attrs,
            children: stripBlockChildren(c.children || [])
          });
        } else {
          // If a block is nested, unwrap it (traverse recursively)
          res.push(...stripBlockChildren(c.children || []));
        }
      }
    }
    return res;
  }

  helper(nodes);
  commitParagraph();

  // Ensure trailing paragraph <p><br></p> exists for the editor
  const lastBlock = flatBlocks[flatBlocks.length - 1];
  const hasTrailingPara = lastBlock && lastBlock.type === 'element' && lastBlock.name === 'p' && 
                          lastBlock.children?.length === 1 && lastBlock.children[0].name === 'br';
  
  if (!hasTrailingPara) {
    flatBlocks.push({
      type: 'element',
      name: 'p',
      attrs: {},
      children: [{ type: 'element', name: 'br', attrs: {}, children: [] }]
    });
  }

  return flatBlocks;
}

// Render tree to standard HTML string
function renderTreeToHTML(nodes: Node[]): string {
  let html = '';
  for (const node of nodes) {
    if (node.type === 'text') {
      html += node.text;
    } else {
      const name = node.name!;
      const attrsArr: string[] = [];
      if (node.attrs) {
        for (const [key, val] of Object.entries(node.attrs)) {
          attrsArr.push(`${key}="${val}"`);
        }
      }
      const attrsStr = attrsArr.length > 0 ? ' ' + attrsArr.join(' ') : '';
      const isSelfClosing = ['br', 'hr', 'img'].includes(name);

      if (isSelfClosing) {
        html += `<${name}${attrsStr} />`;
      } else {
        html += `<${name}${attrsStr}>${renderTreeToHTML(node.children || [])}</${name}>`;
      }
    }
  }
  return html;
}

// Core cleaning function
function cleanPostHTML(html: string): string {
  const tree = parseHTMLToTree(html);
  const cleaned = cleanTree(tree);
  const flattened = flattenTree(cleaned);
  return renderTreeToHTML(flattened);
}

// Database Connection & Update Execution
async function migratePostContent() {
  const pool = new Pool({ connectionString: 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2' });
  const db = drizzle(pool, { schema });

  console.log('Fetching posts from database...');
  const allPosts = await db.query.posts.findMany();
  console.log(`Found ${allPosts.length} posts to analyze.`);

  let updatedCount = 0;
  let logContent = '';

  logContent += `Migration Log - Running in ${writeMode ? 'WRITE' : 'DRY RUN'} mode\n`;
  logContent += `Date: ${new Date().toISOString()}\n`;
  logContent += `================================================================================\n\n`;

  for (const post of allPosts) {
    if (!post.contentHtml) continue;

    const originalContent = post.contentHtml;
    const cleanedContent = cleanPostHTML(originalContent);

    // Standardize newline formatting in comparison
    const normOriginal = originalContent.replace(/\r\n/g, '\n').trim();
    const normCleaned = cleanedContent.replace(/\r\n/g, '\n').trim();

    if (normOriginal !== normCleaned) {
      updatedCount++;
      logContent += `================================================================================\n`;
      logContent += `POST ID: ${post.postId} | Title: ${post.title}\n`;
      logContent += `--------------------------------------------------------------------------------\n`;
      logContent += `OLD CONTENT:\n${originalContent}\n`;
      logContent += `--------------------------------------------------------------------------------\n`;
      logContent += `NEW CONTENT:\n${cleanedContent}\n`;
      logContent += `================================================================================\n\n`;

      if (writeMode) {
        await db.update(schema.posts)
          .set({ contentHtml: cleanedContent, updatedAt: new Date() })
          .where(eq(schema.posts.postId, post.postId));
      }
    }
  }

  logContent += `\nTotal posts analyzed: ${allPosts.length}\n`;
  logContent += `Total posts that require migration: ${updatedCount}\n`;

  const logPath = path.join(process.cwd(), 'migration_dry_run.log');
  await fs.writeFile(logPath, logContent, 'utf-8');

  console.log(`\nMigration operation finished.`);
  console.log(`Analyzed: ${allPosts.length} posts.`);
  console.log(`Changed: ${updatedCount} posts.`);
  console.log(`Log written to: ${logPath}`);
  
  if (!writeMode) {
    console.log('\n[DRY RUN] No database writes were made. Review migration_dry_run.log to check outputs.');
    console.log('To apply these changes, run the script with the --write flag:');
    console.log('powershell -ExecutionPolicy Bypass -Command "npx ts-node src/infrastructure/db/migrate_post_content.ts --write"');
  } else {
    console.log('\n[WRITE] Changes have been successfully written to the database.');
  }

  process.exit(0);
}

migratePostContent().catch(err => {
  console.error(err);
  process.exit(1);
});
