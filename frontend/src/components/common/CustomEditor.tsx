'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import TextBlock from './editor/TextBlock';
import ImageBlock from './editor/ImageBlock';
import MediaGallery from './MediaGallery';


interface Block {
  id: string;
  type: 'text' | 'image' | 'heading';
  content: string;
  metadata?: any;
}

interface CustomEditorProps {
  content: string;
  onChange: (html: string) => void;
  postTitle?: string;
}

const CustomEditor: React.FC<CustomEditorProps> = ({ content, onChange, postTitle }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const isInitialMount = useRef(true);

  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlSource, setHtmlSource] = useState('');

  // Convert HTML to Blocks
  useEffect(() => {
    if (isInitialMount.current) {
      const parsedBlocks = parseHtmlToBlocks(content);
      setBlocks(parsedBlocks);
      isInitialMount.current = false;
    }
  }, [content]);

  // Convert Blocks to HTML and trigger onChange
  useEffect(() => {
    if (!isInitialMount.current) {
      const html = convertBlocksToHtml(blocks);
      onChange(html);
    }
  }, [blocks]);

  const parseHtmlToBlocks = (html: string): Block[] => {
    if (!html) return [{ id: crypto.randomUUID(), type: 'text', content: '' }];
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Look for content inside the wrapper div if it exists
    const wrapper = doc.querySelector('.post-content') || doc.body;
    const nodes = Array.from(wrapper.childNodes);
    
    const parsed: Block[] = nodes.map((node): Block | null => {
      const el = node as HTMLElement;
      if (el.tagName === 'IMG') {
        const style = el.getAttribute('style') || '';
        const shadow = style.includes('rgba(0, 0, 0, 0.2)') ? 'hard' : style.includes('rgba(0, 0, 0, 0.1)') ? 'soft' : 'none';
        const radiusMatch = style.match(/border-radius:\s*([^;]+)/);
        const radius = radiusMatch ? radiusMatch[1].trim() : '8px';

        return {
          id: crypto.randomUUID(),
          type: 'image',
          content: el.getAttribute('src') || '',
          metadata: {
            width: el.getAttribute('width') || '100%',
            alt: el.getAttribute('alt') || '',
            textAlign: el.style.textAlign || 'center',
            shadow: shadow,
            radius: radius
          }
        };
      } else if (['H1', 'H2', 'H3'].includes(el.tagName)) {
        return {
          id: crypto.randomUUID(),
          type: 'heading',
          content: el.innerHTML,
          metadata: { level: parseInt(el.tagName.substring(1)), textAlign: el.style.textAlign || 'left' }
        };
      } else if (el.tagName === 'P' || el.tagName === 'DIV') {
        return {
          id: crypto.randomUUID(),
          type: 'text',
          content: el.innerHTML || el.textContent || '',
          metadata: { textAlign: el.style.textAlign || 'left' }
        };
      }
      return null;
    }).filter((b): b is Block => b !== null && (b.content !== '' || b.type === 'image'));

    return parsed.length > 0 ? parsed : [{ id: crypto.randomUUID(), type: 'text', content: '' }];
  };

  const convertBlocksToHtml = (blocks: Block[]): string => {
    const innerHtml = blocks.map(block => {
      if (block.type === 'image') {
        const shadow = block.metadata?.shadow || 'none';
        const shadowStyle = shadow === 'soft' 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' 
          : shadow === 'hard' 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)' 
            : 'none';
        
        const style = `display: block; margin: ${block.metadata?.textAlign === 'center' ? '0 auto' : block.metadata?.textAlign === 'right' ? '0 0 0 auto' : '0 auto 0 0'}; border-radius: ${block.metadata?.radius || '8px'}; box-shadow: ${shadowStyle};`;
        return `<img src="${block.content}" alt="${block.metadata?.alt || ''}" width="${block.metadata?.width || '100%'}" style="${style}" />`;
      } else if (block.type === 'heading') {
        const level = block.metadata?.level || 2;
        const align = block.metadata?.textAlign || 'left';
        return `<h${level} style="text-align: ${align};">${block.content}</h${level}>`;
      } else {
        const align = block.metadata?.textAlign || 'left';
        return `<p style="text-align: ${align};">${block.content}</p>`;
      }
    }).join('');

    return `<div class="post-content">${innerHtml}</div>`;
  };

  const openHtmlSource = () => {
    setHtmlSource(convertBlocksToHtml(blocks));
    setShowHtmlModal(true);
  };

  const saveHtmlSource = () => {
    const parsedBlocks = parseHtmlToBlocks(htmlSource);
    setBlocks(parsedBlocks);
    setShowHtmlModal(false);
  };

  const addBlock = (type: 'text' | 'image' | 'heading', index?: number) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      content: '',
      metadata: type === 'heading' ? { level: 2 } : type === 'image' ? { width: '100%', textAlign: 'center' } : {}
    };
    
    const newBlocks = [...blocks];
    if (typeof index === 'number') {
      newBlocks.splice(index + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    setBlocks(newBlocks);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      setBlocks([{ id: crypto.randomUUID(), type: 'text', content: '' }]);
      return;
    }
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleImageSelect = (media: any) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type: 'image',
      content: `${process.env.NEXT_PUBLIC_IMAGE_URL}${media.urlFull}`,
      metadata: { width: '100%', textAlign: 'center', alt: postTitle || '' }
    };
    setBlocks([...blocks, newBlock]);
    setShowGallery(false);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex flex-col w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Editor Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200 sticky top-0 z-20">
        <button 
          type="button" 
          onClick={() => addBlock('text')}
          className="p-2 hover:bg-white rounded-lg transition-all flex items-center gap-2 text-xs font-bold text-gray-600 border border-transparent hover:border-gray-200"
        >
          <span className="material-symbols-outlined text-sm">notes</span>
          Add Text
        </button>
        <button 
          type="button" 
          onClick={() => setShowGallery(true)}
          className="p-2 hover:bg-white rounded-lg transition-all flex items-center gap-2 text-xs font-bold text-gray-600 border border-transparent hover:border-gray-200"
        >
          <span className="material-symbols-outlined text-sm">image</span>
          Add Image
        </button>

        <button 
          type="button" 
          onClick={openHtmlSource}
          className="p-2 hover:bg-white rounded-lg transition-all flex items-center gap-2 text-xs font-bold text-gray-600 border border-transparent hover:border-gray-200 ml-auto"
        >
          <span className="material-symbols-outlined text-sm">code</span>
          Edit HTML
        </button>
      </div>

      {/* Blocks Area */}
      <div className="p-8 min-h-[600px] bg-[#121212] text-white space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="group relative">
            {/* Block Controls */}
            <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
              <button onClick={() => deleteBlock(block.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
              <button onClick={() => addBlock('text', index)} className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>

            {block.type === 'image' ? (
              <ImageBlock 
                src={block.content} 
                metadata={block.metadata} 
                onUpdate={(metadata) => updateBlock(block.id, { metadata })}
              />
            ) : (
              <TextBlock 
                id={block.id}
                type={block.type === 'heading' ? (`h${block.metadata?.level || 2}` as any) : 'p'}
                content={block.content}
                marginTop={0}
                marginBottom={0}
                textAlign={block.metadata?.textAlign || 'left'}
                onUpdate={(updates: any) => {
                  const mappedUpdates: any = { ...updates };
                  if (updates.type) {
                    if (updates.type.startsWith('h')) {
                      mappedUpdates.type = 'heading';
                      mappedUpdates.metadata = { ...(mappedUpdates.metadata || block.metadata), level: parseInt(updates.type.substring(1)) };
                    } else {
                      mappedUpdates.type = 'text';
                    }
                  }
                  if (updates.textAlign) {
                    mappedUpdates.metadata = { ...(mappedUpdates.metadata || block.metadata), textAlign: updates.textAlign };
                    delete mappedUpdates.textAlign;
                  }
                  updateBlock(block.id, mappedUpdates);
                }}
                onRemove={() => deleteBlock(block.id)}
              />
            )}
          </div>
        ))}
      </div>

      {showGallery && mounted && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl">
            <MediaGallery isModal={true} onSelect={handleImageSelect} onClose={() => setShowGallery(false)} />
          </div>
        </div>,
        document.body
      )}

      {/* HTML Source Modal */}
      {showHtmlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined">code</span>
                แก้ไข HTML Source
              </h2>
              <button onClick={() => setShowHtmlModal(false)} className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <textarea
              className="flex-grow bg-[#121212] text-gray-300 font-mono text-sm p-4 rounded border border-[#333] focus:outline-none focus:border-blue-500 min-h-[400px]"
              value={htmlSource}
              onChange={(e) => setHtmlSource(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowHtmlModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">ยกเลิก</button>
              <button onClick={saveHtmlSource} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomEditor;
