import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiClock, FiMessageCircle, FiArrowRight } from 'react-icons/fi';

export default function ContactPage() {
  const contactCards = [
    {
      icon: <FiPhone size={20} />,
      title: 'Call Us',
      desc: 'Speak to our team for product help and orders.',
      action: { label: '+91 98933 69932', href: 'tel:+919893369932' },
      accent: 'bg-brand-50 text-brand-600 border-brand-100',
    },
    {
      icon: <FiMessageCircle size={20} />,
      title: 'WhatsApp Us',
      desc: 'Send your requirement or place an order on chat.',
      action: { label: 'Chat on WhatsApp', href: 'https://wa.me/919893369932', external: true },
      accent: 'bg-success-soft text-success border-success-soft',
    },
    {
      icon: <FiMail size={20} />,
      title: 'Email Us',
      desc: 'Write to us for bulk enquiries and other questions.',
      action: { label: 'info@omelectrical.com', href: 'mailto:info@omelectrical.com' },
      accent: 'bg-navy-50 text-navy-700 border-navy-100',
    },
  ];

  return (
    <div className="container-custom py-10 md:py-14">
      <div className="max-w-2xl mb-10">
        <p className="section-eyebrow mb-2">We're here to help</p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink tracking-tight mb-3">Contact OM Electrical &amp; Hardware</h1>
        <p className="text-ink-soft text-[15px] leading-relaxed">
          Have a question about a product, need a bulk quote, or want to check availability? Reach out by phone, WhatsApp or email — or visit our shop.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Contact methods */}
        <div className="space-y-4">
          {contactCards.map(card => (
            <div key={card.title} className="card p-5 flex items-start gap-4 hover:border-navy-200 transition">
              <span className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${card.accent}`}>{card.icon}</span>
              <div className="flex-1">
                <h2 className="font-display font-bold text-ink text-[16px] mb-0.5">{card.title}</h2>
                <p className="text-sm text-muted mb-2.5">{card.desc}</p>
                <a
                  href={card.action.href}
                  {...(card.action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition"
                >
                  {card.action.label} <FiArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}

          <div className="card p-5 flex items-start gap-4">
            <span className="w-12 h-12 rounded-xl bg-cream border border-navy-100 text-navy-700 flex items-center justify-center shrink-0"><FiClock size={20} /></span>
            <div>
              <h2 className="font-display font-bold text-ink text-[16px] mb-1.5">Store Hours</h2>
              <p className="text-sm text-ink-soft">Monday – Saturday: 9:00 AM – 8:00 PM</p>
              <p className="text-sm text-ink-soft">Sunday: 10:00 AM – 6:00 PM</p>
            </div>
          </div>

          <Link to="/products" className="btn-primary btn-lg w-full">Explore Products <FiArrowRight size={17} /></Link>
        </div>

        {/* Address + Map */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2.5"><FiMapPin size={18} className="text-brand-500" /> Visit Our Shop</h2>
            <p className="text-[15px] text-ink-soft leading-relaxed mb-4">
              Main Road, Amajhir,<br />
              Near Pani Ki Tanki, Post Mograram,<br />
              Jilla Sehore, Madhya Pradesh
            </p>
            <p className="text-sm text-muted">Phone: <a href="tel:+919893369932" className="text-brand-600 font-semibold hover:underline">+91 98933 69932</a></p>
          </div>
          <div className="card overflow-hidden min-h-[320px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3697.5!2d77.0456!3d23.2012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s42J8%2BW3Q+Amajhir%2C+Madhya+Pradesh+466001!5e0!3m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '320px' }}
              allowFullScreen
              loading="lazy"
              title="OM Electrical & Hardware shop location"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
