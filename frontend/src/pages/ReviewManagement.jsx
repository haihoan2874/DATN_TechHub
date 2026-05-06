import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, Trash2, 
  Search, Filter, Calendar, RefreshCw,
  Package, User, Download,
  ExternalLink, CheckCircle2, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import ConfirmModal from '../components/ui/ConfirmModal';
import Button from '../components/ui/Button';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('ALL');
  
  // Selection & Actions
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllReviews();
      setReviews(response.data || response);
    } catch (error) {
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    try {
      await adminService.deleteReview(selectedReview.id);
      toast.success('Đã xóa đánh giá thành công');
      setShowDeleteModal(false);
      fetchReviews();
    } catch (error) {
      toast.error('Lỗi khi xóa đánh giá');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'ALL' || review.rating === parseInt(filterRating);
    
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={12} 
            className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteReview}
        title="Xác nhận xóa đánh giá"
        message="Hành động này sẽ xóa vĩnh viễn đánh giá của khách hàng khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?"
        variant="danger"
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest">
            <Star size={14} className="fill-current" />
            Trải nghiệm khách hàng
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Đánh giá</h1>
        </div>

        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:border-slate-900 transition-all shadow-sm">
             <Download size={14} /> Xuất báo cáo
           </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Tổng số Đánh giá', val: reviews.length, icon: MessageSquare, color: 'blue' },
           { label: 'Đánh giá 5 sao', val: reviews.filter(r => r.rating === 5).length, icon: Star, color: 'amber' },
           { label: 'Điểm trung bình', val: (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1), icon: CheckCircle2, color: 'emerald' },
           { label: 'Cần xử lý', val: reviews.filter(r => r.rating <= 2).length, icon: XCircle, color: 'rose' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                 <stat.icon size={24} className={stat.icon === Star ? "fill-current" : ""} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                 <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Filters & Table Container */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo sản phẩm, người dùng, nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
           <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {['ALL', '5', '4', '3', '2', '1'].map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRating(r)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${filterRating === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {r === 'ALL' ? 'Tất cả' : (
                    <>
                      {r} <Star size={10} className="fill-current" />
                    </>
                  )}
                </button>
              ))}
           </div>
           <button onClick={fetchReviews} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="pl-10 pr-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Sản phẩm</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Khách hàng</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Đánh giá</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Nội dung</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Ngày tạo</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-10 py-8"><div className="h-6 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">Không có dữ liệu</td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="pl-10 pr-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                           <Package size={20} className="text-slate-400" />
                        </div>
                        <div>
                          <div className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight max-w-[200px] truncate">
                            {review.productName}
                          </div>
                          <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                            ID: {review.productId?.substring(0, 8)}... <ExternalLink size={10} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-black italic">
                          {review.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-bold text-slate-700">{review.userName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        {renderStars(review.rating)}
                        <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{review.rating} / 5</div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="max-w-xs">
                        <p className="text-[13px] text-slate-600 font-medium leading-relaxed italic line-clamp-2">
                          "{review.comment || 'Không có nội dung'}"
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setSelectedReview(review); setShowDeleteModal(true); }}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                          title="Xóa đánh giá"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewManagement;
