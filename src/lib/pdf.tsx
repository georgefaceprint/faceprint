import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, renderToBuffer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  headerLeft: { flexDirection: 'column' },
  headerRight: { flexDirection: 'column', alignItems: 'flex-end', maxWidth: 200 },
  logo: { width: 300, height: 'auto', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  vat: { fontSize: 9, color: '#666', textTransform: 'uppercase' },
  quoteNo: { fontSize: 12, fontWeight: 'bold', marginTop: 15 },
  salesRep: { fontSize: 10, color: '#e11d48', fontStyle: 'italic', marginTop: 2 },
  customerLabel: { fontSize: 10, fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: 5 },
  customerName: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  customerText: { fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
  table: { width: '100%', marginBottom: 30 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc', borderTopWidth: 1, borderTopColor: '#ccc', borderStyle: 'dashed', paddingVertical: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', borderStyle: 'dashed', paddingVertical: 8 },
  col1: { width: '40%', fontSize: 10, fontWeight: 'bold', paddingRight: 5 },
  col2: { width: '10%', fontSize: 10, textAlign: 'center' },
  col3: { width: '15%', fontSize: 10, textAlign: 'right' },
  col4: { width: '15%', fontSize: 10, textAlign: 'right', fontWeight: 'bold' },
  col5: { width: '20%', fontSize: 9, color: '#666', paddingLeft: 10 },
  totals: { borderTopWidth: 1, borderTopColor: '#ccc', borderBottomWidth: 1, borderBottomColor: '#ccc', borderStyle: 'dashed', paddingVertical: 10, flexDirection: 'row', justifyContent: 'flex-end', gap: 20 },
  totalBox: { flexDirection: 'column' },
  totalLabel: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  totalValue: { fontSize: 12 },
  totalValueBold: { fontSize: 14, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#666', lineHeight: 1.5 },
  footerBold: { fontWeight: 'bold' },
  footerRed: { color: '#e11d48', fontWeight: 'bold', fontStyle: 'italic', marginVertical: 5 }
});

const QuoteDocument = ({ job }: { job: any }) => {
  const quoteNumber = job.jobNumber || `JOB-${job.id.substring(0, 8).toUpperCase()}`;
  const quotedDate = new Date(job.createdAt).toLocaleDateString('en-GB');

  const subtotal = job.items.reduce((sum: number, item: any) => sum + item.unitPrice * item.quantity, 0) || job.totalAmount;
  const discountMatch = job.notes?.match(/Discount:\s*([\d.]+)%/);
  const discountPct = discountMatch ? parseFloat(discountMatch[1]) : 0;
  const discountAmount = subtotal * (discountPct / 100);
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * 0.15;
  const total = afterDiscount + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src="/landscape-logo-v2.png" style={styles.logo} />
            <Text style={styles.title}>FacePrint Quote</Text>
            <Text style={styles.vat}>VAT Number 4060259753</Text>
            <Text style={styles.quoteNo}>QUOTE NUMBER {quoteNumber}</Text>
            <Text style={styles.salesRep}>QUOTED BY {job.salesRepId || 'ADMIN'} ({quotedDate})</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.customerLabel}>Customer</Text>
            <Text style={styles.customerName}>{job.client.companyName || job.client.contactName}</Text>
            {job.client.companyName && <Text style={styles.customerText}>{job.client.contactName}</Text>}
            {job.client.addressLine1 && <Text style={styles.customerText}>{job.client.addressLine1}</Text>}
            <Text style={styles.customerText}>{job.client.email}</Text>
            {job.client.phone && <Text style={styles.customerText}>{job.client.phone}</Text>}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>PRODUCT</Text>
            <Text style={styles.col2}>QTY</Text>
            <Text style={styles.col3}>UNIT COST</Text>
            <Text style={styles.col4}>AMOUNT</Text>
            <Text style={styles.col5}>DESCRIPTION</Text>
          </View>
          {job.items.map((item: any, i: number) => {
            const parts = item.description.split(' - ');
            const productName = parts[0];
            const desc = parts.slice(1).join(' - ');
            return (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.col1}>{productName}</Text>
                <Text style={styles.col2}>{item.quantity}</Text>
                <Text style={styles.col3}>{item.unitPrice.toFixed(2)}</Text>
                <Text style={styles.col4}>{(item.unitPrice * item.quantity).toFixed(2)}</Text>
                <Text style={styles.col5}>{desc}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>ZAR {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Discount ({discountPct}%):</Text>
            <Text style={styles.totalValue}>ZAR {discountAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Tax (15%):</Text>
            <Text style={styles.totalValue}>ZAR {tax.toFixed(2)}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValueBold}>ZAR {total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Pullup Print (PTY) Ltd Ta FacePrint ICK 2010/103007/23 | 5 BEACON STREET, MABONENG | NEW DOORFONTEIN</Text>
          <Text>WEBSITE: www.faceprint.co.za | E-MAIL: sales@faceprint.co.za | TEL: 081 393 6500 | CELL: 079 236 0090</Text>
          <Text>Full payment requirement for all orders placed unless otherwise stated. 12 Hr speed service available.</Text>
          <Text style={styles.footerRed}>Use QUOTE NUMBER as REF on EFT payments.</Text>
          <Text>BANKING | <Text style={styles.footerBold}>FNB</Text> | FACEPRINT | <Text style={styles.footerBold}>62219584879</Text> | CODE <Text style={styles.footerBold}>252942</Text></Text>
          <Text>BANKING | <Text style={styles.footerBold}>NEDBANK</Text> | FACEPRINT | <Text style={styles.footerBold}>1249887712</Text> | CODE <Text style={styles.footerBold}>198765</Text></Text>
        </View>
      </Page>
    </Document>
  );
};

export async function generateQuotePdf(job: any): Promise<Buffer> {
  const buffer = await renderToBuffer(<QuoteDocument job={job} />);
  return buffer;
}
