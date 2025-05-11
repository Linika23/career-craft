
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Copy, FileText as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import type { DynamicFormattedResumeProps } from './dynamic-formatted-resume'; // Import the props type
import { DynamicFormattedResume } from './dynamic-formatted-resume'; // Import the component

interface GeneratedDocumentProps {
  title: string;
  content: string; // Plain text content for downloads and fallback
  fileNamePrefix: string;
  resumeData?: DynamicFormattedResumeProps; // Optional structured data for resume display
}

export function GeneratedDocument({ title, content, fileNamePrefix, resumeData }: GeneratedDocumentProps) {
  const { toast } = useToast();

  const handleDownloadTxt = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({ title: 'Downloaded TXT!', description: `${title} has been downloaded as a TXT file.`, className: 'bg-green-500 text-white' });
  };

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });
      doc.setFont('times', 'normal'); 
      
      const FONT_SIZE = 9.5; 
      const LINE_HEIGHT = 5; 
      const MARGIN = 12; 

      doc.setFontSize(FONT_SIZE);

      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = MARGIN;

      const usableWidth = pageWidth - 2 * MARGIN;
      
      const paragraphs = content.split('\n');
      paragraphs.forEach(paragraph => {
        const lines = doc.splitTextToSize(paragraph, usableWidth);
        
        lines.forEach((lineContent: string) => {
          if (y + LINE_HEIGHT > pageHeight - MARGIN) { 
            // Only add a new page if absolutely necessary for multi-page general documents.
            // For resumes, the AI prompt aims for one-page content.
            // If it's a resume and already on page 1, we try to avoid adding a page.
            // This check could be more sophisticated for strict one-page resumes.
            if (doc.getNumberOfPages() > 1 || y + LINE_HEIGHT > pageHeight - MARGIN - (LINE_HEIGHT*2) /* some buffer */ ) {
                 doc.addPage();
                 y = MARGIN;
            } else if (fileNamePrefix.toLowerCase().includes("resume")) {
                // For resumes, if content overflows slightly, it might be truncated or handled by AI's conciseness.
                // We avoid auto-adding pages for resumes to enforce the one-page goal.
                // If it's truly too long, this will just clip. The AI should make it fit.
            } else {
                 doc.addPage();
                 y = MARGIN;
            }
          }

          const isSectionHeader = lineContent.toUpperCase() === lineContent && lineContent.length > 3 && lineContent.length < 40 && !lineContent.includes(':') && lineContent.trim() !== '' && !lineContent.includes('http') && !lineContent.includes('www') && !/^\s{2,}/.test(lineContent) /* not indented */ ;
          
          let xPosition = MARGIN;
          if (/^\s{2,}/.test(lineContent) && !isSectionHeader) { // Check if line is indented (likely a bullet point)
            xPosition = MARGIN + 5; // Indent bullet points
            lineContent = lineContent.trimLeft(); // Remove leading spaces for text placement
          }


          if (isSectionHeader) {
            doc.setFont('times', 'bold');
            doc.setTextColor(0, 0, 0); // Black
            doc.text(lineContent, xPosition, y);
            doc.setFont('times', 'normal');
          } else {
            const urlRegex = /(\b(?:https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(?:www\.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]/ig;
            let lastIndex = 0;
            let currentX = xPosition;
            let match;
            let lineHasContent = false;

            while ((match = urlRegex.exec(lineContent)) !== null) {
              lineHasContent = true;
              const textBefore = lineContent.substring(lastIndex, match.index);
              if (textBefore) {
                doc.setTextColor(0, 0, 0); // Black
                doc.text(textBefore, currentX, y);
                currentX += doc.getTextWidth(textBefore);
              }

              const url = match[0];
              let fullUrl = url;
              if (!url.match(/^(https?|ftp):\/\//i) && url.startsWith('www.')) {
                fullUrl = `http://${url}`;
              } else if (!url.match(/^(https?|ftp):\/\//i)) {
                 doc.setTextColor(0,0,0);
                 doc.text(url, currentX, y);
                 currentX += doc.getTextWidth(url);
                 lastIndex = urlRegex.lastIndex;
                 continue;
              }
              
              doc.setTextColor(0, 0, 255); // Blue
              doc.textWithLink(url, currentX, y, { url: fullUrl });
              currentX += doc.getTextWidth(url);
              doc.setTextColor(0, 0, 0); // Reset to black

              lastIndex = urlRegex.lastIndex;
            }

            const textAfter = lineContent.substring(lastIndex);
            if (textAfter) {
              lineHasContent = true;
              doc.setTextColor(0, 0, 0); // Black
              doc.text(textAfter, currentX, y);
            }
            
            if (!lineHasContent && lineContent.trim() === '') { 
                // y is incremented below, this just ensures empty lines contribute to spacing
            } else if (!lineHasContent) { // Non-empty line without URLs that wasn't a header
                doc.setTextColor(0, 0, 0);
                doc.text(lineContent, xPosition, y);
            }
          }
          y += LINE_HEIGHT;
        });
        if (paragraph.trim() !== "") { 
            y += LINE_HEIGHT / 3; 
        }
      });
      
      doc.save(`${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: 'Downloaded PDF!', description: `${title} has been downloaded as a PDF file.`, className: 'bg-green-500 text-white' });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ variant: 'destructive', title: 'Error Generating PDF', description: 'Failed to generate PDF. Please try copying the text.' });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: 'Copied!', description: `${title} content copied to clipboard.`, className: 'bg-green-500 text-white' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error Copying', description: `Failed to copy ${title.toLowerCase()} to clipboard.` });
      console.error('Failed to copy: ', err);
    }
  };
  
  const isResume = fileNamePrefix.toLowerCase().includes("resume");

  const linkify = (text: string) => {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%?=~_|])|(\bwww\.[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%?=~_|])/ig;
    const esc = document.createElement('textarea');
    esc.textContent = text;
    const sanitizedText = esc.innerHTML;
    
    return sanitizedText.replace(urlPattern, (url) => {
      let fullUrl = url;
      if (!url.match(/^(https?|ftp|file):\/\//i)) {
        fullUrl = 'http://' + url;
      }
      return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${url}</a>`;
    });
  };


  return (
    <Card className="w-full shadow-xl bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-2xl font-semibold text-primary">{title}</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCopyToClipboard} 
            aria-label={`Copy ${title} content`}
            className="transform hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleDownloadTxt} 
            aria-label={`Download ${title} as TXT`}
            className="transform hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleDownloadPdf} 
            aria-label={`Download ${title} as PDF`}
            className="transform hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            <FileIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full rounded-md border p-4 bg-background">
          {isResume && resumeData ? (
            <DynamicFormattedResume data={resumeData} />
          ) : (
            <div 
              className="text-sm whitespace-pre-wrap break-words font-times-new-roman leading-relaxed"
              dangerouslySetInnerHTML={{ __html: linkify(content) }}
            />
          )}
        </ScrollArea>
      </CardContent>
       <CardFooter className="text-xs text-muted-foreground pt-4">
        <p>Review and edit the generated content. TXT and PDF downloads available. The PDF aims for a single page for resumes; if content is extensive, it may impact readability or flow to a second page. For DOCX or advanced PDF formatting, copy text to your editor.</p>
      </CardFooter>
    </Card>
  );
}
