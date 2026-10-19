"use client";
import { uploadImage as uploadAdminAsset, uiRequest } from '@/admin-ui/api';
import React, { useEffect, useState } from 'react';
import { Search, Trash2, CheckCircle, XCircle, Star, ShieldCheck, Clock, Plus, X, UploadCloud, Download, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { getSafeImageSrc } from '../utils/images';

interface ParsedCsvRow {
  rowNumber: number;
  customer_name: string;
  rating: number;
  review_title: string;
  review_text: string;
  review_date?: string;
  verified_purchase: boolean;
  isValid: boolean;
  error?: string;
}

function parseCsv(content: string): ParsedCsvRow[] {
  const clean = content.replace(/^\uFEFF/, '').trim();
  if (!clean) return [];

  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && clean[i + 1] === '\n') i++;
      if (currentLine.trim()) lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += char;
      }
    }
    cells.push(cell.trim());
    return cells;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_-]+/g, '_'));
  const nameIdx = headers.findIndex(h => h === 'customer_name' || h === 'name' || h === 'reviewer_name' || h === 'reviewername');
  const ratingIdx = headers.findIndex(h => h === 'rating' || h === 'stars' || h === 'star_rating');
  const textIdx = headers.findIndex(h => h === 'review_text' || h === 'content' || h === 'text' || h === 'review');
  const titleIdx = headers.findIndex(h => h === 'review_title' || h === 'title' || h === 'headline');
  const dateIdx = headers.findIndex(h => h === 'review_date' || h === 'date' || h === 'created_at');
  const verifiedIdx = headers.findIndex(h => h === 'verified_purchase' || h === 'verified');

  const rows: ParsedCsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (!cells.some(c => c.length > 0)) continue;

    const rawName = nameIdx >= 0 ? cells[nameIdx] : cells[0] || '';
    const rawRating = ratingIdx >= 0 ? cells[ratingIdx] : cells[1] || '';
    const rawTitle = titleIdx >= 0 ? cells[titleIdx] : '';
    const rawText = textIdx >= 0 ? cells[textIdx] : (titleIdx >= 0 ? cells[3] : cells[2]) || '';
    const rawDate = dateIdx >= 0 ? cells[dateIdx] : undefined;
    const rawVerified = verifiedIdx >= 0 ? cells[verifiedIdx] : undefined;

    const ratingNum = Number(rawRating);
    let isValid = true;
    let error = '';

    if (!rawName || rawName.trim().length < 2) {
      isValid = false;
      error = 'Name must be at least 2 characters';
    } else if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      isValid = false;
      error = 'Rating must be an integer (1-5)';
    } else if (!rawText || rawText.trim().length < 10) {
      isValid = false;
      error = 'Review text must be at least 10 characters';
    }

    rows.push({
      rowNumber: i,
      customer_name: rawName.trim(),
      rating: ratingNum,
      review_title: rawTitle.trim(),
      review_text: rawText.trim(),
      review_date: rawDate?.trim() || undefined,
      verified_purchase: String(rawVerified).toLowerCase() === 'true' || rawVerified === '1',
      isValid,
      error
    });
  }

  return rows;
}

