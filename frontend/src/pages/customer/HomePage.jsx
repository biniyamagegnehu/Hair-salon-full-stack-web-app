import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  CheckBadgeIcon,
  ClockIcon,
  SparklesIcon,
  StarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const primaryButton = 'bg-[#0F0F0F] text-white px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300 font-medium shadow-md hover:shadow-lg';
const outlineButton = 'border-2 border-[#C9A227] text-[#C9A227] px-6 py-3 rounded-lg hover:bg-[#C9A227] hover:text-[#0F0F0F] transition-all duration-300';

const HomePage = () => {
  const navigate = useNavigate();

  const services = [
    { id: 1, name: 'Precision Haircut', price: '350 ETB', duration: '45 min', detail: 'Sharp fades, clean lines, and tailored finishing for everyday polish.' },
    { id: 2, name: 'Beard Grooming', price: '250 ETB', duration: '30 min', detail: 'Detailed shaping, contour cleanup, and beard conditioning.' },
    { id: 3, name: 'Royal Hot Shave', price: '400 ETB', duration: '60 min', detail: 'Traditional razor service with warm towels and soothing care.' },
    { id: 4, name: 'Styling Finish', price: '150 ETB', duration: '15 min', detail: 'Quick texture, hold, and product styling before your next stop.' }
  ];

  const highlights = [
    {
      title: 'Crafted by specialists',
      description: 'Experienced barbers who balance classic technique with modern precision.',
      icon: CheckBadgeIcon
    },
    {
      title: 'Queue-aware convenience',
      description: 'See live flow before arrival and book with confidence around your schedule.',
      icon: ClockIcon
    },
    {
      title: 'Premium finishing',
      description: 'Clean tools, refined products, and an atmosphere that feels intentional.',
      icon: SparklesIcon
    }
  ];

  const testimonials = [
    { id: 1, name: 'Dawit Tekle', text: 'The booking flow is smooth, the queue is transparent, and every cut feels premium from start to finish.' },
    { id: 2, name: 'Michael Gebru', text: 'The team is consistent. I know I can walk in for a polished look before any meeting or event.' },
    { id: 3, name: 'Yohannes Abebe', text: 'The salon feels modern and calm. It is the kind of experience you immediately want to come back to.' }
  ];

  return (
    <div className="space-y-12 lg:space-y-16">
      <section className="overflow-hidden rounded-[32px] border border-black/5 bg-[#0F0F0F] text-white shadow-[0_24px_60px_rgba(15,15,15,0.16)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,162,39,0.18),transparent_30%)]" />
            <div className="relative">
              <span className="inline-flex rounded-full border border-[#C9A227]/30 bg-[#C9A227]/12 px-4 py-2 text-sm font-medium text-[#F8F4EC]">
                Professional grooming, designed around your time
              </span>
              <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                A polished customer experience from booking to final mirror check.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/72">
                Premium haircuts, beard services, and live queue visibility in one clean digital experience tailored for the modern Addis client.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => navigate('/booking')} className={primaryButton}>
                  Book Appointment
                </button>
                <button type="button" onClick={() => navigate('/services')} className={outlineButton}>
                  View Services
                </button>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-3xl font-bold tracking-[-0.04em] text-[#C9A227]">15k+</p>
                  <p className="mt-2 text-sm text-white/65">Satisfied visits completed with a premium standard.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-3xl font-bold tracking-[-0.04em] text-[#C9A227]">10+</p>
                  <p className="mt-2 text-sm text-white/65">Experienced barbers delivering consistent quality.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-3xl font-bold tracking-[-0.04em] text-[#C9A227]">4.9/5</p>
                  <p className="mt-2 text-sm text-white/65">Average client satisfaction across recurring visits.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[320px] lg:min-h-full">
            <img
              src="/assets/barber_shop_hero.png"
              alt="Premium barber workspace"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1400&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F]/55 via-[#0F0F0F]/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/15 bg-black/45 p-5 backdrop-blur-md">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#C9A227]">In-salon feel</p>
              <p className="mt-3 text-sm leading-7 text-white/78">
                Clean environment, attentive service, and clear queue communication before you even step inside.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.title} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8F4EC] text-[#C9A227]">
              <item.icon className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-[#0F0F0F]">{item.title}</h2>
            <p className="mt-3 text-base leading-7 text-gray-700">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[32px] border border-black/5 bg-white px-6 py-10 shadow-sm sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-[#C9A227] px-3 py-1 text-sm font-medium text-[#0F0F0F]">Signature Services</span>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F] sm:text-4xl">Designed for consistency and confidence.</h2>
          </div>
          <button type="button" onClick={() => navigate('/services')} className="inline-flex items-center gap-2 text-sm font-medium text-[#3B2F2F] transition-colors hover:text-[#0F0F0F]">
            Browse all services
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <article key={service.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F0F0F] text-lg font-bold text-[#C9A227]">
                  {service.name.charAt(0)}
                </div>
                <span className="rounded-full bg-[#F8F4EC] px-3 py-1 text-sm font-medium text-[#3B2F2F]">{service.duration}</span>
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-[#0F0F0F]">{service.name}</h3>
              <p className="mt-3 min-h-[84px] text-base leading-7 text-gray-700">{service.detail}</p>
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-lg font-bold text-[#C9A227]">{service.price}</span>
                <button type="button" onClick={() => navigate('/booking')} className="text-sm font-medium text-[#0F0F0F] transition-colors hover:text-[#C9A227]">
                  Book now
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[32px] bg-[#3B2F2F] px-6 py-10 text-white shadow-[0_20px_50px_rgba(59,47,47,0.18)] sm:px-8">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-[#F8F4EC]">Why clients stay</span>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Professional details that make each visit smoother.</h2>
          <div className="mt-8 space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-lg font-bold">Modern scheduling</p>
              <p className="mt-2 text-base leading-7 text-white/70">Choose your service, see availability, and confirm your chair without guesswork.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-lg font-bold">Live queue visibility</p>
              <p className="mt-2 text-base leading-7 text-white/70">Know what is happening in the salon before arrival and reduce wasted waiting time.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-lg font-bold">Clean digital profile</p>
              <p className="mt-2 text-base leading-7 text-white/70">Track appointments, payment flow, and booking history in one place.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-black/5 bg-white px-6 py-10 shadow-sm sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8F4EC] text-[#C9A227]">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-flex rounded-full bg-[#3B2F2F] px-3 py-1 text-sm font-medium text-white">Client feedback</span>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F]">Trusted by returning clients.</h2>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.id} className="rounded-3xl border border-gray-100 bg-[#F8F4EC]/55 p-6">
                <div className="flex items-center gap-1 text-[#C9A227]">
                  {[...Array(5)].map((_, index) => (
                    <StarIcon key={index} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-base leading-7 text-gray-700">&ldquo;{item.text}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F0F0F] text-sm font-bold text-[#C9A227]">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-[#0F0F0F]">{item.name}</p>
                    <p className="text-sm text-[#3B2F2F]/60">Returning client</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-[#C9A227]/20 bg-[linear-gradient(135deg,#fff_0%,#f7f2e7_100%)] px-6 py-10 shadow-sm sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-[#C9A227] px-3 py-1 text-sm font-medium text-[#0F0F0F]">Ready when you are</span>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F] sm:text-4xl">Reserve your next appointment with a cleaner, faster flow.</h2>
            <p className="mt-4 text-base leading-8 text-gray-700">
              See services, choose a time, and follow your queue status without friction. The experience is designed to feel calm, clear, and premium.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => navigate('/booking')} className={primaryButton}>
              Book your chair
            </button>
            <button type="button" onClick={() => navigate('/queue')} className={outlineButton}>
              Check live queue
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
