'use client';

import Image from 'next/image';
import { Clock, BookOpen, UtensilsCrossed, Heart } from 'lucide-react';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.heroSection}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>About MUNCHBOX</h1>
            <p className={styles.heroDescription}>
              Are you hungry? We are open to take orders from <span className={styles.highlight}>10am to 10pm</span> everyday!
            </p>
            <p className={styles.heroSubtext}>
              Located in the heart of <span className={styles.highlight}>Veritas University, Abuja</span>, MUNCHBOX is your go-to spot for <span className={styles.highlight}>delicious meals</span> and <span className={styles.highlight}>good moods</span>.
            </p>
            <div className={styles.centeredImage}>
              <div className={styles.imageBackdrop}></div>
              <Image
                src="/Untitled design.jpg"
                alt="MUNCHBOX Cafe"
                width={1000}
                height={600}
                className={styles.aboutImage}
                priority
              />
            </div>
          </div>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.promosSection}>
            <div className={styles.promosGrid}>
              <div className={styles.promoCard}>
                <div className={styles.promoImageWrapper}>
                  <Image
                    src="/image (7)-Photoroom.png"
                    alt="Read and Refuel Promo"
                    width={800}
                    height={1000}
                    className={styles.promoImage}
                  />
                </div>
              </div>

              <div className={styles.promoCard}>
                <div className={styles.promoImageWrapper}>
                  <Image
                    src="/Untitled design (2)-Photoroom.png"
                    alt="Special Promo"
                    width={800}
                    height={1000}
                    className={styles.promoImage}
                  />
                </div>
                <div className={styles.promoDetails}>
                  <h3 className={styles.smallTitle}>Happy Loaded Fry</h3>
                  <p className={styles.smallDescription}>Our signature fries loaded with cheese, special sauce, and happiness!</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.storySection}>
            <div className={styles.storyCard}>
              <div className={styles.iconWrapper}>
                <UtensilsCrossed size={32} />
              </div>
              <h2>Our Story</h2>
              <p>
                MUNCHBOX is proudly located in Veritas University, Abuja. We believe in "Good Food, Good Mood".
                From our signature burgers to our loaded fries, every meal is prepared with fresh ingredients
                and served with a smile.
              </p>
            </div>

            <div className={styles.missionCard}>
              <div className={styles.iconWrapper}>
                <Heart size={32} />
              </div>
              <h3>Our Mission</h3>
              <p>
                To provide an exceptional dining experience that brings joy to every customer.
                Whether you're grabbing a quick lunch or ordering dinner for the dorm, we're here
                everyday from 10am to 10pm.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main >
  );
}