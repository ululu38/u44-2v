'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import ImageResize from 'tiptap-extension-resize-image';
import React, { useState } from 'react';
import MediaGallery from './MediaGallery';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  postTitle?: string;
}

// Extend ImageResize to support custom alignment logic if needed
const CustomImage = ImageResize.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: {
        default: 'center',
        parseHTML: element => element.style.textAlign || 'center',
        renderHTML: attributes => {
          if (!attributes.textAlign) return {};
          
          let margin = '0';
          if (attributes.textAlign === 'center') margin = '0 auto';
          else if (attributes.textAlign === 'right') margin = '0 0 0 auto';
          else margin = '0 auto 0 0';

          return {
            style: `display: block; margin: ${margin}; text-align: ${attributes.textAlign};`,
          };
        },
      },
    };
  },
});

const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange, postTitle }) => {

  const [showGallery, setShowGallery] = useState(false);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl shadow-lg border border-white/10 my-8 transition-all duration-300 hover:shadow-2xl',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],



    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px]',
      },

    },

  });

  if (!editor) return null;

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleHeading = (level: 1 | 2 | 3) => editor.chain().focus().toggleHeading({ level }).run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();

  const setTextAlign = (align: string) => editor.chain().focus().setTextAlign(align).run();
  const setImageSize = (width: string) => editor.chain().focus().updateAttributes('image', { width }).run();
  const setImageAlign = (align: string) => editor.chain().focus().updateAttributes('image', { textAlign: align }).run();

  const handleImageSelect = (media: any) => {
    // Automatically use post title as alt text for SEO
    const altText = postTitle || '';
    
    editor.chain().focus().setImage({ 
      src: `${process.env.NEXT_PUBLIC_API_URL}${media.urlFull}`,
      alt: altText,
    }).run();
    setShowGallery(false);
  };


  const openHtmlSource = () => {
    setHtmlContent(editor.getHTML());
    setShowHtmlModal(true);
  };

  const saveHtmlSource = () => {
    editor.commands.setContent(htmlContent);
    setShowHtmlModal(false);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-200 rounded-t-xl items-center sticky top-0 z-10 text-gray-700">
        <button type="button" onClick={toggleBold} className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-primary !text-white' : ''}`} title="ตัวหนา">
          <span className="material-symbols-outlined text-sm">format_bold</span>
        </button>
        <button type="button" onClick={toggleItalic} className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-primary !text-white' : ''}`} title="ตัวเอียง">
          <span className="material-symbols-outlined text-sm">format_italic</span>
        </button>
        <div className="w-[1px] h-6 bg-gray-200 mx-1" />
        <button type="button" onClick={() => toggleHeading(1)} className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-primary !text-white' : ''}`} title="หัวข้อ 1">
          <span className="font-bold text-xs">H1</span>
        </button>
        <button type="button" onClick={() => toggleHeading(2)} className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-primary !text-white' : ''}`} title="หัวข้อ 2">
          <span className="font-bold text-xs">H2</span>
        </button>
        <button type="button" onClick={() => toggleHeading(3)} className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-primary !text-white' : ''}`} title="หัวข้อ 3">
          <span className="font-bold text-xs">H3</span>
        </button>
        <div className="w-[1px] h-6 bg-gray-200 mx-1" />
        <button type="button" onClick={toggleBulletList} className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-primary !text-white' : ''}`} title="รายการ">
          <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
        </button>
        <button type="button" onClick={toggleOrderedList} className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-primary !text-white' : ''}`} title="รายการลำดับ">
          <span className="material-symbols-outlined text-sm">format_list_numbered</span>
        </button>
        <div className="w-[1px] h-6 bg-gray-200 mx-1" />
        <button type="button" onClick={() => setTextAlign('left')} className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-primary !text-white' : ''}`} title="ชิดซ้าย">
          <span className="material-symbols-outlined text-sm">format_align_left</span>
        </button>
        <button type="button" onClick={() => setTextAlign('center')} className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-primary !text-white' : ''}`} title="กึ่งกลาง">
          <span className="material-symbols-outlined text-sm">format_align_center</span>
        </button>
        <button type="button" onClick={() => setTextAlign('right')} className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-primary !text-white' : ''}`} title="ชิดขวา">
          <span className="material-symbols-outlined text-sm">format_align_right</span>
        </button>
        
        <div className="w-[1px] h-6 bg-gray-200 mx-1" />
        <button type="button" onClick={() => setShowGallery(true)} className="p-2 rounded-lg transition-colors hover:bg-gray-100" title="แทรกรูปภาพ">
          <span className="material-symbols-outlined text-sm">image</span>
        </button>
        
        {/* Image Controls - Only show or enable if image is selected */}
        {editor.isActive('image') && (
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 mr-1 uppercase">Size:</span>
            <button type="button" onClick={() => setImageSize('25%')} className="px-2 py-1 text-[10px] font-bold hover:bg-blue-100 rounded transition-colors">25%</button>
            <button type="button" onClick={() => setImageSize('50%')} className="px-2 py-1 text-[10px] font-bold hover:bg-blue-100 rounded transition-colors">50%</button>
            <button type="button" onClick={() => setImageSize('75%')} className="px-2 py-1 text-[10px] font-bold hover:bg-blue-100 rounded transition-colors">75%</button>
            <button type="button" onClick={() => setImageSize('100%')} className="px-2 py-1 text-[10px] font-bold hover:bg-blue-100 rounded transition-colors">100%</button>
            <div className="w-[1px] h-4 bg-gray-200 mx-1" />
            <button type="button" onClick={() => setImageAlign('left')} className="p-1 hover:bg-blue-100 rounded transition-colors" title="รูปชิดซ้าย">
              <span className="material-symbols-outlined text-xs">align_horizontal_left</span>
            </button>
            <button type="button" onClick={() => setImageAlign('center')} className="p-1 hover:bg-blue-100 rounded transition-colors" title="รูปกึ่งกลาง">
              <span className="material-symbols-outlined text-xs">align_horizontal_center</span>
            </button>
            <button type="button" onClick={() => setImageAlign('right')} className="p-1 hover:bg-blue-100 rounded transition-colors" title="รูปชิดขวา">
              <span className="material-symbols-outlined text-xs">align_horizontal_right</span>
            </button>
          </div>
        )}

        <button type="button" onClick={openHtmlSource} className="p-2 rounded-lg transition-colors hover:bg-gray-100 ml-auto" title="แก้ไข HTML">
          <span className="material-symbols-outlined text-sm">code</span>
        </button>
      </div>


      <div className="public-preview border-x border-b border-gray-200 rounded-b-xl overflow-hidden shadow-inner">
        <EditorContent editor={editor} />
      </div>

      {/* Gallery Modal */}
      {showGallery && (
        <MediaGallery isModal={true} onSelect={handleImageSelect} onClose={() => setShowGallery(false)} />
      )}


      {/* HTML Source Modal */}
      {showHtmlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">แก้ไข HTML Source</h2>
              <button onClick={() => setShowHtmlModal(false)} className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <textarea
              className="flex-grow bg-[#121212] text-gray-300 font-mono text-sm p-4 rounded border border-[#333] focus:outline-none focus:border-blue-500"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
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

export default TipTapEditor;
