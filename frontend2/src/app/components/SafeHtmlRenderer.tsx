'use client';

import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import parse, { Element } from 'html-react-parser';
import { OptimizedHtmlImage } from './OptimizedHtmlImage';

interface SafeHtmlRendererProps {
  html: string;
  className?: string;
}

export function SafeHtmlRenderer({ html, className = '' }: SafeHtmlRendererProps) {
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'blockquote',
        'code', 'pre', 'hr', 'video', 'source', 'iframe', 'figure', 'figcaption'
      ],
      ALLOWED_ATTR: [
        'class', 'style', 'src', 'alt', 'title', 'width', 'height', 'loading',
        'href', 'target', 'rel', 'data-*', 'id', 'role', 'aria-*', 'controls',
        'controlsList', 'poster', 'playsinline', 'frameborder', 'allow', 'allowfullscreen'
      ],
      KEEP_CONTENT: true,
      FORCE_BODY: false,
    });
  }, [html]);

  const options = {
    replace: (domNode: any) => {
      if (domNode instanceof Element && domNode.name === 'img') {
        const src = domNode.attribs.src || '';
        const alt = domNode.attribs.alt || 'Image';
        const width = parseInt(domNode.attribs.width) || null;
        const height = parseInt(domNode.attribs.height) || null;
        const title = domNode.attribs.title || alt;
        const className = domNode.attribs.class || '';

        return (
          <OptimizedHtmlImage
            key={src}
            src={src}
            alt={alt}
            title={title}
            width={width}
            height={height}
            className={className}
          />
        );
      }
    },
  };

  return (
    <div className={`safe-html-content ${className}`}>
      {parse(sanitizedHtml, options)}
    </div>
  );
}
