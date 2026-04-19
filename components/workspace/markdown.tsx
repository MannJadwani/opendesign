"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ text }: { text: string }) {
  return (
    <div className="cd-md space-y-2 text-[14px] leading-relaxed text-[#1F1B16]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[#1F1B16]">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-[#D9623A] underline underline-offset-2 hover:text-[#C0462A]"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h1 className="mt-2 text-[16px] font-semibold">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-2 text-[15px] font-semibold">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-2 text-[14px] font-semibold">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="ml-4 list-disc space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="ml-4 list-decimal space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          code: ({ children, className }) => {
            const inline = !className;
            if (inline) {
              return (
                <code className="rounded bg-black/[0.06] px-1 py-0.5 text-[12.5px] text-[#3D3831]">
                  {children}
                </code>
              );
            }
            return (
              <code className="block whitespace-pre-wrap rounded-lg bg-[#1F1B16] px-3 py-2 text-[12px] text-[#F5F0E8]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="overflow-x-auto">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#D9623A] pl-3 text-[#3D3831]">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-2 border-black/10" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
