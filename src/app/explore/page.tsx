
"use client";

import { useState, useEffect } from 'react';
import HotelSearchForm from '@/components/hotel-search-form';
import PopularHotelsSection from '@/components/popular-hotels-section';
import Image from 'next/image';

export default function ExplorePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/30 via-background to-background">
        <div className="absolute inset-0 opacity-30">
          <Image 
            src="https://placehold.co/1920x1080.png"
            alt="Beautiful travel destination"
            layout="fill"
            objectFit="cover"
            quality={80}
            priority
            data-ai-hint="travel landscape"
          />
           <div className="absolute inset-0 bg-black/10"></div> {/* Subtle overlay */}
        </div>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              Find Your <span className="text-primary">Perfect Stay</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
              Discover and book unique accommodations anywhere in the world. Your next adventure starts here.
            </p>
          </div>
          <HotelSearchForm />
        </div>
      </section>

      {/* Popular Hotels Section - Now uses the client component */}
      <PopularHotelsSection />
    </>
  );
}
