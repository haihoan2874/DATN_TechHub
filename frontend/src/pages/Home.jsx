import React, { useState, useEffect } from "react";
import productService from "../services/productService";
import Hero from "../components/home/Hero";
import PromoBanner from "../components/home/PromoBanner";
import CategorySection from "../components/home/CategorySection";
import FeaturedSection from "../components/home/FeaturedSection";
import BenefitsSection from "../components/home/BenefitsSection";
import StorySection from "../components/home/StorySection";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          productService.getAllProducts({ pageSize: 4, isActive: true }),
          productService.getCategories()
        ]);

        if (productResponse?.contents) {
          setFeaturedProducts(productResponse.contents);
        }
        setCategories(categoryResponse?.contents || categoryResponse || []);
      } catch (error) {
        console.error("Home fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col bg-transparent">
      <Hero />
      <PromoBanner />
      <CategorySection categories={categories} />
      <StorySection />
      <FeaturedSection products={featuredProducts} loading={loading} />
      <BenefitsSection />
    </div>
  );
}

export default Home;
