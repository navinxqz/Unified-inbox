/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    tinymce?: any;
  }
}

interface TinyMceEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export function TinyMceEditor({
  value,
  onChange,
  placeholder = "Start writing topic content...",
  height = 420,
}: TinyMceEditorProps) {
  const containerId = useId().replace(/:/g, "_");
  const editorRef = useRef<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(
    () => typeof window !== "undefined" && Boolean(window.tinymce),
  );
  const [isReady, setIsReady] = useState(false);
  const lastEmittedValue = useRef<string>(value);

  const onChangeRef = useRef(onChange);
  const placeholderRef = useRef(placeholder);
  const heightRef = useRef(height);
  const initialValueRef = useRef(value);

  // Keep latest refs updated outside render
  useEffect(() => {
    onChangeRef.current = onChange;
    placeholderRef.current = placeholder;
    heightRef.current = height;
  });

  // 1. Ensure TinyMCE 8.9.3 is loaded via CDN script
  useEffect(() => {
    if (typeof window === "undefined" || window.tinymce) return;

    const scriptSrc = "https://cdn.jsdelivr.net/npm/tinymce@8.9.3/tinymce.min.js";
    let script = document.querySelector<HTMLScriptElement>(`script[src="${scriptSrc}"]`);

    if (!script) {
      script = document.createElement("script");
      script.src = scriptSrc;
      script.referrerPolicy = "origin";
      script.async = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => setScriptLoaded(true);
    script.addEventListener("load", handleLoad);

    return () => {
      script?.removeEventListener("load", handleLoad);
    };
  }, []);

  // 2. Initialize TinyMCE when script is ready
  useEffect(() => {
    if (!scriptLoaded || typeof window === "undefined" || !window.tinymce) return;

    const targetElement = document.getElementById(containerId);
    if (!targetElement) return;

    let isDisposed = false;

    window.tinymce.init({
      target: targetElement,
      height: heightRef.current,
      menubar: false,
      statusbar: true,
      license_key: "gpl",
      promotion: false,
      browser_spellcheck: true,
      placeholder: placeholderRef.current,
      contextmenu: "link image table spellchecker",
      skin: "oxide",
      skin_url: "https://cdn.jsdelivr.net/npm/tinymce@8.9.3/skins/ui/oxide",
      content_css:
        "https://cdn.jsdelivr.net/npm/tinymce@8.9.3/skins/content/default/content.min.css",
      plugins: [
        "advlist",
        "autolink",
        "lists",
        "image",
        "table",
        "paste",
        "searchreplace",
        "wordcount",
        "spellchecker",
        "print",
        "lineheight",
        "preview",
      ].join(" "),
      toolbar:
        "bold italic underline strikethrough | alignleft aligncenter alignright | bullist numlist | table | fontfamily fontsize lineheight | image | spellcheckdialog | undo redo | preview | print | removeformat",
      font_size_formats:
        "8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt 48pt 72pt",
      lineheight_formats: "1 1.2 1.5 1.6 2 2.5",
      image_title: false,
      image_dimensions: false,
      image_caption: false,
      image_description: false,
      image_advtab: false,
      paste_data_images: true,
      paste_retain_style_properties: "all",
      paste_webkit_styles: "all",
      paste_merge_formats: true,
      paste_word_valid_elements:
        "b,strong,i,em,h1,h2,h3,h4,h5,h6,p,br,ul,ol,li,table,tr,td,th,thead,tbody,span,div,a,blockquote",
      forced_root_block: "p",
      content_style: `
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          padding: 12px;
          color: #1f2937;
        }
        table {
          border: 1px solid #000;
          border-collapse: collapse;
          width: 100%;
          margin: 8px 0;
        }
        th, td {
          border: 1px solid #000;
          padding: 6px 10px;
          text-align: left;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
        p {
          margin: 0 0 8px 0;
        }
      `,
      file_picker_types: "image",
      images_file_types: "jpg,jpeg,png,gif,webp",
      automatic_uploads: true,
      file_picker_callback: (callback: any, _value: string, meta: any) => {
        if (meta.filetype === "image") {
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");
          input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              callback(reader.result as string, { alt: file.name });
            };
            reader.readAsDataURL(file);
          };
          input.click();
        }
      },
      images_upload_handler: (blobInfo: any, progress: (value: number) => void) => {
        return new Promise<string>((resolve, reject) => {
          try {
            const base64 = `data:${blobInfo.blob().type};base64,${blobInfo.base64()}`;
            if (typeof progress === "function") {
              progress(100);
            }
            resolve(base64);
          } catch {
            reject("Image upload failed.");
          }
        });
      },
      setup: (editor: any) => {
        editorRef.current = editor;

        editor.on("init", () => {
          if (isDisposed) {
            editor.remove();
            return;
          }
          setIsReady(true);
          const initial = initialValueRef.current;
          if (initial) {
            editor.setContent(initial);
            lastEmittedValue.current = initial;
          }
        });

        const handleUpdate = () => {
          const newContent = editor.getContent();
          lastEmittedValue.current = newContent;
          onChangeRef.current(newContent);
        };

        editor.on("change keyup undo redo", handleUpdate);
      },
    });

    return () => {
      isDisposed = true;
      if (editorRef.current) {
        try {
          editorRef.current.remove();
        } catch {
          // ignore
        }
        editorRef.current = null;
      }
      setIsReady(false);
    };
  }, [scriptLoaded, containerId]);

  // Synchronize value changes from outside (e.g. form resets or external topic loading)
  useEffect(() => {
    if (editorRef.current && isReady) {
      if (value !== lastEmittedValue.current) {
        editorRef.current.setContent(value || "");
        lastEmittedValue.current = value || "";
      }
    }
  }, [value, isReady]);

  return (
    <div className="relative min-h-[420px] w-full rounded-lg border border-border bg-white">
      {!isReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-surface/50 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="inline-block size-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading rich editor...
          </div>
        </div>
      )}
      <textarea
        id={containerId}
        defaultValue={value}
        className="w-full opacity-0"
        style={{ minHeight: `${height}px` }}
      />
    </div>
  );
}