export const ReviewsPage: React.FC = () => {
  const { reviews, products, addReview, updateReviewStatus, deleteReview, confirm, showToast, reload } = useAdminUI();
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Review Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productId, setProductId] = useState('');
  useEffect(() => {
    if (products.length && !products.some(product => product.id === productId)) {
      setProductId(products[0].id);
    }
  }, [products, productId]);

  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [verifiedPurchase, setVerifiedPurchase] = useState(true);
  const [imagePreview, setImagePreview] = useState('');

  // CSV Import Modal State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvProductId, setCsvProductId] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedCsvRow[]>([]);
  const [csvImportApproved, setCsvImportApproved] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    total: number;
    imported: number;
    skipped: number;
    rejected: number;
    errors: Array<{ row: number; name?: string; reason: string }>;
  } | null>(null);

  useEffect(() => {
    if (products.length && !products.some(p => p.id === csvProductId)) {
      setCsvProductId(products[0].id);
    }
  }, [products, csvProductId]);

  const counts = {
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length
  };

  // Calculate actual approved reviews average rating (not fabricated)
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const avgRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
    : '0.0';

  const filtered = reviews.filter(r => {
    const matchStatus = !statusFilter || r.status === statusFilter;
    const matchRating = !ratingFilter || r.rating === Number(ratingFilter);
    const matchSearch = !searchQuery ||
      r.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchRating && matchSearch;
  });

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!reviewerName.trim() || !content.trim()) return;
      const prod = products.find(p => p.id === productId);
      if (!prod) {
        showToast('Choose a product before adding the review.', 'error');
        return;
      }
      await addReview({
        productId,
        productName: prod?.name || 'Skincare Item',
        reviewerName: reviewerName.trim(),
        rating,
        title: title.trim(),
        content: content.trim(),
        verifiedPurchase,
        imageUrl: imagePreview || undefined,
        source: 'admin',
        status: 'approved'
      });
      setIsAddModalOpen(false);
      setReviewerName('');
      setTitle('');
      setContent('');
      setImagePreview('');
    } catch {
      // Error handled by admin mutation toast
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const isConfirmed = await confirm({
        title: 'Delete this review?',
        description: 'The review will be permanently removed.',
        cancelLabel: 'Cancel',
        confirmLabel: 'Delete Review',
        destructive: true
      });
      if (isConfirmed) {
        await deleteReview(id);
      }
    } catch {
      // Error handled by admin mutation toast
    }
  };

  const downloadSampleCsv = () => {
    const sample = `customer_name,rating,review_title,review_text,review_date,verified_purchase
Ayesha Malik,5,Soft and gentle texture,Cream achi hai texture bhi soft hai daily routine mein use karna asaan hai.,2026-10-15,true
Fatima Noor,5,Loved the consistency,Mujhe iski consistency bohat achi lagi apply karna bhi easy hai.,2026-10-16,true
Zainab Ahmed,4,Lightweight finish,Halka texture hai skin par heavy feel nahi hota daily use ke liye acha hai.,2026-10-17,false`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leva_sample_reviews.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      showToast('Please select a valid .csv file.', 'error');
      return;
    }

    setCsvFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result || '');
      const rows = parseCsv(text);
      if (rows.length === 0) {
        showToast('The CSV file does not contain any valid review rows.', 'error');
      }
      setParsedRows(rows);
    };
    reader.onerror = () => {
      showToast('Could not read the CSV file. Please try again.', 'error');
    };
    reader.readAsText(file);
  };

  const executeCsvImport = async () => {
    if (!csvProductId) {
      showToast('Please select a product for the imported reviews.', 'error');
      return;
    }
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      showToast('No valid review rows to import.', 'error');
      return;
    }

    setIsImporting(true);
    try {
      const payload = {
        productId: csvProductId,
        status: csvImportApproved ? 'approved' : 'pending',
        reviews: validRows.map(r => ({
          customer_name: r.customer_name,
          rating: r.rating,
          review_title: r.review_title,
          review_text: r.review_text,
          review_date: r.review_date,
          verified_purchase: r.verified_purchase
        }))
      };

      const result = await uiRequest<{
        success: boolean;
        total: number;
        imported: number;
        skipped: number;
        rejected: number;
        errors: Array<{ row: number; name?: string; reason: string }>;
      }>('reviews/admin/import-csv', 'POST', payload);

      setImportResult(result);
      showToast(`Imported ${result.imported} reviews (${result.skipped} skipped, ${result.rejected} rejected).`, 'success');
      await reload();
    } catch (err: any) {
      showToast(err?.message || 'CSV Import failed. Please check backend response.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const resetCsvModal = () => {
    setIsCsvModalOpen(false);
    setParsedRows([]);
    setCsvFileName('');
    setImportResult(null);
  };

  return (
    <div className="space-y-6 font-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#382b31]">Customer Reviews & UGC</h1>
          <p className="text-xs text-[#382b31]/50 font-medium">Moderate incoming product reviews, approve testimonials, and add manual UGC feedback.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { resetCsvModal(); setIsCsvModalOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-white border border-[#ecdfe4] hover:bg-[#FFF4F6] text-[#673742] px-4 py-2.5 text-xs font-bold shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" /> Import Reviews (CSV)
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#673742] to-[#673742] hover:opacity-95 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Manual Review
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#ecdfe4] shadow-xs">
          <span className="text-[11px] font-bold text-[#382b31]/50 uppercase tracking-wider block">Total Reviews</span>
          <span className="font-heading font-black text-2xl text-[#382b31] mt-1 block">{reviews.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#ecdfe4] shadow-xs">
          <span className="text-[11px] font-bold text-[#673742] uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Approval
          </span>
          <span className="font-heading font-black text-2xl text-[#673742] mt-1 block">{counts.pending}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#ecdfe4] shadow-xs">
          <span className="text-[11px] font-bold text-[#673742] uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Approved Reviews
          </span>
          <span className="font-heading font-black text-2xl text-[#673742] mt-1 block">{counts.approved}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#ecdfe4] shadow-xs">
          <span className="text-[11px] font-bold text-[#673742] uppercase tracking-wider block flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-current" /> Average Rating
          </span>
          <span className="font-heading font-black text-2xl text-[#382b31] mt-1 block">{avgRating} / 5.0</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-[#ecdfe4]/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search reviewer or review text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#ecdfe4] outline-none"
          />
          <Search className="w-4 h-4 text-[#382b31]/40 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-[#ecdfe4] bg-white outline-none"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={ratingFilter}
            onChange={e => setRatingFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-[#ecdfe4] bg-white outline-none"
          >
            <option value="">All Star Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-[#ecdfe4]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#382b31]/80">
            <thead className="bg-[#FFF4F6] text-[#382b31]/40 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 pl-6">Reviewer & Product</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Feedback</th>
                <th className="p-4">Source</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(rev => (
                <tr key={rev.id} className="hover:bg-[#FFF4F6]/80 transition-colors">
                  <td className="p-4 pl-6">
                    <div>
                      <span className="font-heading font-bold text-[#382b31] block">{rev.reviewerName}</span>
                      <span className="text-[10px] text-[#673742] block font-semibold">
                        {rev.productName || products.find(p => p.id === rev.productId)?.name || 'General Review'}
                      </span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#673742] bg-[#FFF4F6] px-1.5 py-0.5 rounded border border-[#ecdfe4] mt-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex text-[#673742]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 max-w-sm">
                    {rev.title && <span className="font-bold text-xs text-[#382b31] block mb-0.5">{rev.title}</span>}
                    <p className="text-xs text-[#382b31]/70 leading-relaxed line-clamp-2">{rev.content}</p>
                    {rev.imageUrl && (
                      <img src={getSafeImageSrc(rev.imageUrl)} alt="UGC photo" className="w-10 h-10 object-cover rounded-lg mt-2 border border-[#ecdfe4]" />
                    )}
                  </td>
                  <td className="p-4">
                    <span className="capitalize text-[11px] font-semibold text-[#382b31]/60">{rev.source}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                      rev.status === 'approved'
                        ? 'bg-[#FFF4F6] text-[#673742]'
                        : rev.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rev.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-1.5">
                    {rev.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={async () => await updateReviewStatus(rev.id, 'approved')}
                        className="p-1.5 text-[#673742] hover:bg-[#FFF4F6] rounded-lg transition-colors"
                        title="Approve Review"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {rev.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={async () => await updateReviewStatus(rev.id, 'rejected')}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Reject Review"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#382b31]/40 text-sm">
                    No reviews match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Bulk Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl p-6 border border-[#ecdfe4] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#ecdfe4] pb-3 mb-4">
              <div>
                <h3 className="font-heading font-black text-lg text-[#382b31] flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[#673742]" /> Bulk Import Product Reviews (CSV)
                </h3>
                <p className="text-xs text-[#382b31]/50 mt-0.5">
                  Import multiple verified or customer-submitted reviews for a specific product.
                </p>
              </div>
              <button type="button" onClick={resetCsvModal} className="text-[#382b31]/40 hover:text-[#382b31] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Product Selector */}
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Target Product *</label>
                <select
                  required
                  value={csvProductId}
                  onChange={e => setCsvProductId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 bg-white outline-none"
                >
                  {!products.length && <option value="">No products available</option>}
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
                  ))}
                </select>
                <p className="text-[11px] text-[#382b31]/50 mt-1">
                  All imported reviews in this batch will be associated with the selected product.
                </p>
              </div>

              {/* Template Download & File Select */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FFF4F6] rounded-2xl border border-[#ecdfe4]">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#673742] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#382b31] block">Standard CSV Format</span>
                    <span className="text-[11px] text-[#382b31]/60">customer_name, rating, review_title, review_text, review_date</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#673742] bg-white rounded-xl border border-[#ecdfe4] hover:bg-white/80 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
              </div>

              {/* Upload Input */}
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Select CSV File</label>
                <input
                  type="file"
                  accept=".csv, text/csv"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-[#382b31]/70 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#673742] file:text-white hover:file:opacity-90"
                />
                {csvFileName && (
                  <p className="text-xs font-semibold text-[#673742] mt-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> {csvFileName} ({parsedRows.length} rows parsed)
                  </p>
                )}
              </div>

              {/* Import as approved option */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="csv-import-approved"
                  checked={csvImportApproved}
                  onChange={e => setCsvImportApproved(e.target.checked)}
                  className="rounded text-[#673742]"
                />
                <label htmlFor="csv-import-approved" className="text-xs font-bold text-[#382b31]/80 cursor-pointer">
                  Import as Approved (bypass pending queue for verified historical reviews)
                </label>
              </div>
              <p className="text-[11px] text-[#382b31]/50 -mt-2 pl-5">
                Leave unchecked to import into the moderation queue as Pending Approval.
              </p>

              {/* Preview Table */}
              {parsedRows.length > 0 && (
                <div className="border border-[#ecdfe4] rounded-2xl overflow-hidden mt-3">
                  <div className="bg-[#FFF4F6] px-4 py-2 border-b border-[#ecdfe4] flex items-center justify-between text-xs font-bold text-[#382b31]">
                    <span>Row Preview & Validation</span>
                    <span className="text-[11px] text-[#382b31]/60">
                      {parsedRows.filter(r => r.isValid).length} valid of {parsedRows.length} rows
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] text-[#382b31]/50 uppercase font-bold sticky top-0">
                        <tr>
                          <th className="p-2.5 pl-4">#</th>
                          <th className="p-2.5">Customer</th>
                          <th className="p-2.5">Rating</th>
                          <th className="p-2.5">Content Preview</th>
                          <th className="p-2.5 pr-4 text-right">Validation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedRows.map(row => (
                          <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                            <td className="p-2.5 pl-4 font-mono text-[10px] text-[#382b31]/50">{row.rowNumber}</td>
                            <td className="p-2.5 font-bold text-[#382b31]">{row.customer_name || '—'}</td>
                            <td className="p-2.5">
                              <span className="inline-flex items-center gap-0.5 font-bold text-[#673742]">
                                {row.rating} <Star className="w-3 h-3 fill-current inline" />
                              </span>
                            </td>
                            <td className="p-2.5 max-w-xs truncate text-[#382b31]/70">
                              {row.review_title ? `"${row.review_title}" — ` : ''}{row.review_text}
                            </td>
                            <td className="p-2.5 pr-4 text-right">
                              {row.isValid ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  <CheckCircle className="w-3 h-3" /> Valid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full" title={row.error}>
                                  <AlertCircle className="w-3 h-3" /> {row.error}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Results Banner */}
              {importResult && (
                <div className={`p-4 rounded-2xl border text-xs ${
                  importResult.imported > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <h4 className="font-bold flex items-center gap-1.5 text-sm mb-1">
                    {importResult.imported > 0 ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    Import Results Summary
                  </h4>
                  <p>
                    <strong>{importResult.imported}</strong> reviews successfully saved. 
                    {importResult.skipped > 0 && ` (${importResult.skipped} duplicates skipped)`}
                    {importResult.rejected > 0 && ` (${importResult.rejected} rows rejected)`}
                  </p>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2 text-[11px] space-y-1">
                      <span className="font-bold block">Details:</span>
                      {importResult.errors.slice(0, 5).map((e, idx) => (
                        <p key={idx}>Row {e.row}: {e.name ? `${e.name} — ` : ''}{e.reason}</p>
                      ))}
                      {importResult.errors.length > 5 && (
                        <p className="text-[10px] italic">...and {importResult.errors.length - 5} more</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#ecdfe4] mt-4">
              <button
                type="button"
                onClick={resetCsvModal}
                className="px-4 py-2 text-xs font-bold text-[#382b31]/60 hover:bg-slate-100 rounded-xl"
              >
                {importResult ? 'Close' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={executeCsvImport}
                disabled={isImporting || parsedRows.filter(r => r.isValid).length === 0}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#673742] hover:bg-[#673742]/90 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    Confirm & Import ({parsedRows.filter(r => r.isValid).length} rows)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#ecdfe4] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ecdfe4] pb-3 mb-4">
              <h3 className="font-heading font-black text-base text-[#382b31]">Add Manual UGC Review</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-[#382b31]/40">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Product *</label>
                <select
                  required
                  value={productId}
                  onChange={e => setProductId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 bg-white"
                >
                  {!products.length && <option value="">No products available</option>}
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={e => setReviewerName(e.target.value)}
                    placeholder="e.g. Fatima M."
                    className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={e => setRating(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 bg-white"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Review Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Cleared my hyperpigmentation"
                  className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Review Content *</label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Customer feedback details..."
                  className="w-full text-xs rounded-xl border border-[#ecdfe4] p-3 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rev-verified"
                  checked={verifiedPurchase}
                  onChange={e => setVerifiedPurchase(e.target.checked)}
                  className="rounded text-[#673742]"
                />
                <label htmlFor="rev-verified" className="text-xs font-bold text-[#382b31]/70 cursor-pointer">
                  Mark as Verified Purchase
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Photo Upload (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    try {
                      if (e.target.files?.[0]) {
                        setImagePreview(await uploadAdminAsset(e.target.files[0]));
                      }
                    } catch {
                      // Handled by uploadAdminAsset toast
                    }
                  }}
                  className="text-xs"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl mt-2 border" />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#ecdfe4]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#382b31]/60 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!products.length}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#673742] hover:bg-[#673742] rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
