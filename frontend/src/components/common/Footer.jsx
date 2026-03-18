import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-gold/20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-black tracking-tighter uppercase italic">
              X <span className="text-gold">MEN</span>
            </h3>
            <p className="text-secondary-brown font-bold opacity-40 text-sm max-w-xs leading-relaxed">
              Elevating the standard of grooming for the modern Ethiopian man. Precision, craft, and luxury in every service.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gold italic">Quick Links</h4>
            <ul className="space-y-4 text-sm font-bold opacity-60">
              <li><a href="/booking" className="hover:text-gold transition-colors">Book Now</a></li>
              <li><a href="/services" className="hover:text-gold transition-colors">Our Services</a></li>
              <li><a href="/queue" className="hover:text-gold transition-colors">Real-time Queue</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gold italic">Contact</h4>
            <ul className="space-y-4 text-sm font-bold opacity-60">
              <li>Addis Ababa, Ethiopia</li>
              <li>+251 911 22 33 44</li>
              <li>contact@xmenhairsalon.com</li>
            </ul>
          </div>
        </div>
        <div className="pt-10 border-t border-border-primary/10 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown opacity-30">
            &copy; {new Date().getFullYear()} X Men's Hair Salon. Crafted for Excellence.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;