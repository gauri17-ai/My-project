import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

/**
 * Generates a styled PDF buffer from Markdown text.
 */
export const generatePDF = (title: string, content: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      // Title Section
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#1e1b4b').text(title, { align: 'center' });
      doc.moveDown(1.5);

      const lines = content.split('\n');

      for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
          doc.moveDown(0.4);
          continue;
        }

        // Parse markdown headers
        if (line.startsWith('# ')) {
          doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e1b4b').text(line.substring(2));
          doc.moveDown(0.6);
        } else if (line.startsWith('## ')) {
          doc.fontSize(14).font('Helvetica-Bold').fillColor('#4338ca').text(line.substring(3));
          doc.moveDown(0.5);
        } else if (line.startsWith('### ')) {
          doc.fontSize(12).font('Helvetica-Bold').fillColor('#4f46e5').text(line.substring(4));
          doc.moveDown(0.4);
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          // List Item
          const text = line.substring(2).replace(/\*\*/g, '');
          doc.fontSize(10).font('Helvetica').fillColor('#334155').text(`\u2022   ${text}`, {
            indent: 15,
            lineGap: 3
          });
          doc.moveDown(0.3);
        } else {
          // Regular text
          const cleanText = line.replace(/\*\*/g, '');
          doc.fontSize(10).font('Helvetica').fillColor('#334155').text(cleanText, {
            lineGap: 3,
            align: 'justify'
          });
          doc.moveDown(0.5);
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generates a styled Word (.docx) buffer from Markdown text.
 */
export const generateDOCX = (title: string, content: string): Promise<Buffer> => {
  const lines = content.split('\n');
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 }
    })
  );

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: line.substring(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 }
        })
      );
    } else if (line.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: line.substring(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 }
        })
      );
    } else if (line.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: line.substring(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 60 }
        })
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      children.push(
        new Paragraph({
          text: line.substring(2).replace(/\*\*/g, ''),
          bullet: { level: 0 },
          spacing: { after: 100 }
        })
      );
    } else {
      const cleanText = line.replace(/\*\*/g, '');
      children.push(
        new Paragraph({
          children: [new TextRun(cleanText)],
          spacing: { after: 120 }
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children
      }
    ]
  });

  return Packer.toBuffer(doc);
};
