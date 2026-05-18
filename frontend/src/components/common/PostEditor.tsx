'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import FloatingToolbar from './editor/FloatingToolbar';
import MediaGallery from './MediaGallery';
import ImageResizer from './editor/ImageResizer';
import ReactDOM from 'react-dom';

/* ─── Margin Overlay Component ───────────────────────────────── */
interface MarginHandlesProps {
  target: HTMLElement;
  onUpdate: () => void;
}

const MarginHandles: React.FC<MarginHandlesProps & { canvasRef: React.RefObject<HTMLDivElement> }> = ({ target, onUpdate, canvasRef }) => {
  const [isDragging, setIsDragging] = useState<'top' | 'bottom' | null>(null);
  const startY = useRef(0);
  const startMargin = useRef(0);
  const [pos, setPos] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
  const [margins, setMargins] = useState({ top: 0, bottom: 0 });

  const updatePos = useCallback(() => {
    if (!canvasRef.current || !target) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const style = window.getComputedStyle(target);
    
    setPos({
      top: targetRect.top - canvasRect.top,
      left: targetRect.left - canvasRect.left,
      width: targetRect.width,
      height: targetRect.height
    });
    setMargins({
      top: parseInt(style.marginTop) || 0,
      bottom: parseInt(style.marginBottom) || 0
    });
  }, [target, canvasRef]);

  useEffect(() => {
    updatePos();
    
    const resizer = new ResizeObserver(() => requestAnimationFrame(updatePos));
    if (target) resizer.observe(target);
    if (canvasRef.current) resizer.observe(canvasRef.current);
    
    const obs = new MutationObserver(() => requestAnimationFrame(updatePos));
    if (canvasRef.current) {
      obs.observe(canvasRef.current, { 
        attributes: true, 
        childList: true, 
        subtree: true,
        characterData: true 
      });
    }

    window.addEventListener('resize', updatePos);
    document.addEventListener('selectionchange', updatePos);
    
    return () => {
      resizer.disconnect();
      obs.disconnect();
      window.removeEventListener('resize', updatePos);
      document.removeEventListener('selectionchange', updatePos);
    };
  }, [updatePos, target, canvasRef]);

  const onDragStart = (e: React.MouseEvent, pos: 'top' | 'bottom') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(pos);
    document.body.setAttribute('data-editor-dragging', 'true');
    startY.current = e.clientY;
    const style = window.getComputedStyle(target);
    startMargin.current = parseInt(pos === 'top' ? style.marginTop : style.marginBottom) || 0;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dy = e.clientY - startY.current;
      const newVal = Math.max(0, startMargin.current + (isDragging === 'top' ? dy : -dy));
      if (isDragging === 'top') target.style.marginTop = `${newVal}px`;
      else target.style.marginBottom = `${newVal}px`;
      updatePos();
      onUpdate();
    };
    
    const onUp = () => {
      setIsDragging(null);
      document.body.removeAttribute('data-editor-dragging');
      setTimeout(() => {
        document.dispatchEvent(new Event('selectionchange'));
      }, 50);
    };
    
    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, target, updatePos, onUpdate]);

  if (!pos) return null;

  const isFirst = canvasRef.current && target === canvasRef.current.firstElementChild;

  return (
    <div 
      className={`absolute z-10 pointer-events-none margin-handle-container ${isDragging ? 'dragging' : ''}`} 
      style={{ 
        top: pos.top, 
        left: pos.left, 
        width: pos.width, 
        height: pos.height 
      }}
    >
      {/* Content box outline */}
      <div className="absolute inset-0 border border-blue-500/30 ring-2 ring-blue-500/10 rounded pointer-events-none" />
      
      {!isFirst && (
        <>
          {/* Top Margin Handle & Shaded Area */}
          <div 
            style={{ 
              position: 'absolute',
              top: -margins.top,
              left: 0,
              right: 0,
              height: margins.top,
              background: isDragging === 'top' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.02)',
              borderTop: '2px dashed rgba(59, 130, 246, 0.4)',
              borderLeft: '1px dashed rgba(59, 130, 246, 0.15)',
              borderRight: '1px dashed rgba(59, 130, 246, 0.15)',
              borderRadius: '4px 4px 0 0',
              transition: isDragging ? 'none' : 'all 0.15s ease'
            }}
          />
          <div 
            onMouseDown={(e) => onDragStart(e, 'top')}
            style={{ top: -margins.top - 4 }}
            className="absolute left-0 right-0 h-3 bg-blue-500/10 cursor-ns-resize pointer-events-auto hover:bg-blue-500/50 transition-colors"
          />

          {/* Bottom Margin Handle & Shaded Area */}
          <div 
            style={{ 
              position: 'absolute',
              bottom: -margins.bottom,
              left: 0,
              right: 0,
              height: margins.bottom,
              background: isDragging === 'bottom' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.02)',
              borderBottom: '2px dashed rgba(59, 130, 246, 0.4)',
              borderLeft: '1px dashed rgba(59, 130, 246, 0.15)',
              borderRight: '1px dashed rgba(59, 130, 246, 0.15)',
              borderRadius: '0 0 4px 4px',
              transition: isDragging ? 'none' : 'all 0.15s ease'
            }}
          />
          <div 
            onMouseDown={(e) => onDragStart(e, 'bottom')}
            style={{ bottom: -margins.bottom - 4 }}
            className="absolute left-0 right-0 h-3 bg-blue-500/10 cursor-ns-resize pointer-events-auto hover:bg-blue-500/50 transition-colors"
          />
        </>
      )}
    </div>
  );
};

