import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

function CTASection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent opacity-50" />
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-tight tracking-tighter">
            {user ? "Sẵn sàng nâng tầm sức khỏe cùng S-LIFE?" : "Sẵn sàng để bắt đầu hành trình sống khỏe?"}
          </h2>
          <p className="text-slate-500 text-xl mb-12 max-w-2xl mx-auto">
            {user ? "Chào mừng bạn quay trở lại! Khám phá ngay những thiết bị công nghệ sức khỏe mới nhất dành riêng cho bạn." : "Tham gia cùng cộng đồng S-LIFE ngay hôm nay để nhận những ưu đãi độc quyền và công nghệ sức khỏe mới nhất."}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
             <Button 
               onClick={() => navigate(user ? '/shop' : '/register')}
               size="lg"
               className="px-16 py-8 text-lg rounded-[32px] shadow-2xl shadow-blue-600/30"
             >
               {user ? "Mua sắm ngay" : "Đăng ký nhận ưu đãi 20%"}
             </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
