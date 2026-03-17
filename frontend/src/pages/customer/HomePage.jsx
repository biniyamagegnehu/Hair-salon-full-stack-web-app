import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button/Button';
import Card, { CardBody, CardImage } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const services = [
    { id: 1, name: 'Precision Haircut', price: '$35', duration: '45 min', icon: '💇‍♂️' },
    { id: 2, name: 'Beard Grooming', price: '$25', duration: '30 min', icon: '🧔' },
    { id: 3, name: 'Royal Hot Shave', price: '$40', duration: '60 min', icon: '🪒' },
    { id: 4, name: 'Styling & Wax', price: '$15', duration: '15 min', icon: '✨' },
  ];

  const testimonials = [
    { id: 1, name: 'Dawit Tekle', text: 'Best grooming experience in the city. The attention to detail is unmatched.', rating: 5 },
    { id: 2, name: 'Michael Gebru', text: 'Premium atmosphere and highly skilled barbers. X Men is my go-to place.', rating: 5 },
    { id: 3, name: 'Yohannes Abebe', text: 'The queue system is a game changer. No more waiting aimlessly.', rating: 4 },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <img 
          src="/assets/barber_shop_hero.png" 
          alt="Premium Barber Shop" 
          className="hero-image"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1920&q=80' }}
        />
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-headline">
            Experience <span className="text-gold">Perfection</span> <br /> 
            in Every Cut.
          </h1>
          <p className="hero-subheadline">
            Premium grooming services for the modern Ethiopian man. Where traditional techniques meet contemporary style.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="gold" size="lg" onClick={() => navigate('/booking')}>
              Book Appointment
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/services')}>
              View Services
            </Button>
          </div>
          
          {/* Floating Stats */}
          <div className="stats-card">
            <div className="stat-item">
              <span className="stat-value">15k+</span>
              <span className="stat-label">Happy Clients</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">10+</span>
              <span className="stat-label">Expert Barbers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">4.9/5</span>
              <span className="stat-label">Client Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Highlight */}
      <section className="section-padding-top mt-24">
        <div className="container">
          <div className="section-header">
            <Badge variant="gold" className="mb-4">Our Services</Badge>
            <h2 className="section-title">Masterpiece Grooming</h2>
          </div>
          
          <div className="services-grid">
            {services.map((service) => (
              <Card key={service.id} variant="interactive" className="animate-fade-in">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gold font-black">{service.price}</span>
                  <span className="text-xs opacity-60 uppercase">{service.duration}</span>
                </div>
                <Button variant="text" size="sm" className="mt-4 !p-0" onClick={() => navigate('/services')}>
                  View Details &rarr;
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding features-section mt-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="feature-item">
              <span className="feature-icon">✂️</span>
              <h3 className="text-xl font-bold mb-4">Master Craftsmanship</h3>
              <p className="opacity-70">Our barbers are world-class professionals with years of experience in modern and classic styles.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✨</span>
              <h3 className="text-xl font-bold mb-4">Premium Products</h3>
              <p className="opacity-70">We only use high-end, dermatologist-tested grooming products tailored for Ethiopian skin and hair.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛋️</span>
              <h3 className="text-xl font-bold mb-4">Luxury Atmosphere</h3>
              <p className="opacity-70">Relax in our sophisticated environment with complimentary beverages and entertainment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <Badge variant="brown" className="mb-4">Testimonials</Badge>
            <h2 className="section-title">What Our Men Say</h2>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <Card key={t.id} variant="gold-border" className="transition-all hover:scale-105">
                <div className="rating-stars">
                  {'★'.repeat(t.rating)}{'☆'.repeat(5-t.rating)}
                </div>
                <p className="italic mb-6 text-lg">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-gold font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <span className="font-bold">{t.name}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final Booking CTA */}
      <section className="booking-cta-section">
        <div className="container">
          <h2 className="booking-cta-title">Ready for Your Next Look?</h2>
          <p className="booking-cta-text">
            Join the elite circle of X Men. Fast booking, real-time queue, and unparalleled service.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/booking')}>
            Check Real-time Queue & Book
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;