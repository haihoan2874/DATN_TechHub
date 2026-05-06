import React, { useState, useEffect } from "react";
import productService from "../services/productService";
import Hero from "../components/home/Hero";
import CategorySection from "../components/home/CategorySection";
import FeaturedSection from "../components/home/FeaturedSection";
import BenefitsSection from "../components/home/BenefitsSection";
import CTASection from "../components/home/CTASection";
import StorySection from "../components/home/StorySection";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await productService.getAllProducts({ pageSize: 4 });
        if (response && response.contents) {
          setFeaturedProducts(response.contents);
        }
      } catch (error) {
        console.error("Home fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col bg-white">
      <Hero />
      <CategorySection />
      <StorySection />
      <FeaturedSection products={featuredProducts} loading={loading} />
      <BenefitsSection />
      <CTASection />
    </div>
  );
}

export default Home;