/* ─── Heading Flattener Utility ──────────────────────────────── */
const cleanNestedHeadings = (root: HTMLElement) => {
  const headings = root.querySelectorAll('h1, h2, h3');
  
  headings.forEach((heading) => {
    const blockChildren = heading.querySelectorAll('p, blockquote, ul, ol, hr, h1, h2, h3');
    if (blockChildren.length > 0) {
      const parent = heading.parentNode;
      if (parent) {
        const frag = document.createDocumentFragment();
        let inlineGroup: Node[] = [];
        
        const commitInlineGroup = () => {
          if (inlineGroup.length > 0) {
            const isWhitespace = inlineGroup.every(n => n.nodeType === Node.TEXT_NODE && !n.textContent?.trim());
            if (!isWhitespace) {
              const p = document.createElement('p');
              inlineGroup.forEach(n => p.appendChild(n));
              frag.appendChild(p);
            }
            inlineGroup = [];
          }
        };

        heading.childNodes.forEach((child) => {
          const isBlock = ['P', 'BLOCKQUOTE', 'UL', 'OL', 'HR', 'H1', 'H2', 'H3'].includes((child as HTMLElement).tagName);
          if (isBlock) {
            commitInlineGroup();
            frag.appendChild(child.cloneNode(true));
          } else {
            inlineGroup.push(child.cloneNode(true));
          }
        });
        commitInlineGroup();

        parent.replaceChild(frag, heading);
      }
    }
  });
};

/* ─── Main Editor ────────────────────────────────────────────── */
interface PostEditorProps {
  content: string;
  onChange: (html: string) => void;
  postTitle?: string;
}

