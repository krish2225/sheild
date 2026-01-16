import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { ok, created, badRequest, serverError } from '../utils/response.js';

export const generateReport = async (req, res) => {
  const { format = 'pdf', period = 'weekly', startDate, endDate, contents = [] } = req.body;
  if (!startDate || !endDate) return badRequest(res, 'startDate and endDate required');

  try {
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
      const doc = new PDFDocument();
      doc.pipe(res);
      doc.fontSize(18).text('Predictive Maintenance Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Period: ${period}`);
      doc.text(`From: ${startDate} To: ${endDate}`);
      doc.moveDown();
      doc.text('Contents:');
      contents.forEach((c) => doc.text(`- ${c}`));
      doc.end();
    } else {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Report');
      sheet.addRow(['Predictive Maintenance Report']);
      sheet.addRow([`Period: ${period}`]);
      sheet.addRow([`From: ${startDate} To: ${endDate}`]);
      sheet.addRow([]);
      sheet.addRow(['Contents']);
      contents.forEach((c) => sheet.addRow([c]));
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    return serverError(res, err);
  }
};


