import Hero from './components/Hero';
import WhyChooseUs from './components/WhyChooseUs';
import FeaturedFood from './components/FeaturedFood';

export default function Home() {
  return (
    <main>
      <div className="page-container">
        <Hero />
        <FeaturedFood />
        <WhyChooseUs />
      </div>
    </main>
  );
}