const PostEditor: React.FC<PostEditorProps> = ({ content, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null!);
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [htmlSrc, setHtmlSrc] = useState('');
  const [isInitial, setIsInitial] = useState(true);
  
  const [activeLink, setActiveLink] = useState<HTMLAnchorElement | null>(null);
  const [linkBubblePos, setLinkBubblePos] = useState<{ top: number, left: number } | null>(null);

  const [selection, setSelection] = useState({
    visible: true,
    bold: false,
    italic: false,
    underline: false,
    blockType: 'p',
    align: 'left'
  });

  const ensureTrailingParagraph = useCallback(() => {
    if (!editorRef.current) return false;
    const lastChild = editorRef.current.lastElementChild;
    if (!lastChild || lastChild.tagName !== 'P') {
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      editorRef.current.appendChild(p);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (isInitial && editorRef.current) {
      document.execCommand('defaultParagraphSeparator', false, 'p');
      (document as any).execCommand('styleWithCSS', false, true);
      editorRef.current.innerHTML = content || '<p><br></p>';
      
      // Sanitise and flatten initial HTML nested headings
      cleanNestedHeadings(editorRef.current);
      
      ensureTrailingParagraph();
      setIsInitial(false);
    }
  }, [content, isInitial, ensureTrailingParagraph]);

  const emitChange = useCallback(() => {
    if (editorRef.current) {
      // Flatten any newly nested headings in real-time as they edit
      cleanNestedHeadings(editorRef.current);
      
      ensureTrailingParagraph();
      let html = editorRef.current.innerHTML;
      // Remove all <font> tags but keep their content
      html = html.replace(/<font[^>]*>/gi, '').replace(/<\/font>/gi, '');
      onChange(html);
    }
  }, [onChange, ensureTrailingParagraph]);

  useEffect(() => {
    const handleSelection = () => {
      // Prevent clearing activeElement/activeLink if we're clicking on the toolbar, handles, the resizer panel, or link bubble
      if (document.activeElement?.closest('.post-editor-toolbar, .margin-handle-container, .image-resizer-panel, .link-bubble-panel')) return;

      const sel = window.getSelection();
      
      const isLeft = document.queryCommandState('justifyLeft');
      const isCenter = document.queryCommandState('justifyCenter');
      const isRight = document.queryCommandState('justifyRight');
      const currentAlign = isRight ? 'right' : isCenter ? 'center' : 'left';

      setSelection({
        visible: true,
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        blockType: document.queryCommandValue('formatBlock') || 'p',
        align: currentAlign
      });

      if (!sel || !editorRef.current?.contains(sel.anchorNode)) {
        setActiveElement(null);
        setActiveLink(null);
        setLinkBubblePos(null);
        return;
      }
      
      let node = sel.anchorNode as Node;
      if (node === editorRef.current) {
        if (sel.anchorOffset < editorRef.current.childNodes.length) {
          node = editorRef.current.childNodes[sel.anchorOffset];
        } else {
          node = editorRef.current.lastElementChild || editorRef.current;
        }
      }
      
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement!;
      const el = node as HTMLElement;
      
      // Find if we are selecting something inside a link
      const anchor = el.closest('a') as HTMLAnchorElement;
      if (anchor && editorRef.current.contains(anchor)) {
        setActiveLink(anchor);
        const canvasRect = editorRef.current.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();
        setLinkBubblePos({
          top: anchorRect.bottom - canvasRect.top + 8,
          left: Math.max(0, anchorRect.left - canvasRect.left)
        });
      } else {
        setActiveLink(null);
        setLinkBubblePos(null);
      }
      
      // Find if we are selecting something inside a figure
      const figure = el.closest('figure') as HTMLElement;
      if (figure && editorRef.current.contains(figure)) {
        setActiveElement(figure);
        return;
      }
      
      // Find the nearest block-level container (like p, h1, etc.)
      // This will find paragraphs even if they are inside list items (li)
      const target = el.closest('p, h1, h2, h3, blockquote') as HTMLElement;
      if (target && editorRef.current.contains(target)) {
        setActiveElement(target);
      } else {
        setActiveElement(null);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const sel = window.getSelection();
    if (!sel || !sel.isCollapsed) return;

    let node = sel.anchorNode as Node;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement!;
    const li = (node as HTMLElement).closest('li');
    const isEmpty = li && (li.textContent === '' || li.innerHTML === '<br>' || li.innerHTML === '');

    if (e.key === 'Backspace') {
      const isAtStart = sel.anchorOffset === 0;
      if (li && (isEmpty || isAtStart)) {
        e.preventDefault();
        const listParent = li.closest('ul, ol');
        if (listParent) {
          // Find the top-most container that is a child of editorRef
          let topContainer = listParent as HTMLElement;
          while (topContainer.parentElement && topContainer.parentElement !== editorRef.current) {
            topContainer = topContainer.parentElement as HTMLElement;
          }

          const content = li.innerHTML === '<br>' ? '' : li.innerHTML;
          const newP = document.createElement('p');
          newP.innerHTML = content || '<br>';
          
          // If it's the first item or empty, move before topContainer
          if (li === listParent.firstElementChild) {
            topContainer.before(newP);
          } else {
            // Split the list or just handle the item? 
            // For simplicity in breakout, we'll put it after the topContainer if it's empty
            topContainer.after(newP);
          }
          
          li.remove();
          if (listParent.children.length === 0) listParent.remove();
          if (topContainer !== listParent && topContainer.textContent?.trim() === '') topContainer.remove();
          
          const range = document.createRange();
          range.setStart(newP, 0);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          
          emitChange();
          return;
        }
      }
    }

    if (e.key === 'Enter' && isEmpty) {
      e.preventDefault();
      const listParent = li.closest('ul, ol');
      if (listParent) {
        // Find the top-most container that is a child of editorRef
        let topContainer = listParent as HTMLElement;
        while (topContainer.parentElement && topContainer.parentElement !== editorRef.current) {
          topContainer = topContainer.parentElement as HTMLElement;
        }

        const newP = document.createElement('p');
        newP.innerHTML = '<br>';
        topContainer.after(newP);
        
        li.remove();
        if (listParent.children.length === 0) listParent.remove();
        if (topContainer !== listParent && topContainer.textContent?.trim() === '') topContainer.remove();

        const range = document.createRange();
        range.setStart(newP, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        
        emitChange();
        setTimeout(() => document.dispatchEvent(new Event('selectionchange')), 0);
        return;
      }
    }

    if (e.key === 'Enter') {
      // Force a selection check on the next frame to ensure the frame follows the new line
      setTimeout(() => {
        document.dispatchEvent(new Event('selectionchange'));
      }, 0);
    }
  };

  const addImage = (media: any) => {
    const imgHtml = `
      <figure style="margin: 2rem auto; text-align: center; width: 80%;">
        <img src="${process.env.NEXT_PUBLIC_API_URL}${media.urlFull}" style="border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15); display: block; margin: 0 auto; max-width: 100%;" />
      </figure>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, imgHtml);
    emitChange();
    setShowGallery(false);
  };

  const formatHtml = (html: string): string => {
    let formatted = '';
    const reg = /(<[^>]+>)/g;
    const elements = html.replace(reg, '\r\n$1\r\n').split('\r\n');
    let indent = 0;
    
    elements.forEach((el) => {
      const trimmed = el.trim();
      if (!trimmed) return;
      
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1);
      }
      
      formatted += '  '.repeat(indent) + trimmed + '\n';
      
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.match(/<(br|hr|img|input)[^>]*>/i)) {
        indent++;
      }
    });
    
    return formatted.trim();
  };

  const openHtml = () => {
    const raw = editorRef.current?.innerHTML || '';
    setHtmlSrc(formatHtml(raw));
    setShowHtml(true);
  };

  const saveHtml = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = htmlSrc;
      emitChange();
    }
    setShowHtml(false);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    
    // Check if the pasted text is a web URL
    const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
    if (urlPattern.test(text.trim())) {
      e.preventDefault();
      
      const url = text.trim();
      const href = /^(https?:\/\/)/i.test(url) ? url : `https://${url}`;
      
      // Insert as a clean clickable hyperlink using HTML
      const linkHtml = `<a href="${href}" target="_blank" class="text-blue-400 hover:text-blue-300 underline transition-colors cursor-pointer pointer-events-auto" rel="noopener noreferrer">${url}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
      
      // Sync state immediately
      emitChange();
    }
  };

  const handleEditLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeLink) return;
    
    const newUrl = prompt('แก้ไขลิงก์ (URL):', activeLink.getAttribute('href') || '');
    if (newUrl === null) return; // Cancelled
    
    const href = /^(https?:\/\/)/i.test(newUrl.trim()) ? newUrl.trim() : `https://${newUrl.trim()}`;
    const oldHref = activeLink.getAttribute('href') || '';
    activeLink.setAttribute('href', href);
    
    // If text inside the link was identical to the old URL, update text too
    if (activeLink.innerText.trim() === oldHref.trim()) {
      activeLink.innerText = href;
    }
    
    emitChange();
    setTimeout(() => {
      document.dispatchEvent(new Event('selectionchange'));
    }, 50);
  };

  const handleRemoveLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeLink) return;
    
    // Replace link with text content
    const textNode = document.createTextNode(activeLink.innerText);
    activeLink.replaceWith(textNode);
    
    setActiveLink(null);
    setLinkBubblePos(null);
    emitChange();
    
    setTimeout(() => {
      document.dispatchEvent(new Event('selectionchange'));
    }, 50);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const figure = target.closest('figure');
    
    if (figure && editorRef.current?.contains(figure)) {
      // Set active element to the figure block immediately on click
      setActiveElement(figure);
      
      // Set selection range to this figure block to keep selection stable
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        const range = document.createRange();
        range.selectNode(figure);
        sel.addRange(range);
      }
      return;
    }

    // For other normal block elements, if we clicked directly on them, set them active
    const block = target.closest('p, h1, h2, h3, blockquote') as HTMLElement;
    if (block && editorRef.current?.contains(block)) {
      setActiveElement(block);
    }
  };

  return (
    <div className="post-editor-root flex flex-col w-full border border-gray-200 rounded-2xl overflow-visible shadow-lg bg-white">
      
      {/* Top Toolbar */}
      <div className="post-editor-toolbar flex items-center flex-wrap gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-[70] rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowGallery(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95">
            <span className="material-symbols-outlined text-sm">image</span>
            Add Image
          </button>
        </div>

        <div className="w-[1px] h-6 bg-gray-300 mx-2" />

        <div className="flex-grow flex justify-center">
          <FloatingToolbar 
            selection={selection} 
            onClose={() => {}}
            onFormatBlock={() => {}} 
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button type="button" onClick={openHtml} className="p-2 hover:bg-gray-200 text-gray-500 rounded-lg transition-all" title="View Source">
            <span className="material-symbols-outlined text-sm">code</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas (Single Continuous Document) */}
      <div className="bg-[#0f172a] p-8 min-h-[800px] rounded-b-2xl overflow-hidden flex flex-col items-center">
        <div className="relative w-full max-w-4xl">
          <div 
            ref={editorRef}
            contentEditable
            onInput={emitChange}
            onKeyDown={handleKeyDown}
            onMouseDown={handleCanvasMouseDown}
            onPaste={handlePaste}
            className="doc-canvas w-full outline-none text-gray-300 min-h-full"
            {...{ placeholder: "เริ่มเขียนเนื้อหาของคุณที่นี่..." }}
          />

          {/* Draggable Margin Overlays */}
          {activeElement && activeElement.tagName !== 'FIGURE' && (
            <MarginHandles target={activeElement} onUpdate={emitChange} canvasRef={editorRef} />
          )}

          {/* Image Resize + Style Controls */}
          {activeElement?.tagName === 'FIGURE' && (
            <ImageResizer 
              key={activeElement.querySelector('img')?.getAttribute('src') || 'image-resizer'}
              figure={activeElement} 
              canvasRef={editorRef} 
              onUpdate={emitChange} 
            />
          )}

          {/* Link Edit/Delete Bubble Popup */}
          {activeLink && linkBubblePos && (
            <div 
              className="absolute z-[80] link-bubble-panel pointer-events-auto"
              style={{ 
                top: linkBubblePos.top,
                left: linkBubblePos.left,
                transform: 'translateX(0)' 
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-2.5 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl px-3 py-1.5 text-xs text-white backdrop-blur-md">
                <span className="material-symbols-outlined text-sm text-gray-400">link</span>
                <a 
                  href={activeLink.getAttribute('href') || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="max-w-[200px] truncate text-blue-400 hover:text-blue-300 underline font-semibold font-mono"
                >
                  {activeLink.getAttribute('href')}
                </a>
                
                <div className="w-[1px] h-4 bg-gray-700" />
                
                <button 
                  type="button" 
                  onClick={handleEditLink} 
                  className="p-1 text-gray-400 hover:text-white rounded transition-colors flex items-center gap-1 font-bold"
                  title="Edit Link"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  Edit
                </button>
                
                <button 
                  type="button" 
                  onClick={handleRemoveLink} 
                  className="p-1 text-red-400 hover:text-red-300 rounded transition-colors flex items-center gap-1 font-bold"
                  title="Remove Link"
                >
                  <span className="material-symbols-outlined text-[14px]">link_off</span>
                  Unlink
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showGallery && (
        <MediaGallery isModal onSelect={addImage} onClose={() => setShowGallery(false)} />
      )}

      {showHtml && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#1e293b]/50 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="h-4 w-[1px] bg-slate-800 mx-2" />
                <span className="material-symbols-outlined text-blue-400 text-lg">code</span>
                <span className="text-sm font-semibold text-slate-300 font-mono">index.html (HTML Source Editor)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(htmlSrc);
                    alert('คัดลอกโค้ดลง Clipboard เรียบร้อย!');
                  }}
                  className="px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  Copy Code
                </button>
              </div>
            </div>

            {/* Editor Workspace */}
            <div className="flex-grow flex relative bg-[#090d16] p-4 min-h-0">
              {/* Line Numbers Gutter */}
              <div className="w-12 select-none text-right pr-4 font-mono text-xs text-slate-600 border-r border-slate-800/50 flex flex-col py-2 leading-6 overflow-hidden">
                {Array.from({ length: Math.max(1, htmlSrc.split('\n').length) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              
              {/* Textarea Code Editor */}
              <textarea
                className="flex-grow bg-transparent text-blue-300 font-mono text-sm pl-4 pr-6 py-1.5 focus:outline-none resize-none leading-6 w-full h-full min-h-0 overflow-y-auto whitespace-pre tab-size-2 scrollbar-thin"
                style={{ tabSize: 2 }}
                value={htmlSrc}
                onChange={e => setHtmlSrc(e.target.value)}
                spellCheck={false}
              />
            </div>

            {/* Editor Footer Actions */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#1e293b]/30 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500 font-mono">UTF-8 • HTML5 • Clean Canvas Model</span>
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowHtml(false)} 
                  className="px-5 py-2 hover:bg-slate-800/50 text-slate-400 hover:text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={saveHtml} 
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostEditor;
